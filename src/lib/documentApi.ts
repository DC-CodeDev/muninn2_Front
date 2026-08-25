// Cliente delgado sobre fetch para la jerarquia recursiva de organizacion de
// Muninn v2 (Area > arbol de Carpetas/Documentos de profundidad variable)
// contra el backend. Sin estado propio: eso vive en useDocumentAutosave y en
// los hooks/componentes de UI.

import type { ColorArea } from './colores';

const DEFAULT_BACKEND_URL = 'http://localhost:7001';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;

/**
 * Regex de validacion de un segmento individual de la jerarquia (nombre de
 * area, carpeta o documento). Solo permite letras, numeros, guiones y
 * guiones bajos. Se aplica a UN segmento por vez — nunca a un path completo
 * armado a mano. Misma regla que aplica el backend (segmentoValido en
 * lib/storage.ts).
 */
export const NOMBRE_VALIDO = /^[a-zA-Z0-9_-]+$/;

export interface AreaMeta {
  nombre: string;
  color: ColorArea;
}

export type TipoEntrada = 'carpeta' | 'documento';

/**
 * Identifica un documento de forma completa dentro del arbol recursivo:
 * area + ruta de carpetas contenedoras (puede ser `[]`, raiz del area) +
 * nombre del documento. Es lo que el editor necesita para saber que
 * endpoint llamar al leer/guardar — reemplaza el `nombre` plano de la
 * jerarquia fija anterior.
 */
export interface UbicacionDocumento {
  area: string;
  ruta: string[];
  documento: string;
}

export interface EntradaArbol {
  nombre: string;
  fechaModificacion: string;
  tipo: TipoEntrada;
}

function urlAreas(): string {
  return `${BACKEND_URL}/api/areas`;
}

/** Arma la URL de /tree o /tree/<segmento>/<segmento>/... a partir de un array de segmentos. */
function urlArbol(area: string, ruta: string[]): string {
  const base = `${urlAreas()}/${encodeURIComponent(area)}/tree`;
  if (ruta.length === 0) return base;
  return `${base}/${ruta.map(encodeURIComponent).join('/')}`;
}

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ==================== Areas ====================

/** Crea un area nueva con su color (uno de c1..c8). */
export async function crearArea(nombre: string, color: ColorArea): Promise<void> {
  const response = await postJson(urlAreas(), { nombre, color });

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => null);
    throw new Error(cuerpo?.error ?? `Error al crear el área (status ${response.status})`);
  }
}

/** Lista las areas existentes con su color. */
export async function listarAreas(): Promise<AreaMeta[]> {
  const response = await fetch(urlAreas());

  if (!response.ok) {
    throw new Error(`Error al listar las áreas (status ${response.status})`);
  }

  return response.json();
}

/**
 * Elimina un area completa: su directorio en el filesystem (con todo su
 * contenido) y su fila de metadata en SQLite.
 */
export async function eliminarArea(nombre: string): Promise<void> {
  const response = await fetch(`${urlAreas()}/${encodeURIComponent(nombre)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => null);
    throw new Error(cuerpo?.error ?? `Error al eliminar el área (status ${response.status})`);
  }
}

// ==================== Arbol (Carpetas + Documentos, recursivo) ====================

/**
 * Lista el contenido mixto (carpetas + documentos) de `ruta` dentro de
 * `area`. `ruta` vacio lista la raiz del area (el propio directorio del
 * Area, sin subcarpeta implicita).
 */
export async function listarArbol(area: string, ruta: string[]): Promise<EntradaArbol[]> {
  const response = await fetch(urlArbol(area, ruta));

  if (!response.ok) {
    throw new Error(`Error al listar el árbol (status ${response.status})`);
  }

  return response.json();
}

/**
 * Crea una Carpeta llamada `nombreCarpeta` dentro de `ruta` (la ubicacion
 * padre; `[]` es la raiz del area). Lanza si ya existe una carpeta o
 * documento con ese nombre en esa ubicacion (409, ver backend).
 */
export async function crearCarpeta(
  area: string,
  ruta: string[],
  nombreCarpeta: string,
): Promise<void> {
  const response = await postJson(urlArbol(area, [...ruta, nombreCarpeta]), {
    tipo: 'carpeta',
  });

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => null);
    throw new Error(cuerpo?.error ?? `Error al crear la carpeta (status ${response.status})`);
  }
}

/**
 * Elimina la Carpeta o Documento llamado `nombre` dentro de `ruta` (la
 * ubicacion padre; `[]` es la raiz del area). Si es una carpeta, se borra
 * junto con todo su contenido.
 */
export async function eliminarEntrada(area: string, ruta: string[], nombre: string): Promise<void> {
  const response = await fetch(urlArbol(area, [...ruta, nombre]), { method: 'DELETE' });

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => null);
    throw new Error(cuerpo?.error ?? `Error al eliminar (status ${response.status})`);
  }
}

/**
 * Mueve la Carpeta o Documento llamado `nombre` (dentro de `ruta`, la
 * ubicacion actual) a la carpeta `destino`, dentro de la misma `area`
 * (mover entre areas distintas no esta soportado). El nombre no cambia,
 * solo su ubicacion padre. Lanza si ya existe algo con ese nombre en
 * `destino` (409) o si se intenta mover una carpeta dentro de si misma o de
 * su propio contenido (400).
 */
export async function moverEntrada(
  area: string,
  ruta: string[],
  nombre: string,
  destino: string[],
): Promise<void> {
  const response = await fetch(urlArbol(area, [...ruta, nombre]), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destino }),
  });

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => null);
    throw new Error(cuerpo?.error ?? `Error al mover (status ${response.status})`);
  }
}

/**
 * Lee el contenido SFDT de `nombreDocumento` dentro de `ruta`. Devuelve
 * `null` si el documento todavia no existe (404) — comportamiento esperado
 * en el primer uso. Lanza excepcion ante cualquier otro error.
 */
export async function leerDocumento(
  area: string,
  ruta: string[],
  nombreDocumento: string,
): Promise<unknown | null> {
  const response = await fetch(urlArbol(area, [...ruta, nombreDocumento]));

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Error al cargar el documento (status ${response.status})`);
  }

  return response.json();
}

/**
 * Guarda (crea o sobreescribe) el contenido SFDT de `nombreDocumento`
 * dentro de `ruta`. `sfdt` es el string devuelto por
 * `documentEditor.serialize()`.
 */
export async function guardarDocumento(
  area: string,
  ruta: string[],
  nombreDocumento: string,
  sfdt: string,
): Promise<void> {
  // El body ya es un string SFDT serializado (documentEditor.serialize()),
  // no lo volvemos a envolver en JSON.stringify — se manda tal cual, a
  // diferencia de putJson (que serializa un objeto).
  const response = await fetch(urlArbol(area, [...ruta, nombreDocumento]), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: sfdt,
  });

  if (!response.ok) {
    const cuerpo = await response.json().catch(() => null);
    throw new Error(cuerpo?.error ?? `Error al guardar el documento (status ${response.status})`);
  }
}
