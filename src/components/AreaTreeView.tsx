import { useEffect, useState } from 'react';
import { listarArbol, crearCarpeta, eliminarEntrada, moverEntrada, type AreaMeta, type EntradaArbol } from '../lib/documentApi';
import { colorAHex } from '../lib/colores';
import { formatearFecha } from '../lib/formatearFecha';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ItemMenu from './ItemMenu';
import MoveModal from './MoveModal';
import NamePromptModal from './NamePromptModal';
import NavRail from './NavRail';
import ThemeToggle from './ThemeToggle';

interface AreaTreeViewProps {
  area: AreaMeta;
  ruta: string[];
  onNavegarRuta: (ruta: string[]) => void;
  onVolverWorkspaces: () => void;
  onAbrirDocumento: (nombreDocumento: string) => void;
}

/**
 * Vista dentro de un Area (3c del diseño de referencia): listado mixto de
 * carpetas y documentos en `ruta`, con navegacion recursiva (click en
 * carpeta entra, mismo componente) y breadcrumb truncado (3d) para volver
 * atras. Elegi lista en vez de grid, igual que el diseño de referencia:
 * los nombres son largos y la fecha ayuda a reencontrar material.
 */
export default function AreaTreeView({
  area,
  ruta,
  onNavegarRuta,
  onVolverWorkspaces,
  onAbrirDocumento,
}: AreaTreeViewProps) {
  const [entradas, setEntradas] = useState<EntradaArbol[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalTipo, setModalTipo] = useState<'carpeta' | 'documento' | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [pillAbierta, setPillAbierta] = useState(false);

  const [entradaAEliminar, setEntradaAEliminar] = useState<EntradaArbol | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState<string | null>(null);

  const [entradaAMover, setEntradaAMover] = useState<EntradaArbol | null>(null);
  const [moviendo, setMoviendo] = useState(false);
  const [errorMovimiento, setErrorMovimiento] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const lista = await listarArbol(area.nombre, ruta);
      // Carpetas primero, documentos despues; alfabetico dentro de cada grupo.
      lista.sort((a, b) => {
        if (a.tipo !== b.tipo) return a.tipo === 'carpeta' ? -1 : 1;
        return a.nombre.localeCompare(b.nombre);
      });
      setEntradas(lista);
    } catch (err) {
      console.error(`Error listando "${area.nombre}/${ruta.join('/')}":`, err);
      setEntradas([]);
    } finally {
      setCargando(false);
    }
  };

  // Se re-lista cada vez que cambia el area o la ruta (navegacion recursiva).
  // `ruta.join('/')` como dependencia en vez de `ruta` evita re-listar si el
  // padre pasa un array con el mismo contenido pero distinta identidad.
  useEffect(() => {
    void cargar();
  }, [area.nombre, ruta.join('/')]);

  const confirmarCarpeta = async (nombre: string) => {
    try {
      await crearCarpeta(area.nombre, ruta, nombre);
      setModalTipo(null);
      setErrorAccion(null);
      await cargar();
    } catch (err) {
      setErrorAccion(err instanceof Error ? err.message : 'Error al crear la carpeta');
    }
  };

  const confirmarDocumento = (nombre: string) => {
    // No hay endpoint de "crear documento vacio": el archivo se materializa
    // recien con el primer guardado del editor (PUT). El chequeo de
    // colision se hace igual, contra el listado ya cargado de este nivel,
    // para no dejar que el usuario entre a escribir sobre un nombre que va
    // a chocar recien al guardar.
    if (entradas.some((e) => e.nombre === nombre)) {
      setErrorAccion(`Ya existe algo llamado "${nombre}" en esta ubicación`);
      return;
    }
    setModalTipo(null);
    setErrorAccion(null);
    onAbrirDocumento(nombre);
  };

  const confirmarEliminacion = async () => {
    if (!entradaAEliminar) return;
    setEliminando(true);
    setErrorEliminacion(null);
    try {
      await eliminarEntrada(area.nombre, ruta, entradaAEliminar.nombre);
      setEntradaAEliminar(null);
      await cargar();
    } catch (err) {
      setErrorEliminacion(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setEliminando(false);
    }
  };

  const confirmarMovimiento = async (destino: string[]) => {
    if (!entradaAMover) return;
    setMoviendo(true);
    setErrorMovimiento(null);
    try {
      await moverEntrada(area.nombre, ruta, entradaAMover.nombre, destino);
      setEntradaAMover(null);
      await cargar();
    } catch (err) {
      setErrorMovimiento(err instanceof Error ? err.message : 'Error al mover');
    } finally {
      setMoviendo(false);
    }
  };

  const carpetas = entradas.filter((e) => e.tipo === 'carpeta');
  const documentos = entradas.filter((e) => e.tipo === 'documento');
  const nombreActual = ruta.length === 0 ? area.nombre : ruta[ruta.length - 1];

  // Breadcrumb: [area, ...ruta]. Clickear el segmento i navega a ruta.slice(0, i).
  const segmentos = [area.nombre, ...ruta];
  const truncar = segmentos.length > 3;
  const ocultos = truncar
    ? segmentos.slice(1, segmentos.length - 2).map((label, j) => ({ label, index: 1 + j }))
    : [];
  const visiblesFinales = truncar ? segmentos.slice(segmentos.length - 2) : segmentos.slice(1);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', backgroundColor: 'var(--bg-base)' }}>
      <NavRail activo="area" colorArea={colorAHex(area.color)} onIrWorkspaces={onVolverWorkspaces} />

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
      <div
        style={{
          height: '44px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0 20px',
          backgroundColor: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <button
          onClick={() => (ruta.length === 0 ? onVolverWorkspaces() : onNavegarRuta(ruta.slice(0, -1)))}
          title="Subir un nivel (⌘↑)"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--text-secondary)" strokeWidth="1.4">
            <path d="M9.5 3.5L5 8l4.5 4.5"></path>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-md-lg)', minWidth: 0, position: 'relative' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: colorAHex(area.color), flexShrink: 0 }} />
          <button
            onClick={() => onNavegarRuta([])}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 'var(--font-size-md-lg)' }}
          >
            {area.nombre}
          </button>

          {truncar && (
            <>
              <span style={{ color: 'var(--text-faint)' }}>/</span>
              <button
                onClick={() => setPillAbierta((v) => !v)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-md)',
                  color: 'var(--accent)',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1px 6px',
                  cursor: 'pointer',
                }}
              >
                …{ocultos.length}
              </button>
              {pillAbierta && (
                <div
                  style={{
                    position: 'absolute',
                    top: '28px',
                    left: '76px',
                    minWidth: '180px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                    zIndex: 50,
                  }}
                >
                  {ocultos.map((seg) => (
                    <button
                      key={seg.index}
                      onClick={() => {
                        setPillAbierta(false);
                        onNavegarRuta(ruta.slice(0, seg.index));
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '7px 9px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-md-lg)',
                        color: 'var(--text-secondary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-raised)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {seg.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {visiblesFinales.map((label, i) => {
            const esUltimo = i === visiblesFinales.length - 1;
            const indiceGlobal = segmentos.length - visiblesFinales.length + i;
            return (
              <span key={indiceGlobal} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span style={{ color: 'var(--text-faint)' }}>/</span>
                {esUltimo ? (
                  <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                ) : (
                  <button
                    onClick={() => onNavegarRuta(ruta.slice(0, indiceGlobal))}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 'var(--font-size-md-lg)' }}
                  >
                    {label}
                  </button>
                )}
              </span>
            );
          })}
        </div>

        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <ThemeToggle integrated />
        </div>
      </div>

      <div style={{ padding: '26px 32px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{nombreActual}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-md)', color: 'var(--text-muted)' }}>
            {carpetas.length} carpeta{carpetas.length !== 1 ? 's' : ''} · {documentos.length} documento{documentos.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setModalTipo('carpeta')}
            style={{
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '0 12px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--text-secondary)" strokeWidth="1.2">
              <path d="M2 5.5V3.5a1 1 0 011-1h2.8l1.2 1.4H13a1 1 0 011 1v7.6a1 1 0 01-1 1H3a1 1 0 01-1-1z"></path>
            </svg>
            <span style={{ fontSize: 'var(--font-size-md-lg)', color: 'var(--text-primary)' }}>Nueva carpeta</span>
          </button>
          <button
            onClick={() => setModalTipo('documento')}
            style={{
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '0 12px',
              backgroundColor: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--bg-base)" strokeWidth="1.3">
              <path d="M3.5 2.5h6l3 3v8h-9z"></path>
              <path d="M9.5 2.5v3h3"></path>
            </svg>
            <span style={{ fontSize: 'var(--font-size-md-lg)', fontWeight: 500, color: 'var(--bg-base)' }}>Nuevo documento</span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '0 32px 24px' }}>
        {cargando ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-lg)', padding: '40px 0', textAlign: 'center' }}>Cargando…</div>
        ) : entradas.length === 0 ? (
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
            <svg width="30" height="30" viewBox="0 0 16 16" fill="none" stroke="var(--border-strong)" strokeWidth="1">
              <path d="M2 5.5V3.5a1 1 0 011-1h2.8l1.2 1.4H13a1 1 0 011 1v7.6a1 1 0 01-1 1H3a1 1 0 01-1-1z"></path>
            </svg>
            <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>Esta carpeta está vacía</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <button
                onClick={() => setModalTipo('carpeta')}
                style={{ height: '32px', display: 'flex', alignItems: 'center', gap: '7px', padding: '0 12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 'var(--font-size-md-lg)', color: 'var(--text-primary)' }}>Nueva carpeta</span>
              </button>
              <button
                onClick={() => setModalTipo('documento')}
                style={{ height: '32px', display: 'flex', alignItems: 'center', gap: '7px', padding: '0 12px', backgroundColor: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 'var(--font-size-md-lg)', fontWeight: 500, color: 'var(--bg-base)' }}>Nuevo documento</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 130px 28px',
                gap: '16px',
                padding: '0 12px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span>Nombre</span>
              <span>Modificado</span>
              <span></span>
            </div>

            {entradas.map((entrada) => (
              <div
                key={`${entrada.tipo}-${entrada.nombre}`}
                role="button"
                tabIndex={0}
                onClick={() =>
                  entrada.tipo === 'carpeta'
                    ? onNavegarRuta([...ruta, entrada.nombre])
                    : onAbrirDocumento(entrada.nombre)
                }
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  if (entrada.tipo === 'carpeta') onNavegarRuta([...ruta, entrada.nombre]);
                  else onAbrirDocumento(entrada.nombre);
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 130px 28px',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '11px 12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  height: '44px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--border-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                  {entrada.tipo === 'carpeta' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.2" style={{ flexShrink: 0 }}>
                      <path d="M2 5.5V3.5a1 1 0 011-1h2.8l1.2 1.4H13a1 1 0 011 1v7.6a1 1 0 01-1 1H3a1 1 0 01-1-1z"></path>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8A857C" strokeWidth="1.2" style={{ flexShrink: 0 }}>
                      <path d="M3.5 1.8h5.6l3.4 3.4v9H3.5z"></path>
                      <path d="M9.1 1.8v3.4h3.4"></path>
                      <line x1="5.6" y1="8.4" x2="10.4" y2="8.4"></line>
                      <line x1="5.6" y1="11" x2="9" y2="11"></line>
                    </svg>
                  )}
                  <span style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entrada.nombre}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-md)', color: 'var(--text-muted)' }}>
                  {formatearFecha(entrada.fechaModificacion)}
                </span>
                <ItemMenu
                  onEliminar={() => setEntradaAEliminar(entrada)}
                  onMover={() => setEntradaAMover(entrada)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {modalTipo === 'carpeta' && (
        <NamePromptModal
          titulo="Nueva carpeta"
          etiquetaCampo="Nombre"
          textoConfirmar="Crear carpeta"
          onConfirmar={confirmarCarpeta}
          onCancelar={() => {
            setModalTipo(null);
            setErrorAccion(null);
          }}
        />
      )}
      {modalTipo === 'documento' && (
        <NamePromptModal
          titulo="Nuevo documento"
          etiquetaCampo="Nombre"
          textoConfirmar="Crear documento"
          onConfirmar={confirmarDocumento}
          onCancelar={() => {
            setModalTipo(null);
            setErrorAccion(null);
          }}
        />
      )}
      {errorAccion && modalTipo && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: 'var(--status-error)', color: 'var(--bg-base)', padding: '10px 14px', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-lg)', zIndex: 200 }}>
          {errorAccion}
        </div>
      )}

      {entradaAMover && (
        <MoveModal
          areaNombre={area.nombre}
          entrada={entradaAMover}
          rutaOrigen={ruta}
          moviendo={moviendo}
          error={errorMovimiento}
          onConfirmar={(destino) => void confirmarMovimiento(destino)}
          onCancelar={() => {
            if (!moviendo) {
              setEntradaAMover(null);
              setErrorMovimiento(null);
            }
          }}
        />
      )}

      {entradaAEliminar && (
        <ConfirmDeleteModal
          nombre={entradaAEliminar.nombre}
          tipo={entradaAEliminar.tipo}
          eliminando={eliminando}
          error={errorEliminacion}
          onConfirmar={() => void confirmarEliminacion()}
          onCancelar={() => {
            if (!eliminando) {
              setEntradaAEliminar(null);
              setErrorEliminacion(null);
            }
          }}
        />
      )}
      </div>
    </div>
  );
}
