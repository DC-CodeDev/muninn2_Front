import { useCallback, useEffect, useRef, useState } from 'react';
import type { DocumentEditor } from '@syncfusion/ej2-react-documenteditor';
import { leerDocumento, guardarDocumento, type UbicacionDocumento } from '../lib/documentApi';

const AUTOSAVE_DEBOUNCE_MS = 5000;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Encapsula la carga inicial, el autosave con debounce y el guardado
 * manual de un documento contra el backend. No conoce el componente
 * de React que lo usa: recibe un getter para acceder a la instancia
 * `DocumentEditor` de Syncfusion en el momento en que la necesita.
 *
 * `ubicacion` (area + ruta + nombre del documento) puede ser null (p.ej.
 * mientras no hay documento activo). En ese caso, las operaciones de
 * carga/guardado no se ejecutan.
 */
export function useDocumentAutosave(
  ubicacion: UbicacionDocumento | null,
  getEditor: () => DocumentEditor | null | undefined,
) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Evitan que dos guardados corran en paralelo (p.ej. click en "Guardar"
  // mientras un autosave ya esta en curso): mientras `isSavingRef` esta en
  // true, un nuevo pedido de guardado solo marca `pendingSaveRef` en vez de
  // disparar otra request; al terminar el guardado en curso se relanza uno
  // solo mas, con el contenido mas reciente en ese momento.
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);

  // Promesa del guardado en curso (incluyendo la repeticion encadenada por
  // `pendingSaveRef`, si la hay). `saveNow` la devuelve para que un caller
  // que necesite la confirmacion del guardado (p.ej. el cambio de
  // documento activo) pueda hacer `await` en vez de dispararlo y seguir.
  const inFlightSaveRef = useRef<Promise<void> | null>(null);

  const clearPendingSave = useCallback(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const performSave = useCallback(async () => {
    // No guardar si no hay documento activo.
    if (!ubicacion) return;

    const editor = getEditor();
    if (!editor) return;

    isSavingRef.current = true;
    setStatus('saving');
    try {
      const sfdt = editor.serialize();
      await guardarDocumento(ubicacion.area, ubicacion.ruta, ubicacion.documento, sfdt);
      setStatus('saved');
    } catch (err) {
      console.error(`Error guardando documento "${ubicacion.documento}":`, err);
      setStatus('error');
    } finally {
      isSavingRef.current = false;
    }

    // Se resuelve la promesa de este `performSave` recien cuando termina
    // tambien la repeticion encadenada (si la hubo), para que quien este
    // esperando el `await` reciba la confirmacion del guardado con el
    // contenido mas reciente, no solo del primer intento.
    if (pendingSaveRef.current) {
      pendingSaveRef.current = false;
      await performSave();
    }
  }, [getEditor, ubicacion]);

  const saveNow = useCallback((): Promise<void> => {
    clearPendingSave();

    if (isSavingRef.current) {
      // Ya hay una request en curso: no se dispara una en paralelo, se
      // encola una unica repeticion para cuando termine. Se devuelve la
      // promesa del guardado en curso, que ahora encadena esa repeticion.
      pendingSaveRef.current = true;
      return inFlightSaveRef.current ?? Promise.resolve();
    }

    const promise = performSave();
    inFlightSaveRef.current = promise;
    return promise;
  }, [clearPendingSave, performSave]);

  const scheduleSave = useCallback(() => {
    clearPendingSave();
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      saveNow();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [clearPendingSave, saveNow]);

  const loadInitial = useCallback(async () => {
    // No cargar si no hay documento activo.
    if (!ubicacion) return;

    const editor = getEditor();
    if (!editor) return;

    try {
      const contenido = await leerDocumento(ubicacion.area, ubicacion.ruta, ubicacion.documento);
      if (contenido !== null) {
        editor.open(JSON.stringify(contenido));
      } else {
        // Documento nuevo: limpiar el editor para que arranque vacio.
        // Esto es necesario porque el editor ya puede tener contenido
        // del documento anterior al cambiar de documento.
        editor.openBlank();
      }
    } catch (err) {
      console.error(`Error cargando documento "${ubicacion.documento}":`, err);
      setStatus('error');
    }
  }, [getEditor, ubicacion]);

  // Limpia el timer pendiente si el componente se desmonta o si cambia la ubicacion.
  useEffect(() => {
    return () => {
      clearPendingSave();
      pendingSaveRef.current = false;
    };
  }, [ubicacion, clearPendingSave]);

  return { status, loadInitial, scheduleSave, saveNow };
}
