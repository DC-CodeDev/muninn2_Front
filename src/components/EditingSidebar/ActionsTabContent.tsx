import { useRef, useState } from 'react';

interface ActionsTabContentProps {
  /** Nombre del documento activo, usado como nombre de archivo al exportar. */
  documentName: string;
  /** Reemplaza el contenido del documento abierto por el de un .docx subido por el usuario. */
  onImportarWord: (file: File) => Promise<void>;
  /** Serializa el documento abierto a .docx real y devuelve el blob resultante para descargar. */
  onExportarWord: () => Promise<Blob | null>;
}

export function ActionsTabContent({
  documentName,
  onImportarWord,
  onExportarWord,
}: ActionsTabContentProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [wordBusy, setWordBusy] = useState<'importar' | 'exportar' | null>(null);
  const [wordError, setWordError] = useState<string | null>(null);

  const abrirSelectorImportar = () => {
    if (!importInputRef.current) return;
    // Limpiar el valor antes de abrir el picker: si no, elegir el mismo
    // archivo dos veces seguidas no dispara `onChange` (mismo patron que
    // InsertTabContent.tsx para insertar imagenes).
    importInputRef.current.value = '';
    importInputRef.current.click();
  };

  const handleImportarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setWordError(null);
    setWordBusy('importar');
    void onImportarWord(file)
      .catch((error) => {
        console.error('Error importando .docx:', error);
        setWordError('No se pudo importar el archivo .docx');
      })
      .finally(() => setWordBusy(null));
  };

  const handleExportar = () => {
    setWordError(null);
    setWordBusy('exportar');
    void onExportarWord()
      .then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${documentName}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Error exportando .docx:', error);
        setWordError('No se pudo exportar el archivo .docx');
      })
      .finally(() => setWordBusy(null));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-xs)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        Word
      </div>

      <input
        ref={importInputRef}
        type="file"
        accept=".docx"
        onChange={handleImportarChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={abrirSelectorImportar}
        disabled={wordBusy !== null}
        title="Importar un archivo .docx"
        style={{
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '0 10px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          cursor: wordBusy === null ? 'pointer' : 'not-allowed',
          color: 'var(--text-primary)',
          fontSize: 'var(--font-size-md-lg)',
          opacity: wordBusy === null ? 1 : 0.6,
        }}
      >
        {wordBusy === 'importar' ? 'Importando…' : 'Importar Word'}
      </button>

      <button
        onClick={handleExportar}
        disabled={wordBusy !== null}
        title="Descargar el documento como .docx"
        style={{
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '0 10px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          cursor: wordBusy === null ? 'pointer' : 'not-allowed',
          color: 'var(--text-primary)',
          fontSize: 'var(--font-size-md-lg)',
          opacity: wordBusy === null ? 1 : 0.6,
        }}
      >
        {wordBusy === 'exportar' ? 'Exportando…' : 'Exportar Word'}
      </button>

      {wordError && (
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--status-error)',
          }}
        >
          {wordError}
        </div>
      )}
    </div>
  );
}
