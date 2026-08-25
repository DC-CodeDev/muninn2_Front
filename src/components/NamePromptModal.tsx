import { useState } from 'react';
import { NOMBRE_VALIDO } from '../lib/documentApi';

interface NamePromptModalProps {
  titulo: string;
  etiquetaCampo: string;
  textoConfirmar: string;
  onConfirmar: (nombre: string) => void;
  onCancelar: () => void;
}

/**
 * Modal minimo para pedir un nombre de segmento (carpeta o documento
 * nuevo), con el mismo cascaron visual que el formulario de crear Area
 * (ver 3b del diseño de referencia): panel de 400px, header de 44px,
 * footer con Cancelar/Confirmar. Valida con la misma regla que el
 * backend (NOMBRE_VALIDO) antes de confirmar.
 */
export default function NamePromptModal({
  titulo,
  etiquetaCampo,
  textoConfirmar,
  onConfirmar,
  onCancelar,
}: NamePromptModalProps) {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);

  const confirmar = () => {
    if (!NOMBRE_VALIDO.test(nombre)) {
      setError('Solo letras, números, guiones y guiones bajos.');
      return;
    }
    onConfirmar(nombre);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onCancelar}
    >
      <div
        style={{
          width: '400px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>{titulo}</span>
          <button
            onClick={onCancelar}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xs)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            {etiquetaCampo}
          </div>
          <input
            autoFocus
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmar();
              if (e.key === 'Escape') onCancelar();
            }}
            style={{
              height: '36px',
              padding: '0 10px',
              backgroundColor: 'var(--bg-base)',
              border: `1px solid ${error ? 'var(--status-error)' : 'var(--accent)'}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: error ? 'none' : '0 0 0 2px rgba(199,164,106,0.20)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-xl)',
              fontFamily: 'var(--font-ui)',
              outline: 'none',
            }}
          />
          {error && (
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--status-error)' }}>{error}</span>
          )}
        </div>

        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <button
            onClick={onCancelar}
            style={{
              height: '32px',
              padding: '0 14px',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-size-md-lg)',
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            style={{
              height: '32px',
              padding: '0 14px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--accent)',
              fontSize: 'var(--font-size-md-lg)',
              fontWeight: 500,
              color: 'var(--bg-base)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
