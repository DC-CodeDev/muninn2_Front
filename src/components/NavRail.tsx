interface NavRailProps {
  /** Que pantalla esta activa: resalta el icono correspondiente (grid = Workspaces, documento = dentro de un Area). */
  activo: 'workspaces' | 'area';
  /** Color hex del Area activa (barra de acento junto al icono "documento"). Solo aplica con activo==='area'. */
  colorArea?: string;
  /** Navega a la pantalla de Workspaces. Se ignora si ya esta activa. */
  onIrWorkspaces: () => void;
  /** Accion del boton circular "+" del fondo. Si se omite, el boton queda visible pero inerte (sin accion definida todavia en esta pantalla). */
  onCrear?: () => void;
  /** Tooltip del boton "+". */
  tituloCrear?: string;
}

const tamañoIcono = { width: '32px', height: '32px', borderRadius: 'var(--radius-lg)' } as const;

/**
 * Rail de navegacion colapsado de 48px, compartido entre Workspaces (3a) y
 * la vista dentro de un Area (3c) del diseño de referencia: circulo/logo
 * arriba, columna de iconos de navegacion (grid, documento, buscar,
 * configuracion) y el boton "+" circular fijo abajo del todo. Solo el icono
 * de grid (volver a Workspaces) y el boton "+" tienen accion real hoy —
 * documento/buscar/configuracion se renderizan inertes, igual que en el
 * mockup, para no fabricar affordances que todavia no hacen nada.
 */
export default function NavRail({ activo, colorArea, onIrWorkspaces, onCrear, tituloCrear }: NavRailProps) {
  return (
    <div
      style={{
        width: '48px',
        flexShrink: 0,
        backgroundColor: 'var(--bg-base)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
      }}
    >
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          border: '1.5px solid var(--accent)',
          marginBottom: '28px',
          flexShrink: 0,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
        <button
          onClick={onIrWorkspaces}
          title="Areas"
          style={{
            ...tamañoIcono,
            backgroundColor: activo === 'workspaces' ? 'var(--surface-raised)' : 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            stroke={activo === 'workspaces' ? 'var(--text-primary)' : 'var(--text-muted)'}
            strokeWidth="1.2"
          >
            <rect x="2" y="2.5" width="5" height="5" rx="1"></rect>
            <rect x="9" y="2.5" width="5" height="5" rx="1"></rect>
            <rect x="2" y="8.5" width="5" height="5" rx="1"></rect>
            <rect x="9" y="8.5" width="5" height="5" rx="1"></rect>
          </svg>
        </button>

        <div style={{ position: 'relative' }}>
          {activo === 'area' && (
            <div
              style={{
                position: 'absolute',
                left: '-8px',
                top: '8px',
                bottom: '8px',
                width: '2px',
                borderRadius: '2px',
                backgroundColor: colorArea ?? 'var(--accent)',
              }}
            />
          )}
          <div
            title="Documento"
            style={{
              ...tamañoIcono,
              backgroundColor: activo === 'area' ? 'var(--surface-raised)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              stroke={activo === 'area' ? 'var(--text-primary)' : 'var(--text-muted)'}
              strokeWidth="1.2"
            >
              <path d="M3.5 2.5h6l3 3v8h-9z"></path>
              <path d="M9.5 2.5v3h3"></path>
            </svg>
          </div>
        </div>

        <div title="Buscar" style={{ ...tamañoIcono, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.3">
            <circle cx="7" cy="7" r="4.5"></circle>
            <line x1="10.5" y1="10.5" x2="14" y2="14"></line>
          </svg>
        </div>

        <div title="Configuración" style={{ ...tamañoIcono, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.2">
            <circle cx="8" cy="8" r="2"></circle>
            <path d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1"></path>
          </svg>
        </div>
      </div>

      <button
        onClick={onCrear}
        disabled={!onCrear}
        title={tituloCrear ?? 'Crear'}
        style={{
          marginTop: 'auto',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: onCrear ? 'pointer' : 'default',
          opacity: onCrear ? 1 : 0.5,
          flexShrink: 0,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" stroke="var(--bg-base)" strokeWidth="1.6">
          <line x1="8" y1="3" x2="8" y2="13"></line>
          <line x1="3" y1="8" x2="13" y2="8"></line>
        </svg>
      </button>
    </div>
  );
}
