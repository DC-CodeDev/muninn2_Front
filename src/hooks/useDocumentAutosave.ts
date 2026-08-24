import { useCallback, useEffect, useRef, useState } from 'react';
import type { DocumentEditor } from '@syncfusion/ej2-react-documenteditor';
import { getDocument, saveDocument } from '../lib/documentApi';

const AUTOSAVE_DEBOUNCE_MS = 5000;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Encapsula la carga inicial, el autosave con debounce y el guardado
 * manual de un documento contra el backend. No conoce el componente
 * de React que lo usa: recibe un getter para acceder a la instancia
 * `DocumentEditor` de Syncfusion en el momento en que la necesita.
 *
 * El nombre puede ser null (p.ej. mientras no hay documento activo).
 * En ese caso, las operaciones de carga/guardado no se ejecutan.
 */
export function useDocumentAutosave(
  nombre: string | null,
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

  const clearPendingSave = useCallback(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const performSave = useCallback(async () => {
    // No guardar si no hay nombre de documento activo.
    if (!nombre) return;

    const editor = getEditor();
    if (!editor) return;

    isSavingRef.current = true;
    setStatus('saving');
    try {
      const sfdt = editor.serialize();
      await saveDocument(nombre, sfdt);
      setStatus('saved');
    } catch (err) {
      console.error(`Error guardando documento "${nombre}":`, err);
      setStatus('error');
    } finally {
      isSavingRef.current = false;
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        void performSave();
      }
    }
  }, [getEditor, nombre]);

  const saveNow = useCallback(() => {
    clearPendingSave();

    if (isSavingRef.current) {
      // Ya hay una request en curso: no se dispara una en paralelo, se
      // encola una unica repeticion para cuando termine.
      pendingSaveRef.current = true;
      return;
    }

    void performSave();
  }, [clearPendingSave, performSave]);

  const scheduleSave = useCallback(() => {
    clearPendingSave();
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      saveNow();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [clearPendingSave, saveNow]);

  const loadInitial = useCallback(async () => {
    // No cargar si no hay nombre de documento activo.
    if (!nombre) return;

    const editor = getEditor();
    if (!editor) return;

    try {
      const contenido = await getDocument(nombre);
      if (contenido !== null) {
        editor.open(JSON.stringify(contenido));
      } else {
        // Documento nuevo: limpiar el editor para que arranque vacio.
        // Esto es necesario porque el editor ya puede tener contenido
        // del documento anterior al cambiar de documento.
        editor.openBlank();
      }
    } catch (err) {
      console.error(`Error cargando documento "${nombre}":`, err);
      setStatus('error');
    }
  }, [getEditor, nombre]);

  // Limpia el timer pendiente si el componente se desmonta o si cambia el nombre.
  useEffect(() => {
    return () => {
      clearPendingSave();
      pendingSaveRef.current = false;
    };
  }, [nombre, clearPendingSave]);

  return { status, loadInitial, scheduleSave, saveNow };
}
