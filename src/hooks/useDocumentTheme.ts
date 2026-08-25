import { useEffect, useState } from 'react';

import type { DocumentEditor } from '@syncfusion/ej2-documenteditor';
import { useTheme } from './useTheme';

// Valores que debe pintar el canvas de la página del documento, espejo de los
// tokens `--color-pagina-documento` de styles/tokens.css, que a su vez
// referencian `--bg-base` de cada modo (el mismo tono que usan las sidebars;
// distinto de `--surface-raised`, que ahora usa el contenedor que rodea la
// hoja -- ver `--color-contenedor-documento` en tokens.css y su uso en
// .e-de-background dentro de document-editor-overrides.css -- para que la
// hoja se distinga de lo que la rodea en vez de fundirse con todo):
//   - :root (oscuro, default)  -> var(--bg-base) = #1B1B1A
//   - [data-theme='light']     -> var(--bg-base) = #F4F2ED
// documentHelper.backgroundColor no acepta var(); necesita un string de color
// resuelto, así que este mapa mantiene los valores resueltos a mano. Si se
// cambia --bg-base o --color-pagina-documento, actualizar aquí para
// que el canvas siga calzando (y con el borde, ver PAGE_OUTLINE_POR_TEMA).
const COLOR_PAGINA_POR_TEMA = {
  dark: '#1B1B1A',
  light: '#F4F2ED',
} as const;

// Color del borde de la hoja (propiedad pública `pageOutline` del
// DocumentEditor; default de Syncfusion: '#000000' fijo, sin distinción de
// tema). Se usa el mismo valor que el relleno de la hoja a propósito: el
// contraste con el entorno ya lo da --color-contenedor-documento (más oscuro/
// apagado), así que el borde no necesita marcar una línea dura -- queda
// "invisible", fundido con el papel, en vez del borde negro fijo que trae
// Syncfusion por default.
const PAGE_OUTLINE_POR_TEMA = COLOR_PAGINA_POR_TEMA;

type Theme = keyof typeof COLOR_PAGINA_POR_TEMA;

function leerTemaDelDom(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/**
 * Mantiene el color de fondo del canvas del documento sincronizado con el tema
 * de la app.
 *
 * También sincroniza `pageOutline` (borde de la hoja) con el mismo color, así
 * la hoja queda del mismo tono que las sidebars en vez del borde negro fijo
 * que trae Syncfusion por default.
 *
 * OJO: el color visible de la "hoja" no lo pinta el CSS (.e-de-background ya
 * se oscurece por override) sino un <canvas> que Syncfusion pinta por JS
 * leyendo `documentHelper.backgroundColor`. Esa propiedad:
 *
 *   - Existe en la versión instalada (@syncfusion/ej2-documenteditor@34.2.4)
 *     en implementation/viewer/viewer.d.ts:180, pero está marcada `@private`
 *     en el JSDoc y no tiene API pública documentada. Su default es
 *     '#FFFFFF' hardcodeado (viewer.js:168).
 *   - Setearla NO repinta el canvas por sí solo; hay que forzar un repintado
 *     disparando un resize sintético sobre window (el handler interno de
 *     resize vuelve a dibujar la página con el color vigente).
 *   - Al cargar/abrir un documento, `clear()` de DocumentHelper la reinicia a
 *     '#FFFFFF' (viewer.js:2417), así que hay que re-aplicarla en cada
 *     `documentChange`, no solo al cambiar el tema.
 *
 * Riesgo a futuro: si se actualiza la versión de Syncfusion, verificar primero
 * que `documentHelper.backgroundColor` siga existiendo con el mismo
 * comportamiento (grep "backgroundColor" en el viewer.js de la versión nueva)
 * antes de asumir que este fix sigue funcionando.
 *
 * Nota de arquitectura: `useTheme()` crea una instancia de estado propia por
 * llamada (useState + localStorage). El ThemeToggle de la topbar usa la suya,
 * así que esta instancia no se entera de sus toggles vía estado. La fuente de
 * verdad compartida es el atributo `data-theme` en <html>, así que además del
 * valor inicial de useTheme se observa ese atributo con un MutationObserver.
 */
export function useDocumentTheme(getEditor: () => DocumentEditor | null | undefined) {
  const { theme: initialTheme } = useTheme();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(leerTemaDelDom()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let editor = getEditor();

    const applyColor = () => {
      if (!editor) return;
      editor.documentHelper.backgroundColor = COLOR_PAGINA_POR_TEMA[theme];
      // El canvas no se repinta al setear la propiedad; el handler interno de
      // resize de Syncfusion redibuja la página con el color vigente.
      window.dispatchEvent(new Event('resize'));

      // pageOutline sí es una @Property con NotifyPropertyChanges, así que
      // asignarla directamente ya dispara su propio redibujado interno
      // (viewer.updateScrollBars()); no necesita el truco del resize.
      editor.pageOutline = PAGE_OUTLINE_POR_TEMA[theme];
    };

    if (editor) {
      // Re-aplicar tras cada carga de documento (open()/clear() resetean el
      // color a '#FFFFFF').
      editor.documentChange = applyColor;
      applyColor();
    } else {
      // El ref del DocumentEditor se asigna en el commit; por robustez, si la
      // instancia aún no existe cuando corre el efecto, se reintenta en el
      // siguiente frame.
      const raf = requestAnimationFrame(() => {
        editor = getEditor();
        if (!editor) return;
        editor.documentChange = applyColor;
        applyColor();
      });
      return () => {
        cancelAnimationFrame(raf);
        // Ver el comment doc del otro cleanup mas abajo: mismo motivo
        // (instancia de Syncfusion ya destruida al desmontar).
        try {
          if (editor) editor.documentChange = undefined as any;
        } catch (error) {
          console.warn('useDocumentTheme: cleanup sobre editor ya destruido, ignorado.', error);
        }
      };
    }

    return () => {
      // Best-effort, igual que en useFormatControls: al desmontar (volver
      // del editor a la vista de arbol), Syncfusion puede haber destruido
      // ya la instancia interna - no hay nada que limpiar ahi, así que se
      // ignora en vez de tumbar el arbol de React.
      try {
        if (editor) editor.documentChange = undefined as any;
      } catch (error) {
        console.warn('useDocumentTheme: cleanup sobre editor ya destruido, ignorado.', error);
      }
    };
  }, [theme, getEditor]);
}
