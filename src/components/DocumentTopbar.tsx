import ThemeToggle from './ThemeToggle';
import { type SaveStatus } from '../hooks/useDocumentAutosave';

interface DocumentTopbarProps {
  documentName: string;
  saveStatus?: SaveStatus;
}

export default function DocumentTopbar({ documentName, saveStatus = 'idle' }: DocumentTopbarProps) {
  const getStatusInfo = () => {
    switch (saveStatus) {
      case 'saving':
        return { text: 'Guardando…', color: 'var(--accent)' };
      case 'saved':
        return { text: 'Guardado', color: 'var(--status-ok)' };
      case 'error':
        return { text: 'Error al guardar', color: 'var(--status-error)' };
      default:
        return { text: 'Guardado', color: 'var(--status-ok)' };
    }
  };

  const { text, color } = getStatusInfo();

  return (
    <div
      style={{
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        backgroundColor: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="1.2"
        >
          <path d="M3.5 2.5h6l3 3v8h-9z"></path>
          <path d="M9.5 2.5v3h3"></path>
        </svg>
        <span
          style={{
            fontSize: 'var(--font-size-xl)',
            color: 'var(--text-primary)',
          }}
        >
          {documentName}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-md)',
              color: saveStatus === 'error' ? 'var(--status-error)' : 'var(--text-secondary)',
            }}
          >
            {text}
          </span>
        </div>

        <ThemeToggle integrated />
      </div>
    </div>
  );
}