import { useEffect, useState } from 'react';
import { listarArbol, type EntradaArbol } from '../lib/documentApi';

interface MoveModalProps {
  areaNombre: string;
  // Item que se esta moviendo (nombre + tipo). Su ubicacion actual es
  // `rutaOrigen` (la carpeta que lo contiene, [] = raiz del area).
  entrada: EntradaArbol;
  rutaOrigen: string[];
  moviendo: boolean;
  error: string | null;
  onConfirmar: (destino: string[]) => void;
  onCancelar: () => void;
}

/**
 * Modal de "Mover a...": selector navegable del arbol de Carpetas del Area
 * actual (mismo cascaron visual que NamePromptModal/ConfirmDeleteModal).
 * El usuario navega entrando a carpetas (clic en una fila) y confirma con
 * "Mover aquí" sobre la carpeta que este viendo en ese momento — no hay
 * seleccion de fila separada de la navegacion, la ubicacion actual del
 * selector ES el destino propuesto.
 *
 * Si lo que se mueve es una Carpeta, esa carpeta se deshabilita en el
 * listado (no se puede clickear para entrar ni elegir como destino) —
 * como nunca se puede navegar adentro de ella, ninguna de sus subcarpetas
 * llega a aparecer en el selector tampoco. Es una restriccion visual, en
 * paralelo a la que ya aplica el backend.
 */
export default function MoveModal({
  areaNombre,
  entrada,
  rutaOrigen,
  moviendo,
  error,
  onConfirmar,
  onCancelar,
}: MoveModalProps) {
  const [rutaActual, setRutaActual] = useState<string[]>(rutaOrigen);
  const [carpetas, setCarpetas] = useState<EntradaArbol[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Ruta completa de la carpeta que se esta moviendo (si `entrada` es una
  // carpeta) — cualquier fila cuya ruta coincida con esta queda deshabilitada.
  const rutaBloqueada = entrada.tipo === 'carpeta' ? [...rutaOrigen, entrada.nombre] : null;

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setErrorCarga(null);
    listarArbol(areaNombre, rutaActual)
      .then((lista) => {
        if (cancelado) return;
        const soloCarpetas = lista
          .filter((e) => e.tipo === 'carpeta')
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        setCarpetas(soloCarpetas);
      })
      .catch((err) => {
        if (cancelado) return;
        console.error(`Error listando carpetas de "${areaNombre}/${rutaActual.join('/')}":`, err);
        setErrorCarga('Error al listar las carpetas');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [areaNombre, rutaActual.join('/')]);

  const esRutaBloqueada = (ruta: string[]) =>
    rutaBloqueada !== null &&
    ruta.length === rutaBloqueada.length &&
    ruta.every((seg, i) => seg === rutaBloqueada[i]);

  const yaEstaAqui = rutaActual.join('/') === rutaOrigen.join('/');
  const segmentos = [areaNombre, ...rutaActual];

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
        if (!moviendo) onCancelar();
      }}
    >
      <div
        style={{
          width: '440px',
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
            Mover &quot;{entrada.nombre}&quot;
          </span>
          <button
            onClick={onCancelar}
            disabled={moviendo}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: moviendo ? 'default' : 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: 'var(--font-size-md)',
            flexWrap: 'wrap',
          }}
        >
          {segmentos.map((label, i) => {
            const esUltimo = i === segmentos.length - 1;
            const rutaSegmento = segmentos.slice(1, i + 1);
            return (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {i > 0 && <span style={{ color: 'var(--text-faint)' }}>/</span>}
                {esUltimo ? (
                  <span style={{ color: 'var(--text-primary)' }}>{label}</span>
                ) : (
                  <button
                    onClick={() => setRutaActual(rutaSegmento)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-md)',
                    }}
                  >
                    {label}
                  </button>
                )}
              </span>
            );
          })}
        </div>

        <div style={{ minHeight: '160px', maxHeight: '260px', overflow: 'auto', padding: '6px' }}>
          {cargando ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-md-lg)', padding: '24px 0', textAlign: 'center' }}>
              Cargando…
            </div>
          ) : errorCarga ? (
            <div style={{ color: 'var(--status-error)', fontSize: 'var(--font-size-md-lg)', padding: '24px 0', textAlign: 'center' }}>
              {errorCarga}
            </div>
          ) : carpetas.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-md-lg)', padding: '24px 0', textAlign: 'center' }}>
              No hay subcarpetas acá
            </div>
          ) : (
            carpetas.map((carpeta) => {
              const rutaCarpeta = [...rutaActual, carpeta.nombre];
              const bloqueada = esRutaBloqueada(rutaCarpeta);
              return (
                <button
                  key={carpeta.nombre}
                  disabled={bloqueada}
                  onClick={() => setRutaActual(rutaCarpeta)}
                  title={bloqueada ? 'No se puede mover una carpeta dentro de sí misma' : undefined}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 9px',
                    borderRadius: 'var(--radius-md)',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: bloqueada ? 'not-allowed' : 'pointer',
                    opacity: bloqueada ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!bloqueada) e.currentTarget.style.backgroundColor = 'var(--surface-raised)';
                  }}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.2" style={{ flexShrink: 0 }}>
                    <path d="M2 5.5V3.5a1 1 0 011-1h2.8l1.2 1.4H13a1 1 0 011 1v7.6a1 1 0 01-1 1H3a1 1 0 01-1-1z"></path>
                  </svg>
                  <span style={{ fontSize: 'var(--font-size-md-lg)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {carpeta.nombre}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {error && (
          <div style={{ padding: '0 16px 8px' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--status-error)' }}>{error}</span>
          </div>
        )}

        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            {yaEstaAqui ? 'Ya está en esta ubicación' : `Destino: ${segmentos.join('/')}`}
          </span>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={onCancelar}
              disabled={moviendo}
              style={{
                height: '32px',
                padding: '0 14px',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--font-size-md-lg)',
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: moviendo ? 'default' : 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirmar(rutaActual)}
              disabled={moviendo || yaEstaAqui}
              style={{
                height: '32px',
                padding: '0 14px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--accent)',
                fontSize: 'var(--font-size-md-lg)',
                fontWeight: 500,
                color: 'var(--bg-base)',
                border: 'none',
                cursor: moviendo || yaEstaAqui ? 'default' : 'pointer',
                opacity: moviendo || yaEstaAqui ? 0.6 : 1,
              }}
            >
              {moviendo ? 'Moviendo…' : 'Mover aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
