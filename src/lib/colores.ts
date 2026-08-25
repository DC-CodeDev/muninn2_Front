// Paleta fija de 8 colores de Area. El backend solo conoce los identificadores
// c1..c8 (persistidos en SQLite, ver backend/src/lib/db.ts) — la conversion a
// hex vive exclusivamente aca, para no mezclar presentacion con la capa de API.
// Valores y nombres tal como los documenta la seccion 3b/1d del sistema de
// diseño de referencia.

export const COLORES_AREA = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'] as const;

export type ColorArea = (typeof COLORES_AREA)[number];

export const COLOR_HEX: Record<ColorArea, string> = {
  c1: '#E8564B', // rojo
  c2: '#F0872E', // naranja
  c3: '#E8C33A', // ámbar
  c4: '#6DBE4A', // verde
  c5: '#35BFA0', // turquesa
  c6: '#3D9BE8', // azul
  c7: '#8B6DE8', // violeta
  c8: '#E85A9B', // magenta
};

export function esColorArea(valor: unknown): valor is ColorArea {
  return typeof valor === 'string' && (COLORES_AREA as readonly string[]).includes(valor);
}

/** Convierte un identificador c1..c8 a su hex. Cae a text-muted si llega algo inesperado. */
export function colorAHex(color: string): string {
  return esColorArea(color) ? COLOR_HEX[color] : '#6E6A63';
}
