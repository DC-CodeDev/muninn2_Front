import { useEffect, useState } from 'react';
import DocumentEditor from './components/DocumentEditor';
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

  const handleCreateNew = () => {
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
      { nombre, ultimaModificacion: new Date().toISOString() },
    ]);

    setActiveDocument(nombre);
  };

  const handleSelectDocument = (nombre: string) => {
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
              <DocumentEditor nombre={activeDocument} onStatusChange={setSaveStatus} />
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

      <EditingSidebar collapsed={rightCollapsed} onToggle={toggleRight} />
    </div>
  );
}