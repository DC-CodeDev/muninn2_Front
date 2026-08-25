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
  ImageResizer,
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
//
// `ImageResizer`: habilita los handles de redimensión/arrastre que aparecen
// al hacer click sobre una imagen ya insertada (drag para agrandar/achicar,
// mover de posición). Como el resto de los módulos opcionales, viene atado
// a un flag propio, `enableImageResizer`, que es `false` por default en
// DocumentEditor — sin el flag la imagen se inserta bien pero queda "muerta"
// al click (ni handles ni drag).
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
  CheckBoxFormFieldDialog,
  ImageResizer
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

  // Tab/Shift+Tab dentro del editor -> subir/bajar nivel de lista (Word/
  // Notion), en vez de dejar que el navegador lo trate como foco estándar.
  //
  // Syncfusion NO intercepta Tab en esta versión: el `case 9` (Tab) del
  // switch de `onKeyDownInternal` viene comentado en el source
  // (selection.js, tanto para Tab solo como para Ctrl+Tab) - confirmado
  // leyendo el .js, no es una suposición. Sin un listener propio el evento
  // se escapa tal cual como navegación de foco del navegador.
  //
  // El keydown real de tipeo no pasa por el DOM de esta app: en desktop
  // (`!Browser.isDevice`), Syncfusion crea internamente un iframe oculto
  // (`documentHelper.iframe`, clase `e-de-text-target`) con un
  // `contenteditable` adentro (`documentHelper.editableDiv`) que es el nodo
  // que efectivamente tiene el foco y recibe los keydown al escribir -
  // confirmado en viewer.js (`createEditableIFrame` + `wireInputEvents`
  // engancha el keydown ahí, no en `viewerContainer` del documento
  // principal). Un listener en `document`/`window` de esta app nunca ve
  // estos eventos: el keydown de un iframe no se propaga al documento
  // padre. Por eso el listener se cuelga directo de `editableDiv`, sea cual
  // sea el documento (con o sin iframe) donde viva en cada caso.
  //
  // `documentHelper`/`editableDiv` están marcados `@private` en el .d.ts
  // pero son miembros públicos reales en runtime (mismo criterio ya usado
  // en este proyecto para `editor.updateListLevel`, `imageFormat.resize`,
  // etc.) - no hay wrapper Container de por medio que los oculte.
  useEffect(() => {
    if (!isEditorReady) return;
    const editor = containerRef.current;
    const editableDiv = editor?.documentHelper?.editableDiv;
    if (!editor || !editableDiv) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      // Siempre preventDefault mientras el editor tiene foco: evita que el
      // Tab se escape a navegación de foco del navegador, aunque el cursor
      // no esté en una lista (en ese caso `updateListLevel` es un no-op
      // seguro confirmado por lectura de código - no rompe nada, pero
      // tampoco genera indentación todavía; eso queda para otra sesión).
      event.preventDefault();
      editor.editor.updateListLevel(!event.shiftKey);
    };

    editableDiv.addEventListener('keydown', handleKeyDown);
    return () => editableDiv.removeEventListener('keydown', handleKeyDown);
  }, [isEditorReady]);

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
        enableImageResizer={true}
        created={() => setIsEditorReady(true)}
        contentChange={() => scheduleSave()}
      />
      {children?.(getEditor)}
    </div>
  );
}
