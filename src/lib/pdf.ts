import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

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

  // 7. Configuración de texto
  const textSize = 50
  const textWidth = font.widthOfTextAtSize(nombre, textSize)
  
  // Centrar el texto horizontalmente
  const x = (pngDims.width / 2) - (textWidth / 2)
  // Posición vertical (Ajustar este valor dependiendo del diseño de Canva)
  // pdf-lib tiene el origen (0,0) en la esquina inferior izquierda.
  const y = (pngDims.height / 2) - 20 

  // 8. Dibujar el texto (nombre) encima de la imagen
  page.drawText(nombre, {
    x,
    y,
    size: textSize,
    font: font,
    color: rgb(0.1, 0.1, 0.1), // Color casi negro
  })

  // 9. Serializar el PDF a bytes (Buffer)
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
