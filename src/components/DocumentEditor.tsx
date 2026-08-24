import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DocumentEditorComponent,
  Selection,
  Editor,
  EditorHistory,
  Search,
  OptionsPane,
  ContextMenu,
  SfdtExport,
  WordExport,
  TextExport,
  Print,
  Optimized,
  TextFormFieldDialog,
  DropDownFormFieldDialog,
  CheckBoxFormFieldDialog,
} from '@syncfusion/ej2-react-documenteditor';
import { useDocumentAutosave, type SaveStatus } from '../hooks/useDocumentAutosave';

// Módulos requeridos para el DocumentEditor puro (sin Container ni toolbar nativa).
// `Optimized` es obligatorio: `documentEditorSettings.enableOptimizedTextMeasuring`
// es `true` por default en DocumentEditor, así que el editor lo pide sí o sí en
// requiredModules() para medir texto/paginar. Con DocumentEditorContainerComponent
// esto pasaba desapercibido porque el contenedor inyecta este módulo internamente
// en la instancia de DocumentEditor que crea puertas adentro; al usar
// DocumentEditorComponent directo, sin Container, tenemos que inyectarlo nosotros.
// Si falta, el editor no termina de inicializar `selection` (selection.characterFormat
// revienta con TypeError) y no se puede escribir ni aplicar formato.
//
// OJO: `.Inject(...)` solo pone el módulo a disposición (queda registrado en
// `injectedModules` a nivel de clase). Que se instancie de verdad en cada
// instancia lo decide `requiredModules()`, que a su vez depende de flags
// `enableXxx` (enableSelection, enableEditor, etc.) que en DocumentEditor
// (a diferencia de DocumentEditorContainer, que los prende todos internamente
// al armar su editor interno) vienen todos en `false` por default. Sin estos
// flags, `Selection`/`Editor`/etc. quedan inyectados pero jamás instanciados:
// exactamente el motivo por el que `editor.selection` daba undefined y no se
// podía ni escribir ni aplicar formato, aun con todos los módulos correctos
// en el `.Inject(...)`. Cada flag de abajo tiene que tener su módulo hermano
// en el `.Inject(...)`.
//
// `TextFormFieldDialog` / `DropDownFormFieldDialog` / `CheckBoxFormFieldDialog`:
// no son opcionales pese al nombre — `enableFormField` es de los pocos flags
// que SÍ viene en `true` por default (a diferencia de enableSelection,
// enableEditor, etc.), así que con enableEditor prendido, requiredModules()
// los pide sí o sí.
DocumentEditorComponent.Inject(
  Selection,
  Editor,
  EditorHistory,
  Search,
  OptionsPane,
  ContextMenu,
  SfdtExport,
  WordExport,
  TextExport,
  Print,
  Optimized,
  TextFormFieldDialog,
  DropDownFormFieldDialog,
  CheckBoxFormFieldDialog
);

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
  children?: (getEditor: () => DocumentEditorComponent | null) => React.ReactNode;
}

export default function DocumentEditor({ nombre, onStatusChange, children }: DocumentEditorProps) {
  const serviceUrl =
    import.meta.env.VITE_SYNCFUSION_SERVICE_URL || DEFAULT_SERVICE_URL;

  const containerRef = useRef<DocumentEditorComponent>(null);
  const getEditor = useCallback(() => containerRef.current, []);

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
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <DocumentEditorComponent
        ref={containerRef}
        id="muninn-document-editor"
        height="100%"
        width="100%"
        style={{ display: 'block' }}
        serviceUrl={serviceUrl}
        // `isReadOnly` es `true` por default en DocumentEditor (a diferencia de
        // DocumentEditorContainer, que lo pone en `false` al armar su editor
        // interno). Sin este flag el editor queda perfectamente inicializado
        // -selection, editor, todo presente- pero en modo solo lectura: no
        // tira ningún error ni warning, simplemente ignora cualquier tecla.
        // Esta era la causa real de que no se pudiera escribir, más allá de
        // los módulos faltantes.
        isReadOnly={false}
        enableSelection={true}
        enableEditor={true}
        enableEditorHistory={true}
        enableSearch={true}
        enableOptionsPane={true}
        enableContextMenu={true}
        enableSfdtExport={true}
        enableWordExport={true}
        enableTextExport={true}
        enablePrint={true}
        created={() => setIsEditorReady(true)}
        contentChange={() => scheduleSave()}
      />
      {children?.(getEditor)}
    </div>
  );
}
