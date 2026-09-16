'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function guardarClave(clave: string) {
  await prisma.configuracion.upsert({
    where: { id: 1 },
    update: { clave: 'REGISTRO_PASSWORD', valor: clave },
    create: { id: 1, clave: 'REGISTRO_PASSWORD', valor: clave }
  })
  
  revalidatePath('/admin')
  return { success: true }
}

import { Resend } from 'resend'
import { generarDiplomaPDF } from '@/lib/pdf'

// En desarrollo podemos omitir la API key real
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy')

export async function enviarDiplomas(ids: number[]) {
  const asistentes = await prisma.asistente.findMany({
    where: { id: { in: ids } }
  })

  if (asistentes.length === 0) return { error: 'No se encontraron asistentes' }

  let enviados = 0
  
  for (const asistente of asistentes) {
    try {
      const prefijo = asistente.genero === 'M' ? 'Dr.' : asistente.genero === 'F' ? 'Dra.' : ''
      const nombreCompleto = `${prefijo} ${asistente.nombre}`.trim()

      // Generar PDF
      const pdfBuffer = await generarDiplomaPDF(nombreCompleto)

      // Enviar correo (Si no hay API key real, esto fallará, debes configurarla en Vercel)
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'Congreso Medicina <diplomas@tu-dominio.com>', // Debe ser un dominio verificado en Resend
          to: [asistente.correo],
          subject: 'Tu Diploma de Asistencia - XIX Congreso de Medicina',
          html: `<p>Hola ${nombreCompleto},</p><p>Adjunto encontrarás tu diploma de asistencia al XIX Congreso de Medicina.</p><p>¡Gracias por participar!</p>`,
          attachments: [
            {
              filename: `Diploma_${asistente.nombre.replace(/\s+/g, '_')}.pdf`,
              content: pdfBuffer,
            }
          ]
        })
      }

      // Marcar como enviado
      await prisma.asistente.update({
        where: { id: asistente.id },
        data: { estado: 'Enviado' }
      })
      enviados++
    } catch (e) {
      console.error('Error enviando a', asistente.correo, e)
    }
  }

  revalidatePath('/admin')
  return { success: true, count: enviados }
}
