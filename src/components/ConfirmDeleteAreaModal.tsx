import { useState } from 'react';

interface ConfirmDeleteAreaModalProps {
  nombre: string;
  eliminando: boolean;
  error: string | null;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Modal de confirmacion de borrado exclusivo de Areas — a diferencia de
 * ConfirmDeleteModal (Carpetas/Documentos, confirmacion simple), este pide
 * escribir el nombre exacto del Area para habilitar el boton de eliminar
 * (mismo patron que usa GitHub al borrar un repositorio). Coincidencia
 * exacta, sensible a mayusculas/minusculas — sin normalizar el input.
 *
 * El campo de texto vive en el estado local del componente, no en el
 * padre: como WorkspacesView solo renderiza este modal condicionalmente
 * (`{areaAEliminar && <ConfirmDeleteAreaModal ... />}`), cerrar/cancelar
 * desmonta el componente y el siguiente open es un mount nuevo — el texto
 * queda limpio sin necesidad de resetearlo a mano.
 */
export default function ConfirmDeleteAreaModal({
  nombre,
  eliminando,
  error,
  onConfirmar,
  onCancelar,
}: ConfirmDeleteAreaModalProps) {
  const [texto, setTexto] = useState('');
  const coincide = texto === nombre;

  const confirmar = () => {
    if (coincide && !eliminando) onConfirmar();
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
      onClick={() => {
        if (!eliminando) onCancelar();
      }}
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
          <span style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>Eliminar área</span>
          <button
            onClick={onCancelar}
            disabled={eliminando}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: eliminando ? 'default' : 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            ¿Eliminar <strong>&quot;{nombre}&quot;</strong>?
          </div>

          <div
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--status-error)',
              backgroundColor: 'rgba(196,116,106,0.12)',
              border: '1px solid rgba(196,116,106,0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '10px 12px',
              lineHeight: 1.6,
            }}
          >
            Se eliminará todo el contenido de esta área (carpetas y documentos incluidos). Esta
            acción no se puede deshacer.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '4px' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-xs)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              Escribí <strong style={{ color: 'var(--text-secondary)' }}>{nombre}</strong> para confirmar
            </div>
            <input
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmar();
                if (e.key === 'Escape') onCancelar();
              }}
              disabled={eliminando}
              style={{
                height: '36px',
                padding: '0 10px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 0 0 2px rgba(199,164,106,0.20)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-xl)',
                fontFamily: 'var(--font-ui)',
                outline: 'none',
              }}
            />
          </div>

          {error && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--status-error)' }}>{error}</span>}
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
            disabled={eliminando}
            style={{
              height: '32px',
              padding: '0 14px',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-size-md-lg)',
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              cursor: eliminando ? 'default' : 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={!coincide || eliminando}
            style={{
              height: '32px',
              padding: '0 14px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--status-error)',
              fontSize: 'var(--font-size-md-lg)',
              fontWeight: 500,
              color: 'var(--bg-base)',
              border: 'none',
              cursor: !coincide || eliminando ? 'default' : 'pointer',
              opacity: !coincide || eliminando ? 0.4 : 1,
            }}
          >
            {eliminando ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
