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
          from: 'XIX Congreso de Medicina <diplomas@xixcongresomedsm.online>',
          to: [asistente.correo],
          subject: 'Tu Diploma de Asistencia - XIX Congreso de Medicina',
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <!-- Header Institucional -->
              <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #3b82f6 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                  XIX Congreso Regional de Medicina
                </h1>
                <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.95; font-style: italic; color: #93c5fd;">
                  "Sin olvidar los fundamentos básicos de la medicina"
                </p>
              </div>

              <!-- Cuerpo del mensaje -->
              <div style="padding: 32px 24px; color: #334155; line-height: 1.6;">
                <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; margin-bottom: 16px;">
                  Estimado(a) ${nombreCompleto},
                </h2>

                <p style="margin-bottom: 16px; font-size: 15px;">
                  Reciba un cordial y respetuoso saludo en nombre del Comité Organizador del <strong>XIX Congreso Regional de Medicina</strong>.
                </p>

                <p style="margin-bottom: 16px; font-size: 15px;">
                  Queremos expresar nuestro más sincero agradecimiento y felicitación por su valiosa participación y asistencia activa durante este evento académico. Su compromiso con la actualización médica continua enriquece el ejercicio de nuestra profesión y eleva el nivel de la atención en salud.
                </p>

                <!-- Destacado del Diploma -->
                <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin: 24px 0;">
                  <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">
                    📜 Adjunto a este correo electrónico encontrará su <strong>Diploma de Asistencia Oficial</strong> en formato PDF, listo para descargar e imprimir.
                  </p>
                </div>

                <p style="margin-bottom: 24px; font-size: 15px;">
                  Le deseamos el mayor de los éxitos en sus actividades profesionales y académicas diarias, esperando contar nuevamente con su destacada presencia en nuestras próximas ediciones.
                </p>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

                <!-- Firma -->
                <div style="font-size: 13px; color: #64748b;">
                  <p style="margin: 0 0 4px 0; font-weight: bold; color: #0f172a;">Atentamente,</p>
                  <p style="margin: 0 0 2px 0; font-weight: 600; color: #3b82f6;">Comité Organizador</p>
                  <p style="margin: 0;">XIX Congreso Regional de Medicina</p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
                <p style="margin: 0;">Este es un mensaje automático institucional de envío de constancias.</p>
                <p style="margin: 4px 0 0 0;">© 2026 XIX Congreso Regional de Medicina. Todos los derechos reservados.</p>
              </div>
            </div>
          `,
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
