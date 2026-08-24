import { useRef } from 'react';
import type { DocumentEditor } from '@syncfusion/ej2-documenteditor';

export function InsertTabContent({
  getEditor,
  isImageSelected,
  setImageWidthSimple,
  setImageWidthFull,
}: {
  getEditor: () => DocumentEditor | null | undefined;
  isImageSelected: boolean;
  setImageWidthSimple: () => void;
  setImageWidthFull: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const editor = getEditor();
    if (!editor) return;

    const reader = new FileReader();
    reader.onload = () => {
      void (async () => {
        try {
          // Sin width/height: Syncfusion usa el tamaño original de la imagen.
          await editor.editor.insertImageAsync(reader.result as string);
        } catch (error) {
          console.error('Error insertando imagen:', error);
        }
      })();
    };
    reader.readAsDataURL(file);
  };

  const openFilePicker = () => {
    if (!fileInputRef.current) return;
    // Limpiar el valor antes de abrir el picker: si no, seleccionar el mismo
    // archivo dos veces seguidas no dispara `onChange` (el browser no
    // considera que el valor haya cambiado).
    fileInputRef.current.value = '';
    fileInputRef.current.click();
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
        Imagen
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={openFilePicker}
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
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontSize: 'var(--font-size-md-lg)',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <rect x="2.5" y="3.5" width="11" height="9" rx="1.5"></rect>
          <circle cx="6" cy="7" r="1"></circle>
          <path d="M3 11l3-2.5 3 2 2-1.5 2 2"></path>
        </svg>
        Subir imagen…
      </button>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-xs)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginTop: '6px',
        }}
      >
        Ancho de imagen
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={setImageWidthSimple}
          disabled={!isImageSelected}
          style={{
            flex: 1,
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--font-size-md-lg)',
            color: isImageSelected ? 'var(--text-primary)' : 'var(--text-faint)',
            cursor: isImageSelected ? 'pointer' : 'not-allowed',
            opacity: isImageSelected ? 1 : 0.5,
          }}
        >
          Ancho simple
        </button>
        <button
          onClick={setImageWidthFull}
          disabled={!isImageSelected}
          style={{
            flex: 1,
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--font-size-md-lg)',
            color: isImageSelected ? 'var(--text-primary)' : 'var(--text-faint)',
            cursor: isImageSelected ? 'pointer' : 'not-allowed',
            opacity: isImageSelected ? 1 : 0.5,
          }}
        >
          Ancho completo
        </button>
      </div>
    </div>
  );
}
