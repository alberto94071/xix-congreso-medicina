'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function registrarAsistente(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const correo = formData.get('correo') as string
  const celular = formData.get('celular') as string
  const colegiado = (formData.get('colegiado') as string) || ''
  const genero = formData.get('genero') as string
  const tipo = (formData.get('tipo') as string) || 'Doctor'
  const clave = formData.get('clave') as string

  if (!nombre || !correo || !celular || !genero || !clave) {
    return { error: 'Por favor completa todos los campos requeridos.' }
  }

  try {
    // 1. Verificar la clave
    const config = await prisma.configuracion.findFirst({
      where: { clave: 'REGISTRO_PASSWORD' }
    })
    
    // Si la clave en la DB existe y no coincide con la ingresada, error
    if (config && config.valor && config.valor !== clave) {
      return { error: 'La palabra clave es incorrecta.' }
    }

    // 2. Registrar al asistente
    await prisma.asistente.create({
      data: {
        nombre,
        correo,
        celular,
        colegiado,
        genero,
        tipo,
        estado: 'Pendiente'
      }
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'Este correo ya ha sido registrado.' }
    }
    return { error: 'Ocurrió un error al registrarse. Inténtalo de nuevo.' }
  }
}
