// Cliente delgado sobre fetch para el endpoint de documentos del backend.
// Sin estado propio: eso vive en useDocumentAutosave.

const DEFAULT_BACKEND_URL = 'http://localhost:7001';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;

function urlFor(nombre: string): string {
  return `${BACKEND_URL}/api/documents/${nombre}`;
}

/**
 * Obtiene el contenido SFDT guardado de un documento.
 * Devuelve `null` si el documento todavia no existe (404), que es el
 * comportamiento esperado en el primer uso. Lanza excepcion ante
 * cualquier otro error (red, 500, etc.).
 */
export async function getDocument(nombre: string): Promise<unknown | null> {
  const response = await fetch(urlFor(nombre));

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Error al cargar el documento (status ${response.status})`);
  }

  return response.json();
}

/**
 * Guarda el contenido SFDT de un documento. `sfdt` es el string devuelto
 * por `documentEditor.serialize()`.
 */
export async function saveDocument(nombre: string, sfdt: string): Promise<void> {
  const response = await fetch(urlFor(nombre), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: sfdt,
  });

  if (!response.ok) {
    throw new Error(`Error al guardar el documento (status ${response.status})`);
  }
}
