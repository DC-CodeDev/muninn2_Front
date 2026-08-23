import { useCallback, useRef } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';
import { useDocumentAutosave } from '../hooks/useDocumentAutosave';

// Módulos necesarios para habilitar la toolbar del contenedor.
DocumentEditorContainerComponent.Inject(Toolbar);

// Default local: apunta al contenedor Docker del Word Processor Server
// (ver backend/docker-compose.yml y backend/README.md).
const DEFAULT_SERVICE_URL = 'http://localhost:7002/api/documenteditor/';

// Etapa 2: un solo documento fijo, sin selector ni multi-documento todavia.
const NOMBRE_DOCUMENTO = 'documento-principal';

/**
 * Editor de documentos tipo Word con paginado A4 real (Syncfusion Document
 * Editor), conectado al backend propio para persistir un unico documento
 * fijo: carga su contenido SFDT al montar y lo guarda con autosave (debounce
 * de 5s tras dejar de escribir) o con el boton "Guardar" manual.
 */
export default function DocumentEditor() {
  const serviceUrl =
    import.meta.env.VITE_SYNCFUSION_SERVICE_URL || DEFAULT_SERVICE_URL;

  const containerRef = useRef<DocumentEditorContainerComponent>(null);
  const getEditor = useCallback(() => containerRef.current?.documentEditor, []);

  const { status, loadInitial, scheduleSave, saveNow } = useDocumentAutosave(
    NOMBRE_DOCUMENTO,
    getEditor,
  );

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.4rem 0.75rem',
          borderBottom: '1px solid #ddd',
        }}
      >
        <button onClick={() => saveNow()}>Guardar</button>
        <span style={{ fontSize: '0.85rem', color: status === 'error' ? '#c0392b' : '#666' }}>
          {status === 'saving' && 'Guardando...'}
          {status === 'saved' && 'Guardado'}
          {status === 'error' && 'Error al guardar'}
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <DocumentEditorContainerComponent
          ref={containerRef}
          id="muninn-document-editor"
          height="100%"
          width="100%"
          style={{ display: 'block' }}
          enableToolbar={true}
          serviceUrl={serviceUrl}
          created={() => void loadInitial()}
          contentChange={() => scheduleSave()}
        />
      </div>
    </div>
  );
}
