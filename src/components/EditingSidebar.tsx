import { useEffect, useState } from 'react';
import type { DocumentEditor } from '@syncfusion/ej2-documenteditor';
import { useFormatControls } from '../hooks/useFormatControls';

type TabType = 'texto' | 'parrafo' | 'insertar' | 'revisar';

interface EditingSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  getEditor: () => DocumentEditor | null | undefined;
}

export default function EditingSidebar({ collapsed, onToggle, getEditor }: EditingSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('texto');
  const formatControls = useFormatControls(getEditor);

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
        {activeTab === 'texto' && (
          <TextTabContent
            format={formatControls.format}
            setFontFamily={formatControls.setFontFamily}
            setFontSize={formatControls.setFontSize}
            setLineSpacing={formatControls.setLineSpacing}
            toggleBold={formatControls.toggleBold}
            toggleItalic={formatControls.toggleItalic}
            toggleUnderline={formatControls.toggleUnderline}
            setAlignment={formatControls.setAlignment}
            clearFormatting={formatControls.clearFormatting}
            fontOptions={formatControls.FONT_FAMILY_OPTIONS}
          />
        )}
        {activeTab === 'parrafo' && <PlaceholderTabContent />}
        {activeTab === 'insertar' && <PlaceholderTabContent />}
        {activeTab === 'revisar' && <PlaceholderTabContent />}
      </div>
    </div>
  );
}

function TextTabContent({
  format,
  setFontFamily,
  setFontSize,
  setLineSpacing,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  setAlignment,
  clearFormatting,
  fontOptions,
}: {
  format: ReturnType<typeof useFormatControls>['format'];
  setFontFamily: ReturnType<typeof useFormatControls>['setFontFamily'];
  setFontSize: ReturnType<typeof useFormatControls>['setFontSize'];
  setLineSpacing: ReturnType<typeof useFormatControls>['setLineSpacing'];
  toggleBold: ReturnType<typeof useFormatControls>['toggleBold'];
  toggleItalic: ReturnType<typeof useFormatControls>['toggleItalic'];
  toggleUnderline: ReturnType<typeof useFormatControls>['toggleUnderline'];
  setAlignment: ReturnType<typeof useFormatControls>['setAlignment'];
  clearFormatting: ReturnType<typeof useFormatControls>['clearFormatting'];
  fontOptions: readonly string[];
}) {
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [fontSizeInput, setFontSizeInput] = useState(format.fontSize.toString());
  const [lineSpacingInput, setLineSpacingInput] = useState(format.lineSpacing.toString());

  // `fontSizeInput`/`lineSpacingInput` son un buffer de texto local (hace
  // falta para poder borrar el campo y tipear un valor nuevo sin que un
  // <input> controlado directamente por `format.fontSize` lo bloquee). Ese
  // buffer solo se escribe hacia `format.fontSize` en blur/Enter, nunca al
  // revés — así que si `format.fontSize` cambia por otra vía (los steppers,
  // o cambiar la selección en el documento) el campo queda mostrando un
  // valor viejo hasta el próximo blur/Enter. Estos efectos lo resincronizan
  // cada vez que el valor real cambia. No pisan una edición en curso: mientras
  // el usuario tipea, `format.fontSize` no cambia (recién se actualiza en el
  // commit), así que el efecto no compite con el onChange del input.
  useEffect(() => {
    setFontSizeInput(format.fontSize.toString());
  }, [format.fontSize]);

  useEffect(() => {
    setLineSpacingInput(format.lineSpacing.toString());
  }, [format.lineSpacing]);

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
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowFontDropdown(!showFontDropdown)}
            style={{
              height: '32px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-lg)',
              fontFamily: format.fontFamily.includes(' ') ? `"${format.fontFamily}"` : format.fontFamily,
            }}
          >
            <span>{format.fontFamily}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>▾</span>
          </button>
          {showFontDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {fontOptions.map((font) => (
                <button
                  key={font}
                  onClick={() => {
                    setFontFamily(font);
                    setShowFontDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: font.includes(' ') ? `"${font}"` : font,
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
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
            <input
              type="number"
              value={fontSizeInput}
              onChange={(e) => setFontSizeInput(e.target.value)}
              onBlur={() => {
                const size = parseFloat(fontSizeInput);
                if (!isNaN(size) && size > 0) {
                  setFontSize(size);
                } else {
                  setFontSizeInput(format.fontSize.toString());
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const size = parseFloat(fontSizeInput);
                  if (!isNaN(size) && size > 0) {
                    setFontSize(size);
                  }
                }
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-md-lg)',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent',
                border: 'none',
                width: '40px',
                textAlign: 'center',
              }}
              min="1"
              step="1"
            />
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
              <button
                onClick={() => setFontSize(Math.min(format.fontSize + 1, 72))}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'inherit',
                }}
              >
                ▲
              </button>
              <button
                onClick={() => setFontSize(Math.max(format.fontSize - 1, 1))}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'inherit',
                }}
              >
                ▼
              </button>
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
            <input
              type="number"
              value={lineSpacingInput}
              onChange={(e) => setLineSpacingInput(e.target.value)}
              onBlur={() => {
                const spacing = parseFloat(lineSpacingInput);
                if (!isNaN(spacing) && spacing > 0) {
                  setLineSpacing(spacing);
                } else {
                  setLineSpacingInput(format.lineSpacing.toString());
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const spacing = parseFloat(lineSpacingInput);
                  if (!isNaN(spacing) && spacing > 0) {
                    setLineSpacing(spacing);
                  }
                }
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-md-lg)',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent',
                border: 'none',
                width: '40px',
                textAlign: 'center',
              }}
              min="0.5"
              step="0.1"
            />
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
              <button
                onClick={() => setLineSpacing(Math.min(format.lineSpacing + 0.1, 3))}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'inherit',
                }}
              >
                ▲
              </button>
              <button
                onClick={() => setLineSpacing(Math.max(format.lineSpacing - 0.1, 0.5))}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'inherit',
                }}
              >
                ▼
              </button>
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
          <button
            onClick={toggleBold}
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: format.bold ? 'var(--state-active)' : 'var(--surface)',
              border: format.bold ? '1px solid var(--border-strong)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 600,
              fontSize: 'var(--font-size-lg)',
              color: format.bold ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            B
          </button>
          <button
            onClick={toggleItalic}
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: format.italic ? 'var(--state-active)' : 'var(--surface)',
              border: format.italic ? '1px solid var(--border-strong)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontStyle: 'italic',
              fontSize: 'var(--font-size-lg)',
              color: format.italic ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            I
          </button>
          <button
            onClick={toggleUnderline}
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: format.underline ? 'var(--state-active)' : 'var(--surface)',
              border: format.underline ? '1px solid var(--border-strong)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-size-lg)',
              color: format.underline ? 'var(--text-primary)' : 'var(--text-secondary)',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            U
          </button>
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
          <button
            onClick={() => setAlignment('Left')}
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: format.alignment === 'Left' ? 'var(--state-active)' : 'var(--surface)',
              border: format.alignment === 'Left' ? '1px solid var(--border-strong)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              stroke={format.alignment === 'Left' ? 'var(--text-primary)' : 'var(--text-secondary)'}
              strokeWidth="1.2"
            >
              <line x1="2.5" y1="4" x2="13.5" y2="4"></line>
              <line x1="2.5" y1="8" x2="9.5" y2="8"></line>
              <line x1="2.5" y1="12" x2="11.5" y2="12"></line>
            </svg>
          </button>
          <button
            onClick={() => setAlignment('Center')}
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: format.alignment === 'Center' ? 'var(--state-active)' : 'var(--surface)',
              border: format.alignment === 'Center' ? '1px solid var(--border-strong)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              stroke={format.alignment === 'Center' ? 'var(--text-primary)' : 'var(--text-secondary)'}
              strokeWidth="1.2"
            >
              <line x1="2.5" y1="4" x2="13.5" y2="4"></line>
              <line x1="4.5" y1="8" x2="11.5" y2="8"></line>
              <line x1="3.5" y1="12" x2="12.5" y2="12"></line>
            </svg>
          </button>
          <button
            onClick={() => setAlignment('Right')}
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: format.alignment === 'Right' ? 'var(--state-active)' : 'var(--surface)',
              border: format.alignment === 'Right' ? '1px solid var(--border-strong)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              stroke={format.alignment === 'Right' ? 'var(--text-primary)' : 'var(--text-secondary)'}
              strokeWidth="1.2"
            >
              <line x1="2.5" y1="4" x2="13.5" y2="4"></line>
              <line x1="6.5" y1="8" x2="13.5" y2="8"></line>
              <line x1="4.5" y1="12" x2="13.5" y2="12"></line>
            </svg>
          </button>
          <button
            onClick={() => setAlignment('Justify')}
            style={{
              width: '44px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: format.alignment === 'Justify' ? 'var(--state-active)' : 'var(--surface)',
              border: format.alignment === 'Justify' ? '1px solid var(--border-strong)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              stroke={format.alignment === 'Justify' ? 'var(--text-primary)' : 'var(--text-secondary)'}
              strokeWidth="1.2"
            >
              <line x1="2.5" y1="4" x2="13.5" y2="4"></line>
              <line x1="2.5" y1="8" x2="13.5" y2="8"></line>
              <line x1="2.5" y1="12" x2="13.5" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }}></div>

      <button
        onClick={clearFormatting}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          width: '100%',
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
      </button>
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