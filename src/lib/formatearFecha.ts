/** Formato relativo corto para fechas de modificacion en listados (hoy · HH:MM, ayer · HH:MM, etc). */
export function formatearFecha(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  // Comparar dias calendario (medianoche a medianoche en hora local), no la
  // diferencia cruda de milisegundos: con Math.ceil sobre milisegundos,
  // cualquier hora del mismo dia ya redondeaba para arriba a "ayer".
  const inicioDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((inicioDia(now) - inicioDia(date)) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `hoy · ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `ayer · ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${diffDays} días atrás`;
  }
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}
