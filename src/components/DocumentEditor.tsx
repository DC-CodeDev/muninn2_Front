import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
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
import type { UbicacionDocumento } from '../lib/documentApi';

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
 * Recibe la ubicacion (area + ruta + nombre) del documento como prop;
 * puede ser null (editor vacio).
 */
interface DocumentEditorProps {
  ubicacion: UbicacionDocumento | null;
  onStatusChange?: (status: SaveStatus) => void;
  children?: (getEditor: () => DocumentEditorComponent | null) => React.ReactNode;
}

// Handle imperativo expuesto via ref al padre (App.tsx): permite forzar y
// esperar el guardado del documento activo antes de, por ejemplo, cambiar
// a otro documento del sidebar. Reutiliza `saveNow` del hook de autosave,
// no duplica la logica de guardado.
export interface DocumentEditorHandle {
  saveNow: () => Promise<void>;
}

function DocumentEditor(
  { ubicacion, onStatusChange, children }: DocumentEditorProps,
  ref: React.Ref<DocumentEditorHandle>,
) {
  const serviceUrl =
    import.meta.env.VITE_SYNCFUSION_SERVICE_URL || DEFAULT_SERVICE_URL;

  const containerRef = useRef<DocumentEditorComponent>(null);
  const getEditor = useCallback(() => containerRef.current, []);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isEditorReady, setIsEditorReady] = useState(false);

  const { status, loadInitial, scheduleSave, saveNow } = useDocumentAutosave(
    ubicacion,
    getEditor,
  );

  useImperativeHandle(ref, () => ({ saveNow }), [saveNow]);

  // Notificar al componente padre sobre cambios de estado
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // Cargar el documento cada vez que cambia la ubicacion (solo si el editor ya está listo).
  useEffect(() => {
    if (isEditorReady && ubicacion) {
      void loadInitial();
    }
  }, [ubicacion, isEditorReady, loadInitial]);

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
      // Tab se escape a navegación de foco del navegador, tanto en listas
      // como en párrafos normales.
      event.preventDefault();

      // Mismo check que usa `useFormatControls` (`listId !== -1`) para
      // saber si el párrafo actual pertenece a una lista - acá decide si
      // Tab sube/baja nivel (nativo de Syncfusion) o inserta una
      // tabulación como texto (párrafo normal, sin lista).
      const isInList = editor.selection.paragraphFormat.listId !== -1;
      if (isInList) {
        editor.editor.updateListLevel(!event.shiftKey);
      } else {
        editor.editor.insertText('\t');
      }
    };

    editableDiv.addEventListener('keydown', handleKeyDown);
    return () => editableDiv.removeEventListener('keydown', handleKeyDown);
  }, [isEditorReady]);

  // Re-medir el viewer cuando el contenedor cambia de tamaño (p.ej. al
  // colapsar/expandir EditingSidebar).
  //
  // El `width`/`height` que le pasamos a DocumentEditorComponent son
  // strings fijos ("100%"), así que nunca cambian como prop aunque el
  // ancho real en píxeles del wrapper sí cambie por el layout flex al
  // abrir o cerrar el panel derecho. Syncfusion solo llama a su propio
  // `resize()` interno en el `onPropertyChanged` de `width`/`height`
  // (ver document-editor.js, case 'width'/'height') - como acá ese
  // string nunca varía, ese hook nunca dispara y el viewer se queda con
  // el tamaño cacheado de antes. Resultado: al reabrir el panel el
  // documento se sigue paginando con el ancho viejo (más ancho) y
  // desborda el contenedor, generando el scroll horizontal.
  //
  // Un ResizeObserver sobre el wrapper detecta el cambio real de tamaño
  // (lo dispare lo que lo dispare: este toggle, el sidebar izquierdo,
  // resize de ventana) y fuerza `editor.resize()`, que sí re-mide
  // `documentHelper.updateViewerSize()`. Se coalescea con
  // requestAnimationFrame para no golpear resize() en cada frame de la
  // transición CSS de 160ms del sidebar.
  useEffect(() => {
    if (!isEditorReady) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        containerRef.current?.resize();
      });
    });
    observer.observe(wrapper);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [isEditorReady]);

  return (
    <div ref={wrapperRef} style={{ display: 'flex', height: '100%', width: '100%' }}>
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

export default forwardRef(DocumentEditor);
