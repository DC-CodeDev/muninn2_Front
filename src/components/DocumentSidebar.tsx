export interface DocumentMetadata {
  nombre: string;
  ultimaModificacion: string;
}

interface DocumentSidebarProps {
  documents: DocumentMetadata[];
  activeDocument: string | null;
  onSelect: (nombre: string) => void;
  onCreateNew: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function DocumentSidebar({
  documents,
  activeDocument,
  onSelect,
  onCreateNew,
  collapsed,
  onToggle,
}: DocumentSidebarProps) {
  if (collapsed) {
    return (
      <div
        style={{
          width: '48px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-base)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '9px 0',
          transition: 'width var(--transition-sidebar)',
        }}
      >
        <button
          onClick={onToggle}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface-raised)',
            color: 'var(--text-secondary)',
            marginBottom: '14px',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Expandir panel de documentos"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <rect x="2.5" y="3" width="11" height="10" rx="1.5"></rect>
            <line x1="6.5" y1="3" x2="6.5" y2="13"></line>
          </svg>
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          {documents.slice(0, 5).map((doc) => (
            <button
              key={doc.nombre}
              onClick={() => onSelect(doc.nombre)}
              style={{
                position: 'relative',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor:
                  activeDocument === doc.nombre
                    ? 'var(--surface-raised)'
                    : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              title={doc.nombre}
            >
              {activeDocument === doc.nombre && (
                <div
                  style={{
                    position: 'absolute',
                    left: '-8px',
                    top: '8px',
                    bottom: '8px',
                    width: '2px',
                    borderRadius: '2px',
                    backgroundColor: 'var(--accent)',
                  }}
                />
              )}
              <svg
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                stroke={
                  activeDocument === doc.nombre
                    ? 'var(--text-primary)'
                    : 'var(--text-faint)'
                }
                strokeWidth="1.2"
              >
                <path d="M3.5 2.5h6l3 3v8h-9z"></path>
                <path d="M9.5 2.5v3h3"></path>
              </svg>
            </button>
          ))}
        </div>

        <button
          onClick={onCreateNew}
          style={{
            marginTop: 'auto',
            width: '30px',
            height: '30px',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            fontSize: '14px',
            lineHeight: 1,
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
          title="Nuevo documento"
        >
          +
        </button>
      </div>
    );
  }

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `hoy · ${date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (diffDays === 1) {
      return `ayer · ${date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (diffDays < 7) {
      return `${diffDays} días atrás`;
    } else {
      return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div
      style={{
        width: '264px',
        flexShrink: 0,
        backgroundColor: 'var(--bg-base)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-sidebar)',
      }}
    >
      <div
        style={{
          height: '44px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px 0 16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-md)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Documentos
        </span>
        <button
          onClick={onToggle}
          style={{
            width: '26px',
            height: '26px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--surface-raised)',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Colapsar panel de documentos"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <rect x="2.5" y="3" width="11" height="10" rx="1.5"></rect>
            <line x1="6.5" y1="3" x2="6.5" y2="13"></line>
          </svg>
        </button>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={onCreateNew}
          style={{
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 10px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-lg)',
            backgroundColor: 'var(--surface)',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--state-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface)';
          }}
        >
          <span style={{ fontSize: '15px', color: 'var(--accent)', lineHeight: 1 }}>
            +
          </span>
          <span>Nuevo documento</span>
        </button>

        <div
          style={{
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 10px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border)',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1.3"
          >
            <circle cx="7" cy="7" r="4.5"></circle>
            <line x1="10.5" y1="10.5" x2="14" y2="14"></line>
          </svg>
          <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-muted)' }}>
            Buscar
          </span>
        </div>
      </div>

      <div
        style={{
          padding: '14px 16px 6px',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-xs)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
        }}
      >
        Recientes
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px', gap: '1px' }}>
        {documents.length === 0 ? (
          <div
            style={{
              padding: '20px 16px',
              color: 'var(--text-muted)',
              fontSize: 'var(--font-size-lg)',
              textAlign: 'center',
            }}
          >
            No hay documentos aún
          </div>
        ) : (
          documents.map((doc) => (
            <button
              key={doc.nombre}
              onClick={() => onSelect(doc.nombre)}
              style={{
                position: 'relative',
                padding: '9px 10px 9px 12px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor:
                  activeDocument === doc.nombre
                    ? 'var(--surface-raised)'
                    : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (activeDocument !== doc.nombre) {
                  e.currentTarget.style.backgroundColor = 'var(--surface)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeDocument !== doc.nombre) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {activeDocument === doc.nombre && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '9px',
                    bottom: '9px',
                    width: '2px',
                    borderRadius: '2px',
                    backgroundColor: 'var(--accent)',
                  }}
                />
              )}
              <div
                style={{
                  fontSize: 'var(--font-size-lg)',
                  color:
                    activeDocument === doc.nombre
                      ? 'var(--text-primary)'
                      : 'var(--text-secondary)',
                  marginBottom: '3px',
                }}
              >
                {doc.nombre}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-sm)',
                  color:
                    activeDocument === doc.nombre
                      ? 'var(--text-secondary)'
                      : 'var(--text-faint)',
                }}
              >
                {formatDate(doc.ultimaModificacion)}
              </div>
            </button>
          ))
        )}
      </div>

      <div
        style={{
          marginTop: 'auto',
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-faint)',
          }}
        >
          {documents.length} documento{documents.length !== 1 ? 's' : ''}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-faint)',
          }}
        >
          v2.0
        </span>
      </div>
    </div>
  );
}