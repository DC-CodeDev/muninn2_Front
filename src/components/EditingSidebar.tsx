import { useState } from 'react';

type TabType = 'texto' | 'parrafo' | 'insertar' | 'revisar';

interface EditingSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function EditingSidebar({ collapsed, onToggle }: EditingSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('texto');

  if (collapsed) {
    return (
      <div
        style={{
          width: '48px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-base)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '9px 0',
          gap: '4px',
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
            marginBottom: '10px',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Expandir panel de edición"
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
            <line x1="9.5" y1="3" x2="9.5" y2="13"></line>
          </svg>
        </button>

        {activeTab === 'texto' && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: 'var(--text-primary)',
              boxShadow: 'inset -2px 0 0 var(--accent)',
            }}
          >
            A
          </div>
        )}

        {activeTab === 'parrafo' && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: 'var(--text-primary)',
              boxShadow: 'inset -2px 0 0 var(--accent)',
            }}
          >
            ¶
          </div>
        )}

        {activeTab === 'insertar' && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              boxShadow: 'inset -2px 0 0 var(--accent)',
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
          </div>
        )}

        {activeTab === 'revisar' && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              boxShadow: 'inset -2px 0 0 var(--accent)',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <circle cx="7" cy="7" r="4.5"></circle>
              <line x1="10.5" y1="10.5" x2="14" y2="14"></line>
            </svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '300px',
        flexShrink: 0,
        backgroundColor: 'var(--bg-base)',
        borderLeft: '1px solid var(--border)',
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
          alignItems: 'stretch',
          gap: '0',
          padding: '0 8px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {(['texto', 'parrafo', 'insertar', 'revisar'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              fontSize: 'var(--font-size-md-lg)',
              color:
                activeTab === tab
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              boxShadow:
                activeTab === tab ? 'inset 0 -2px 0 var(--accent)' : 'none',
              transition: 'color 0.15s',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}

        <button
          onClick={onToggle}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
          }}
          title="Colapsar panel de edición"
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
            <line x1="9.5" y1="3" x2="9.5" y2="13"></line>
          </svg>
        </button>
      </div>

      <div
        style={{
          padding: '18px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {activeTab === 'texto' && <TextTabContent />}
        {activeTab === 'parrafo' && <PlaceholderTabContent />}
        {activeTab === 'insertar' && <PlaceholderTabContent />}
        {activeTab === 'revisar' && <PlaceholderTabContent />}
      </div>
    </div>
  );
}

function TextTabContent() {
  return (
    <>
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
          Fuente
        </div>
        <div
          style={{
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-document)',
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-primary)',
            }}
          >
            Source Serif
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>
            ▾
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
            Tamaño
          </div>
          <div
            style={{
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px 0 10px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-md-lg)',
                color: 'var(--text-primary)',
              }}
            >
              12
            </span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
                color: 'var(--text-secondary)',
                fontSize: '7px',
                lineHeight: 1,
              }}
            >
              <span>▲</span>
              <span>▼</span>
            </div>
          </div>
        </div>

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
            Interlineado
          </div>
          <div
            style={{
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px 0 10px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-md-lg)',
                color: 'var(--text-primary)',
              }}
            >
              1.5
            </span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
                color: 'var(--text-secondary)',
                fontSize: '7px',
                lineHeight: 1,
              }}
            >
              <span>▲</span>
              <span>▼</span>
            </div>
          </div>
        </div>
      </div>

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
          Estilo
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--state-active)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 600,
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-primary)',
            }}
          >
            B
          </div>
          <div
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontStyle: 'italic',
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-secondary)',
            }}
          >
            I
          </div>
          <div
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-secondary)',
              textDecoration: 'underline',
            }}
          >
            U
          </div>
        </div>
      </div>

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
          Alineación
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--state-active)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              stroke="var(--text-primary)"
              strokeWidth="1.2"
            >
              <line x1="2.5" y1="4" x2="13.5" y2="4"></line>
              <line x1="2.5" y1="8" x2="9.5" y2="8"></line>
              <line x1="2.5" y1="12" x2="11.5" y2="12"></line>
            </svg>
          </div>
          <div
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              stroke="var(--text-secondary)"
              strokeWidth="1.2"
            >
              <line x1="2.5" y1="4" x2="13.5" y2="4"></line>
              <line x1="4.5" y1="8" x2="11.5" y2="8"></line>
              <line x1="3.5" y1="12" x2="12.5" y2="12"></line>
            </svg>
          </div>
          <div
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              stroke="var(--text-secondary)"
              strokeWidth="1.2"
            >
              <line x1="2.5" y1="4" x2="13.5" y2="4"></line>
              <line x1="6.5" y1="8" x2="13.5" y2="8"></line>
              <line x1="4.5" y1="12" x2="13.5" y2="12"></line>
            </svg>
          </div>
          <div
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              stroke="var(--text-secondary)"
              strokeWidth="1.2"
            >
              <line x1="2.5" y1="4" x2="13.5" y2="4"></line>
              <line x1="2.5" y1="8" x2="13.5" y2="8"></line>
              <line x1="2.5" y1="12" x2="13.5" y2="12"></line>
            </svg>
          </div>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }}></div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-md-lg)',
            color: 'var(--text-secondary)',
          }}
        >
          Limpiar formato
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-faint)',
          }}
        >
          ⌥⌘\
        </span>
      </div>
    </>
  );
}

function PlaceholderTabContent() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        gap: '12px',
        color: 'var(--text-muted)',
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        style={{ opacity: 0.3 }}
      >
        <circle cx="8" cy="8" r="6"></circle>
        <path d="M8 4v4h4"></path>
      </svg>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-xs)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          opacity: 0.5,
        }}
      >
        Próximamente
      </div>
    </div>
  );
}