// Cliente delgado sobre fetch para el endpoint de documentos del backend.
// Sin estado propio: eso vive en useDocumentAutosave.

const DEFAULT_BACKEND_URL = 'http://localhost:7001';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;

function urlFor(nombre: string): string {
  return `${BACKEND_URL}/api/documents/${nombre}`;
}

/**
 * Regex de validacion de nombres de documentos.
 * Solo permite letras, numeros, guiones y guiones bajos.
 * Usado tanto en frontend (prompt de nuevo documento) como
 * referencia del backend que aplica la misma validacion.
 */
export const NOMBRE_VALIDO = /^[a-zA-Z0-9_-]+$/;

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

/**
 * Lista todos los documentos existentes en el backend con sus metadatos.
 * Devuelve un array de objetos con nombre y ultima modificacion.
 */
export async function listDocuments(): Promise<
  Array<{ nombre: string; ultimaModificacion: string }>
> {
  const response = await fetch(`${BACKEND_URL}/api/documents/`);

  if (!response.ok) {
    throw new Error(`Error al listar documentos (status ${response.status})`);
  }

  return response.json();
}
