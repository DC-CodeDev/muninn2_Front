import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';

// Módulos necesarios para habilitar la toolbar del contenedor.
DocumentEditorContainerComponent.Inject(Toolbar);

/**
 * Editor de documentos tipo Word con paginado A4 real (Syncfusion Document
 * Editor). Standalone por ahora: no persiste ni carga contenido, solo
 * valida que el editor y su paginado funcionen bien en el navegador.
 */
export default function DocumentEditor() {
  return (
    <DocumentEditorContainerComponent
      id="muninn-document-editor"
      height="100%"
      width="100%"
      style={{ display: 'block' }}
      enableToolbar={true}
    />
  );
}
