import { useEffect, useState } from 'react';

interface ItemMenuProps {
  onEliminar: () => void;
  // Opcional: solo AreaTreeView lo pasa (Carpetas y Documentos dentro de un
  // Area). WorkspacesView no lo pasa — mover Areas queda fuera de alcance —
  // asi que ahi el item "Mover a..." ni se renderiza.
  onMover?: () => void;
}

/**
 * Menu de tres puntos ("···", ver diseño de referencia — ahí es solo un
 * placeholder visual sin funcionalidad) con Eliminar y, opcionalmente,
 * Mover a... (ver onMover). El wrapper frena la propagacion de todos sus
 * clicks (trigger, panel, item) para no disparar el onClick de la card/fila
 * contenedora (abrir el Area, navegar a la carpeta, abrir el documento).
 */
export default function ItemMenu({ onEliminar, onMover }: ItemMenuProps) {
  const [abierto, setAbierto] = useState(false);

  // Cierra al clickear afuera. Se agrega despues del commit (useEffect), no
  // durante el click que abre el menu, asi que no se auto-cierra ese mismo
  // click.
  useEffect(() => {
    if (!abierto) return;
    const cerrar = () => setAbierto(false);
    document.addEventListener('click', cerrar);
    return () => document.removeEventListener('click', cerrar);
  }, [abierto]);

  return (
    <div style={{ position: 'relative', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setAbierto((v) => !v)}
        title="Más opciones"
        style={{
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          color: abierto ? 'var(--text-secondary)' : 'var(--text-faint)',
          fontSize: '12px',
          letterSpacing: '1px',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        ···
      </button>

      {abierto && (
        <div
          style={{
            position: 'absolute',
            top: '24px',
            right: 0,
            minWidth: '140px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            zIndex: 60,
          }}
        >
          {onMover && (
            <button
              onClick={() => {
                setAbierto(false);
                onMover();
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '7px 9px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-md-lg)',
                color: 'var(--text-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Mover a...
            </button>
          )}
          <button
            onClick={() => {
              setAbierto(false);
              onEliminar();
            }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '7px 9px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-md-lg)',
              color: 'var(--status-error)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
