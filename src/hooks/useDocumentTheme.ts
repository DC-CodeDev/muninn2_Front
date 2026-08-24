import { useEffect, useState } from 'react';

import type { DocumentEditor } from '@syncfusion/ej2-documenteditor';
import { useTheme } from './useTheme';

// Valores que debe pintar el canvas de la página del documento, espejo de los
// tokens `--color-pagina-documento` de styles/tokens.css, que a su vez
// referencian `--surface-raised` de cada modo:
//   - :root (oscuro, default)  -> var(--surface-raised) = #292927
//   - [data-theme='light']     -> var(--surface-raised) = #EDEAE3
// documentHelper.backgroundColor no acepta var(); necesita un string de color
// resuelto, así que este mapa mantiene los valores resueltos a mano. Si se
// cambia --surface-raised o --color-pagina-documento, actualizar aquí para que
// el canvas siga calzando con el fondo del div .e-de-background.
const COLOR_PAGINA_POR_TEMA = {
  dark: '#292927',
  light: '#EDEAE3',
} as const;

type Theme = keyof typeof COLOR_PAGINA_POR_TEMA;

function leerTemaDelDom(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/**
 * Mantiene el color de fondo del canvas del documento sincronizado con el tema
 * de la app.
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
        if (editor) {
          editor.documentChange = undefined as any;
        }
      };
    }

    return () => {
      if (editor) {
        editor.documentChange = undefined as any;
      }
    };
  }, [theme, getEditor]);
}
