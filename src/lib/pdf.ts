import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { capitalizarNombre } from './text'

export async function generarDiplomaPDF(nombre: string): Promise<Buffer> {
  // 1. Cargar la imagen base del diploma desde /public
  const imagePath = path.join(process.cwd(), 'public', 'diploma-base.png')
  
  let imageBytes: Buffer
  try {
    imageBytes = fs.readFileSync(imagePath)
  } catch (error) {
    throw new Error('No se encontró la imagen base del diploma en public/diploma-base.png')
  }

  // 2. Crear un nuevo documento PDF
  const pdfDoc = await PDFDocument.create()
  
  // 3. Incrustar la imagen PNG (debe ser PNG exported de Canva)
  const pngImage = await pdfDoc.embedPng(imageBytes)
  const pngDims = pngImage.scale(1) // Escala 1:1

  // 4. Añadir una página con las dimensiones de la imagen
  const page = pdfDoc.addPage([pngDims.width, pngDims.height])
  
  // 5. Dibujar la imagen de fondo
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: pngDims.width,
    height: pngDims.height,
  })

  // 6. Incrustar la fuente
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // 7. Normalizar el nombre: primera letra de cada nombre/apellido en mayúscula,
  // sin importar cómo lo haya escrito la persona al registrarse
  const nombreFormateado = capitalizarNombre(nombre)

  // 8. Configuración de texto
  const textSize = 72
  const textWidth = font.widthOfTextAtSize(nombreFormateado, textSize)

  // Centrar el texto horizontalmente
  const x = (pngDims.width / 2) - (textWidth / 2)
  // Posición vertical: 46.7% desde arriba (53.3% desde abajo), calibrada para el espacio
  // en blanco entre "otorgado a" y la línea, sobre el diploma-base.png actual
  const y = (pngDims.height * 0.533)

  // 9. Dibujar el texto (nombre) encima de la imagen
  page.drawText(nombreFormateado, {
    x,
    y,
    size: textSize,
    font: font,
    color: rgb(0.145, 0.129, 0.38), // Color #252161, tomado del texto del diploma
  })

  // 10. Serializar el PDF a bytes (Buffer)
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
