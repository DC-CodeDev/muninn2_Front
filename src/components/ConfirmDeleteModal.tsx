export type TipoEliminable = 'carpeta' | 'documento';

interface ConfirmDeleteModalProps {
  nombre: string;
  tipo: TipoEliminable;
  eliminando: boolean;
  error: string | null;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ETIQUETA_TIPO: Record<TipoEliminable, string> = {
  carpeta: 'carpeta',
  documento: 'documento',
};

/**
 * Modal de confirmacion de borrado de Carpetas y Documentos, mismo
 * cascaron visual que NamePromptModal/CreateAreaModal (panel de 400px,
 * header de 44px, footer con Cancelar/Confirmar). A diferencia de esos, no
 * pide input — solo confirma una accion destructiva, por eso el boton de
 * confirmar usa el color de error en vez de accent. Carpeta muestra
 * advertencia de contenido (se borra todo lo que tenga adentro); Documento
 * no, porque es un archivo simple.
 *
 * Las Areas usan un modal aparte (ConfirmDeleteAreaModal) que exige
 * escribir el nombre exacto antes de habilitar el borrado — reforzado por
 * ser la operacion mas destructiva de las tres.
 */
export default function ConfirmDeleteModal({
  nombre,
  tipo,
  eliminando,
  error,
  onConfirmar,
  onCancelar,
}: ConfirmDeleteModalProps) {
  const conAdvertenciaDeContenido = tipo === 'carpeta';

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
          <span style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>
            Eliminar {ETIQUETA_TIPO[tipo]}
          </span>
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

          {conAdvertenciaDeContenido ? (
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
              Se eliminará todo el contenido de esta carpeta (subcarpetas y documentos
              incluidos). Esta acción no se puede deshacer.
            </div>
          ) : (
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Esta acción no se puede deshacer.
            </div>
          )}

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
            onClick={onConfirmar}
            disabled={eliminando}
            style={{
              height: '32px',
              padding: '0 14px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--status-error)',
              fontSize: 'var(--font-size-md-lg)',
              fontWeight: 500,
              color: 'var(--bg-base)',
              border: 'none',
              cursor: eliminando ? 'default' : 'pointer',
              opacity: eliminando ? 0.7 : 1,
            }}
          >
            {eliminando ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
