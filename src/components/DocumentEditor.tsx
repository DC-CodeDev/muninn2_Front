import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';
import { useDocumentAutosave, type SaveStatus } from '../hooks/useDocumentAutosave';

// Módulos necesarios para habilitar la toolbar del contenedor.
DocumentEditorContainerComponent.Inject(Toolbar);

// Default local: apunta al contenedor Docker del Word Processor Server
// (ver backend/docker-compose.yml y backend/README.md).
const DEFAULT_SERVICE_URL = 'http://localhost:7002/api/documenteditor/';

/**
 * Editor de documentos tipo Word con paginado A4 real (Syncfusion Document
 * Editor), conectado al backend propio para persistir un documento.
 * Recibe el nombre del documento como prop; puede ser null (editor vacio).
 */
interface DocumentEditorProps {
  nombre: string | null;
  onStatusChange?: (status: SaveStatus) => void;
}

export default function DocumentEditor({ nombre, onStatusChange }: DocumentEditorProps) {
  const serviceUrl =
    import.meta.env.VITE_SYNCFUSION_SERVICE_URL || DEFAULT_SERVICE_URL;

  const containerRef = useRef<DocumentEditorContainerComponent>(null);
  const getEditor = useCallback(() => containerRef.current?.documentEditor, []);

  const [isEditorReady, setIsEditorReady] = useState(false);

  const { status, loadInitial, scheduleSave } = useDocumentAutosave(
    nombre,
    getEditor,
  );

  // Notificar al componente padre sobre cambios de estado
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // Cargar el documento cada vez que cambia el nombre (solo si el editor ya está listo).
  useEffect(() => {
    if (isEditorReady && nombre) {
      void loadInitial();
    }
  }, [nombre, isEditorReady, loadInitial]);

  return (
    <DocumentEditorContainerComponent
      ref={containerRef}
      id="muninn-document-editor"
      height="100%"
      width="100%"
      style={{ display: 'block' }}
      enableToolbar={true}
      serviceUrl={serviceUrl}
      created={() => setIsEditorReady(true)}
      contentChange={() => scheduleSave()}
    />
  );
}
