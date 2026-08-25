import { useState } from 'react';
import { NOMBRE_VALIDO } from '../lib/documentApi';
import { COLORES_AREA, COLOR_HEX, type ColorArea } from '../lib/colores';

interface CreateAreaModalProps {
  onConfirmar: (nombre: string, color: ColorArea) => void;
  onCancelar: () => void;
}

/**
 * Formulario de creacion de Area: nombre + paleta fija de 8 colores +
 * previsualizacion en vivo de la card resultante. Replica 3b del diseño de
 * referencia (panel de 400px, grid de color de 8 columnas, anillo de
 * seleccion de 1.5px del propio color con gap de 2px al fondo).
 */
export default function CreateAreaModal({ onConfirmar, onCancelar }: CreateAreaModalProps) {
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState<ColorArea>('c6');
  const [error, setError] = useState<string | null>(null);

  const confirmar = () => {
    if (!NOMBRE_VALIDO.test(nombre)) {
      setError('Solo letras, números, guiones y guiones bajos.');
      return;
    }
    onConfirmar(nombre, color);
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
          <span style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>Nueva Area</span>
          <button
            onClick={onCancelar}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              Nombre
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
            {error && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--status-error)' }}>{error}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-xs)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              Color
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: '8px' }}>
              {COLORES_AREA.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={c}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: COLOR_HEX[c],
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    boxShadow:
                      color === c
                        ? `0 0 0 2px var(--surface), 0 0 0 3.5px ${COLOR_HEX[c]}`
                        : 'none',
                  }}
                />
              ))}
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
              Previsualización
            </div>
            <div
              style={{
                position: 'relative',
                height: '74px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '14px 14px 12px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '12px',
                  bottom: '12px',
                  width: '3px',
                  borderRadius: '0 2px 2px 0',
                  backgroundColor: COLOR_HEX[color],
                }}
              />
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {nombre || 'Nombre del área'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                }}
              >
                Sin documentos
              </div>
            </div>
          </div>
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
            Crear Area
          </button>
        </div>
      </div>
    </div>
  );
}
