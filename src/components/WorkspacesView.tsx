import { useState } from 'react';
import type { AreaMeta } from '../lib/documentApi';
import { colorAHex, type ColorArea } from '../lib/colores';
import CreateAreaModal from './CreateAreaModal';
import ConfirmDeleteAreaModal from './ConfirmDeleteAreaModal';
import ItemMenu from './ItemMenu';
import NavRail from './NavRail';
import ThemeToggle from './ThemeToggle';

interface WorkspacesViewProps {
  areas: AreaMeta[];
  cargando: boolean;
  onAbrirArea: (area: AreaMeta) => void;
  onCrearArea: (nombre: string, color: ColorArea) => Promise<void>;
  onEliminarArea: (nombre: string) => Promise<void>;
}

/**
 * Pantalla de entrada de la app: grid de Areas (3a del diseño de
 * referencia). Cada card tiene la barra de acento de 3px del color
 * mapeado a la izquierda. El boton "Nueva Area" abre el formulario 3b.
 */
export default function WorkspacesView({ areas, cargando, onAbrirArea, onCrearArea, onEliminarArea }: WorkspacesViewProps) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [creando, setCreando] = useState(false);
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null);

  const [areaAEliminar, setAreaAEliminar] = useState<AreaMeta | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState<string | null>(null);

  const confirmarCreacion = async (nombre: string, color: ColorArea) => {
    setCreando(true);
    setErrorCreacion(null);
    try {
      await onCrearArea(nombre, color);
      setModalAbierto(false);
    } catch (err) {
      setErrorCreacion(err instanceof Error ? err.message : 'Error al crear el área');
    } finally {
      setCreando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!areaAEliminar) return;
    setEliminando(true);
    setErrorEliminacion(null);
    try {
      await onEliminarArea(areaAEliminar.nombre);
      setAreaAEliminar(null);
    } catch (err) {
      setErrorEliminacion(err instanceof Error ? err.message : 'Error al eliminar el área');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', backgroundColor: 'var(--bg-base)' }}>
      <NavRail activo="workspaces" onIrWorkspaces={() => {}} onCrear={() => setModalAbierto(true)} tituloCrear="Nueva Area" />

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)', overflow: 'auto' }}>
        <div style={{ padding: '28px 32px 32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Areas
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-md)', color: 'var(--text-muted)' }}>
              {areas.length} area{areas.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div
              title="Buscar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-secondary)" strokeWidth="1.3">
                <circle cx="7" cy="7" r="4.5"></circle>
                <line x1="10.5" y1="10.5" x2="14" y2="14"></line>
              </svg>
            </div>
            <div
              title="Filtrar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" stroke="var(--text-secondary)" strokeWidth="1.2">
                <line x1="2.5" y1="4.5" x2="13.5" y2="4.5"></line>
                <line x1="4.5" y1="8" x2="11.5" y2="8"></line>
                <line x1="6.5" y1="11.5" x2="9.5" y2="11.5"></line>
              </svg>
            </div>
            <ThemeToggle integrated />
          </div>
        </div>

        {cargando ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-lg)', padding: '40px 0', textAlign: 'center' }}>
            Cargando…
          </div>
        ) : areas.length === 0 ? (
          <div
            style={{
              height: '300px',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', opacity: 0.5 }}>
              <div style={{ width: '34px', height: '44px', borderRadius: '5px', border: '1px dashed var(--border-strong)' }} />
              <div style={{ width: '34px', height: '44px', borderRadius: '5px', border: '1px dashed var(--border-strong)' }} />
              <div style={{ width: '34px', height: '44px', borderRadius: '5px', border: '1px dashed var(--border-strong)' }} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>Todavía no hay Areas</div>
            <div style={{ fontSize: 'var(--font-size-lg)', lineHeight: 1.7, color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>
              Un Area agrupa las carpetas y documentos de una materia. Creá la primera para empezar a escribir.
            </div>
            <button
              onClick={() => setModalAbierto(true)}
              style={{
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 16px',
                backgroundColor: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" stroke="var(--bg-base)" strokeWidth="1.6">
                <line x1="8" y1="3" x2="8" y2="13"></line>
                <line x1="3" y1="8" x2="13" y2="8"></line>
              </svg>
              <span style={{ fontSize: 'var(--font-size-md-lg)', fontWeight: 500, color: 'var(--bg-base)' }}>Crear Area</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {areas.map((area) => (
              <div
                key={area.nombre}
                role="button"
                tabIndex={0}
                onClick={() => onAbrirArea(area)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onAbrirArea(area);
                }}
                style={{
                  position: 'relative',
                  height: '124px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '16px 16px 14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '14px',
                    bottom: '14px',
                    width: '3px',
                    borderRadius: '0 2px 2px 0',
                    backgroundColor: colorAHex(area.color),
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9.5px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Area
                  </span>
                  <ItemMenu onEliminar={() => setAreaAEliminar(area)} />
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{area.nombre}</div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setModalAbierto(true)}
              style={{
                height: '124px',
                border: '1px dashed var(--border-strong)',
                borderRadius: 'var(--radius-xl)',
                background: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" stroke="var(--accent)" strokeWidth="1.4">
                <line x1="8" y1="3" x2="8" y2="13"></line>
                <line x1="3" y1="8" x2="13" y2="8"></line>
              </svg>
              <span style={{ fontSize: 'var(--font-size-md-lg)', color: 'var(--text-muted)' }}>Nueva Area</span>
            </button>
          </div>
        )}
        </div>

        {modalAbierto && (
          <CreateAreaModal
            onConfirmar={confirmarCreacion}
            onCancelar={() => {
              if (!creando) {
                setModalAbierto(false);
                setErrorCreacion(null);
              }
            }}
          />
        )}
        {errorCreacion && modalAbierto && (
          <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: 'var(--status-error)', color: 'var(--bg-base)', padding: '10px 14px', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-lg)', zIndex: 200 }}>
            {errorCreacion}
          </div>
        )}

        {areaAEliminar && (
          <ConfirmDeleteAreaModal
            nombre={areaAEliminar.nombre}
            eliminando={eliminando}
            error={errorEliminacion}
            onConfirmar={() => void confirmarEliminacion()}
            onCancelar={() => {
              if (!eliminando) {
                setAreaAEliminar(null);
                setErrorEliminacion(null);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
