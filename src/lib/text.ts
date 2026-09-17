// Utilidades de texto compartidas entre la generación de PDF y la vista de impresión.

// Convierte un nombre a "Title Case": la primera letra de cada nombre/apellido en
// mayúscula, el resto en minúscula, sin importar cómo lo haya escrito la persona
// al registrarse (todo en mayúsculas, todo en minúsculas, mezclado, etc.).
// También capitaliza después de guiones y apóstrofes (p. ej. "maría-jose" -> "María-Jose").
export function capitalizarNombre(nombre: string): string {
  if (!nombre) return nombre

  return nombre
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_match, separador, letra) => separador + letra.toUpperCase())
}

// Quita "Dr."/"Dra." (con o sin punto, una o más veces) del inicio del nombre. Se usa
// antes de anteponer el prefijo calculado por género, para no duplicarlo cuando la
// persona ya escribió su propio título al registrarse (p. ej. "Dra Julieta..." o
// "Dr. Antulio...").
export function limpiarTituloDuplicado(nombre: string): string {
  if (!nombre) return nombre
  return nombre.replace(/^(?:(?:dra|dr)\.?\s+)+/i, '').trim()
}

interface DatosNombreAsistente {
  nombre: string
  genero?: string | null
  tipo?: string | null
}

// Arma "Dr./Dra. Nombre Apellido" a partir de los datos del asistente, evitando que el
// título salga duplicado si la persona ya lo incluyó en el campo de nombre.
export function construirNombreCompleto({ nombre, genero, tipo }: DatosNombreAsistente): string {
  const esDoctor = (tipo || 'Doctor') !== 'General'
  const prefijo = esDoctor ? (genero === 'M' ? 'Dr.' : genero === 'F' ? 'Dra.' : '') : ''
  const nombreSinTitulo = limpiarTituloDuplicado(nombre)
  return `${prefijo} ${nombreSinTitulo}`.trim()
}
