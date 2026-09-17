export function capitalizarNombre(nombre: string): string {
  if (!nombre) return nombre

  return nombre
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_match, separador, letra) => separador + letra.toUpperCase())
}
