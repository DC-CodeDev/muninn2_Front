import { useEffect, useRef, useState } from 'react';
import DocumentEditor, { type DocumentEditorHandle } from './components/DocumentEditor';
import DocumentSidebar, { type DocumentMetadata } from './components/DocumentSidebar';
import DocumentTopbar from './components/DocumentTopbar';
import EditingSidebar from './components/EditingSidebar';
import ThemeToggle from './components/ThemeToggle';
import { listDocuments, NOMBRE_VALIDO } from './lib/documentApi';
import { useSidebarCollapse } from './hooks/useSidebarCollapse';
import { type SaveStatus } from './hooks/useDocumentAutosave';

export default function App() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const { leftCollapsed, rightCollapsed, toggleLeft, toggleRight } = useSidebarCollapse();
  const editorRef = useRef<DocumentEditorHandle>(null);

  useEffect(() => {
    async function loadDocs() {
      try {
        const docs = await listDocuments();
        setDocuments(docs);
      } catch (err) {
        console.error('Error cargando lista de documentos:', err);
      }
    }
    void loadDocs();
  }, []);

  const handleCreateNew = async () => {
    const nombre = window.prompt(
      'Nombre del nuevo documento (solo letras, números, guiones y guiones bajos):',
    );
    if (!nombre) return;

    if (!NOMBRE_VALIDO.test(nombre)) {
      alert('Nombre inválido. Solo se permiten letras, números, guiones y guiones bajos.');
      return;
    }

    const existing = documents.find((d) => d.nombre === nombre);
    if (existing) {
      alert('Ya existe un documento con ese nombre.');
      return;
    }

    setDocuments((prev) => [
      ...prev,
      { nombre, fechaModificacion: new Date().toISOString() },
    ]);

    // Mismo patron que handleSelectDocument: el documento activo (si lo
    // hay) puede tener texto sin guardar. Esperar su guardado antes de
    // activar este documento nuevo, para no pisarlo al montar el editor
    // en blanco.
    if (editorRef.current) {
      await editorRef.current.saveNow();
    }

    setActiveDocument(nombre);
  };

  const handleSelectDocument = async (nombre: string) => {
    if (nombre === activeDocument) return;

    // Forzar y esperar el guardado del documento activo antes de
    // desmontar/cambiar el editor al nuevo documento: si no se espera
    // esta confirmacion, el `open`/`openBlank` del documento nuevo pisa
    // el contenido sin guardar del anterior. Reutiliza `saveNow`, el
    // mismo guardado que dispara el autosave por intervalo (no lo
    // reemplaza, sigue corriendo igual como respaldo). Mientras se
    // espera, el indicador "Guardando…" existente en DocumentTopbar se
    // muestra solo porque `saveNow` setea el mismo `status` del hook.
    if (editorRef.current) {
      await editorRef.current.saveNow();
    }

    setActiveDocument(nombre);
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      <DocumentSidebar
        documents={documents}
        activeDocument={activeDocument}
        onSelect={handleSelectDocument}
        onCreateNew={handleCreateNew}
        collapsed={leftCollapsed}
        onToggle={toggleLeft}
      />

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
        {activeDocument ? (
          <>
            <DocumentTopbar documentName={activeDocument} saveStatus={saveStatus} />

            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <DocumentEditor ref={editorRef} nombre={activeDocument} onStatusChange={setSaveStatus}>
                {(getEditor) => <EditingSidebar collapsed={rightCollapsed} onToggle={toggleRight} getEditor={getEditor} />}
              </DocumentEditor>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '0 20px',
                backgroundColor: 'var(--bg-base)',
                borderBottom: '1px solid var(--border-subtle)',
                flexShrink: 0,
              }}
            >
              <ThemeToggle integrated />
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: 'var(--font-size-xl)',
              }}
            >
              Selecciona o crea un documento para comenzar
            </div>
          </>
        )}
      </div>
    </div>
  );
}