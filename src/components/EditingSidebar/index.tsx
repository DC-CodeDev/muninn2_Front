import { useState } from 'react';
import type { DocumentEditor } from '@syncfusion/ej2-documenteditor';
import { useFormatControls } from '../../hooks/useFormatControls';
import { useDocumentTheme } from '../../hooks/useDocumentTheme';
import { TextTabContent } from './TextTabContent';
import { InsertTabContent } from './InsertTabContent';
import { PlaceholderTabContent } from './PlaceholderTabContent';

type TabType = 'texto' | 'parrafo' | 'insertar' | 'revisar';

interface EditingSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  getEditor: () => DocumentEditor | null | undefined;
}

export default function EditingSidebar({ collapsed, onToggle, getEditor }: EditingSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('texto');
  const formatControls = useFormatControls(getEditor);
  useDocumentTheme(getEditor);

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
        {activeTab === 'insertar' && (
          <InsertTabContent
            getEditor={getEditor}
            isImageSelected={formatControls.format.isImageSelected}
            setImageWidthSimple={formatControls.setImageWidthSimple}
            setImageWidthFull={formatControls.setImageWidthFull}
          />
        )}
        {activeTab === 'revisar' && <PlaceholderTabContent />}
      </div>
    </div>
  );
}
