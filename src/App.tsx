import { useEffect, useRef, useState } from 'react';
import type { DocumentEditor as DocumentEditorInstance } from '@syncfusion/ej2-documenteditor';
import DocumentEditor, { type DocumentEditorHandle } from './components/DocumentEditor';
import DocumentSidebar, { type DocumentMetadata } from './components/DocumentSidebar';
import DocumentTopbar from './components/DocumentTopbar';
import EditingSidebar from './components/EditingSidebar';
import WorkspacesView from './components/WorkspacesView';
import AreaTreeView from './components/AreaTreeView';
import { listarAreas, crearArea, eliminarArea, listarArbol, type AreaMeta } from './lib/documentApi';
import { colorAHex, type ColorArea } from './lib/colores';
import { useSidebarCollapse } from './hooks/useSidebarCollapse';
import { type SaveStatus } from './hooks/useDocumentAutosave';

// Estado de navegacion: en que Area y en que punto del arbol recursivo esta
// parado el usuario. Union discriminada por `pantalla` en vez de campos
// sueltos (area/ruta/documento nullable por separado): evita estados
// invalidos como "documento abierto sin area" y hace que cada pantalla
// reciba exactamente los datos que necesita, ya angostados por tipo.
//
// `ruta` es el path de carpetas recorridas dentro del Area (`[]` = raiz).
// Al abrir un documento se preserva `ruta`: volver del editor reabre el
// arbol en el mismo punto (3d del diseño de referencia).
type Navegacion =
  | { pantalla: 'workspaces' }
  | { pantalla: 'arbol'; area: AreaMeta; ruta: string[] }
  | { pantalla: 'editor'; area: AreaMeta; ruta: string[]; documento: string };

export default function App() {
  const [areas, setAreas] = useState<AreaMeta[]>([]);
  const [cargandoAreas, setCargandoAreas] = useState(true);
  const [nav, setNav] = useState<Navegacion>({ pantalla: 'workspaces' });
  const [documentosCarpeta, setDocumentosCarpeta] = useState<DocumentMetadata[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const { leftCollapsed, rightCollapsed, toggleLeft, toggleRight } = useSidebarCollapse();
  const editorRef = useRef<DocumentEditorHandle>(null);
  // Referencia al `getEditor` que expone `DocumentEditor` via su render-prop
  // `children` (ver DocumentEditor.tsx). Se completa en cada render dentro
  // del callback de `children` de mas abajo; import/export de Word la usan
  // para llegar a la instancia real de Syncfusion sin tocar la interfaz de
  // `DocumentEditorHandle` (que solo expone `saveNow`).
  const getEditorRef = useRef<(() => DocumentEditorInstance | null | undefined) | null>(null);

  const cargarAreas = async () => {
    setCargandoAreas(true);
    try {
      setAreas(await listarAreas());
    } catch (err) {
      console.error('Error cargando áreas:', err);
    } finally {
      setCargandoAreas(false);
    }
  };

  useEffect(() => {
    void cargarAreas();
  }, []);

  // Mientras el editor esta abierto, el sidebar izquierdo lista los
  // documentos de la carpeta contenedora — no de todo el Area (ver 3d).
  // Tambien se re-lista cuando `saveStatus` pasa a 'saved': un documento
  // nuevo no existe en el arbol hasta su primer guardado (no hay endpoint
  // de "crear documento vacio", ver AreaTreeView), asi que sin este
  // refetch el sidebar seguiria mostrando "0 documentos" despues de crear
  // y guardar el primero.
  useEffect(() => {
    if (nav.pantalla !== 'editor') return;
    let cancelado = false;
    (async () => {
      try {
        const entradas = await listarArbol(nav.area.nombre, nav.ruta);
        if (cancelado) return;
        setDocumentosCarpeta(
          entradas
            .filter((e) => e.tipo === 'documento')
            .map((e) => ({ nombre: e.nombre, fechaModificacion: e.fechaModificacion })),
        );
      } catch (err) {
        console.error('Error listando documentos de la carpeta:', err);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [nav, saveStatus]);

  const handleCrearArea = async (nombre: string, color: ColorArea) => {
    await crearArea(nombre, color);
    await cargarAreas();
  };

  const handleEliminarArea = async (nombre: string) => {
    await eliminarArea(nombre);
    await cargarAreas();
  };

  const abrirArea = (area: AreaMeta) => setNav({ pantalla: 'arbol', area, ruta: [] });

  const abrirDocumento = async (area: AreaMeta, ruta: string[], documento: string) => {
    // Mismo patron que tenia handleSelectDocument: esperar el guardado del
    // documento activo (si lo hay) antes de montar el editor en el nuevo,
    // para no pisar contenido sin guardar.
    if (editorRef.current) {
      await editorRef.current.saveNow();
    }
    setNav({ pantalla: 'editor', area, ruta, documento });
  };

  const volverACarpeta = async () => {
    if (nav.pantalla !== 'editor') return;
    if (editorRef.current) {
      await editorRef.current.saveNow();
    }
    setNav({ pantalla: 'arbol', area: nav.area, ruta: nav.ruta });
  };

  // Reemplaza el contenido del documento abierto por el de un .docx real
  // subido por el usuario. `open`/`openAsync` suben el archivo al Word
  // Processor Server (accion "Import" del serviceUrl ya configurado en
  // DocumentEditor.tsx) y cargan el sfdt resultante en el editor.
  //
  // OJO 1 (bug confirmado en el .js de Syncfusion, no documentado): para
  // inputs File/Blob/URL/base64, `openInternal` dispara la conversion a
  // sfdt con un `.then(...)` que NO se retorna dentro del generador async
  // - el generador cae al `break` siguiente y la promesa de `openAsync` se
  // resuelve de inmediato, ANTES de que el sfdt convertido se aplique de
  // verdad al documento. Confirmado a mano: `await editor.openAsync(file)`
  // seguido de `saveNow()` persistia un documento vacio (el import real
  // tarda un rato mas en aplicarse). La señal confiable es el evento
  // `documentChange`, que Syncfusion dispara recien cuando el documento ya
  // se aplico y se re-pagino (`fireDocumentChange` en viewer.js).
  //
  // OJO 2: a diferencia de escribir/editar a mano, ese evento es
  // `documentChange`, no `contentChange` - son eventos distintos. Como el
  // autosave de este proyecto esta enganchado a `contentChange` (ver
  // `contentChange={() => scheduleSave()}` en DocumentEditor.tsx), un
  // import nunca dispara el autosave por si solo: hay que forzar el
  // guardado con `saveNow()` (mismo metodo que ya usa el resto de la app
  // antes de cambiar de documento) o el contenido importado se pierde si
  // el usuario navega antes de tocar el documento.
  const importarWord = async (file: File) => {
    const editor = getEditorRef.current?.();
    if (!editor) return;

    await new Promise<void>((resolve, reject) => {
      const onDocumentChange = () => {
        clearTimeout(timeoutId);
        editor.removeEventListener('documentChange', onDocumentChange);
        resolve();
      };
      const timeoutId = setTimeout(() => {
        editor.removeEventListener('documentChange', onDocumentChange);
        reject(new Error('Tiempo de espera agotado importando el .docx'));
      }, 20000);
      editor.addEventListener('documentChange', onDocumentChange);
      editor.open(file);
    });

    if (editorRef.current) {
      await editorRef.current.saveNow();
    }
  };

  // Serializa el documento actual a .docx real. `saveAsBlob('Docx')` no
  // pega contra el Word Processor Server: el modulo `WordExport` arma el
  // .docx enteramente en el browser (confirmado en word-export.js), asi que
  // esto funciona aunque el contenedor Docker este caido.
  const exportarWord = async (): Promise<Blob | null> => {
    const editor = getEditorRef.current?.();
    if (!editor) return null;
    return editor.saveAsBlob('Docx');
  };

  const seleccionarDocumentoSidebar = async (nombre: string) => {
    if (nav.pantalla !== 'editor' || nombre === nav.documento) return;
    if (editorRef.current) {
      await editorRef.current.saveNow();
    }
    setNav({ pantalla: 'editor', area: nav.area, ruta: nav.ruta, documento: nombre });
  };

  if (nav.pantalla === 'workspaces') {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', backgroundColor: 'var(--bg-base)' }}>
        <WorkspacesView
          areas={areas}
          cargando={cargandoAreas}
          onAbrirArea={abrirArea}
          onCrearArea={handleCrearArea}
          onEliminarArea={handleEliminarArea}
        />
      </div>
    );
  }

  if (nav.pantalla === 'arbol') {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', backgroundColor: 'var(--bg-base)' }}>
        <AreaTreeView
          area={nav.area}
          ruta={nav.ruta}
          onNavegarRuta={(ruta) => setNav({ pantalla: 'arbol', area: nav.area, ruta })}
          onVolverWorkspaces={() => setNav({ pantalla: 'workspaces' })}
          onAbrirDocumento={(documento) => void abrirDocumento(nav.area, nav.ruta, documento)}
        />
      </div>
    );
  }

  // nav.pantalla === 'editor'
  const carpetaNombre = nav.ruta.length === 0 ? nav.area.nombre : nav.ruta[nav.ruta.length - 1];

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', backgroundColor: 'var(--bg-base)' }}>
      <DocumentSidebar
        documents={documentosCarpeta}
        activeDocument={nav.documento}
        onSelect={(nombre) => void seleccionarDocumentoSidebar(nombre)}
        // No hay flujo de "crear documento" propio del sidebar del editor:
        // ese formulario (con chequeo de colision de nombre) vive en la
        // vista de arbol. Este boton solo vuelve ahi.
        onCreateNew={() => void volverACarpeta()}
        collapsed={leftCollapsed}
        onToggle={toggleLeft}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-canvas)',
        }}
      >
        {/*
          `minWidth: 0` es necesario, no cosmético: por default un flex item
          tiene `min-width: auto`, que lo bloquea de encogerse por debajo del
          ancho de contenido mínimo de sus hijos. DocumentEditor (Syncfusion)
          fija internamente un ancho en px fijo sobre un div propio cada vez
          que corre su `resize()` (ver comentario en DocumentEditor.tsx) - ese
          valor en px, al no ser un porcentaje, se convierte en el "contenido
          mínimo" de toda esta columna. Sin `minWidth: 0` acá, esa columna se
          niega a volver a angostarse aunque el EditingSidebar (a la derecha,
          dentro de DocumentEditor) vuelva a ocupar sus 300px: el layout entero
          queda más ancho que el viewport y aparece scroll horizontal abajo.
          Reproducible sin este fix: colapsar el panel de edición y volver a
          expandirlo. Con `minWidth: 0`, la columna vuelve a angostarse al
          tamaño real disponible (el ResizeObserver de DocumentEditor.tsx hace
          el resto: re-mide y le pide a Syncfusion que re-pagine a ese ancho).
        */}
        <DocumentTopbar
          documentName={nav.documento}
          saveStatus={saveStatus}
          areaColor={colorAHex(nav.area.color)}
          carpetaNombre={carpetaNombre}
          onBack={() => void volverACarpeta()}
        />

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <DocumentEditor
            ref={editorRef}
            ubicacion={{ area: nav.area.nombre, ruta: nav.ruta, documento: nav.documento }}
            onStatusChange={setSaveStatus}
          >
            {(getEditor) => {
              getEditorRef.current = getEditor;
              return (
                <EditingSidebar
                  collapsed={rightCollapsed}
                  onToggle={toggleRight}
                  getEditor={getEditor}
                  documentName={nav.documento}
                  onImportarWord={importarWord}
                  onExportarWord={exportarWord}
                />
              );
            }}
          </DocumentEditor>
        </div>
      </div>
    </div>
  );
}
