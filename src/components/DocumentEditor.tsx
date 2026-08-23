import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';

// Módulos necesarios para habilitar la toolbar del contenedor.
DocumentEditorContainerComponent.Inject(Toolbar);

// Default local: apunta al contenedor Docker del Word Processor Server
// (ver backend/docker-compose.yml y backend/README.md).
const DEFAULT_SERVICE_URL = 'http://localhost:7002/api/documenteditor/';

/**
 * Editor de documentos tipo Word con paginado A4 real (Syncfusion Document
 * Editor). Standalone por ahora: no persiste ni carga contenido propio,
 * solo valida que el editor y su paginado funcionen bien en el navegador.
 * `serviceUrl` apunta al Word Processor Server de Syncfusion, requerido
 * para operaciones server-side como el pegado con formato enriquecido.
 */
export default function DocumentEditor() {
  const serviceUrl =
    import.meta.env.VITE_SYNCFUSION_SERVICE_URL || DEFAULT_SERVICE_URL;

  return (
    <DocumentEditorContainerComponent
      id="muninn-document-editor"
      height="100%"
      width="100%"
      style={{ display: 'block' }}
      enableToolbar={true}
      serviceUrl={serviceUrl}
    />
  );
}
