import { useCallback, useEffect, useState } from 'react';

import { WBorder } from '@syncfusion/ej2-documenteditor';
import type { DocumentEditor } from '@syncfusion/ej2-documenteditor';

interface FormatState {
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'Left' | 'Center' | 'Right' | 'Justify';
  isImageSelected: boolean;
  currentParagraphStyle: string;
  isBulletList: boolean;
  isNumberedList: boolean;
  isQuote: boolean;
}

const INITIAL_STATE: FormatState = {
  fontFamily: 'Georgia',
  fontSize: 11,
  lineSpacing: 1,
  bold: false,
  italic: false,
  underline: false,
  alignment: 'Left',
  isImageSelected: false,
  currentParagraphStyle: 'Normal',
  isBulletList: false,
  isNumberedList: false,
  isQuote: false,
};

// Detecta si el párrafo actual está dentro de una lista y de qué tipo.
// `selection.paragraphFormat` es `SelectionParagraphFormat`, no
// `WParagraphFormat` - no expone `.listFormat` (eso solo existe en el
// paragraph format "real" del documento). Lo que sí expone directo son
// `listId`/`listLevelNumber`, así que se resuelve el `WListLevel` a mano
// con `documentHelper.getListById` + `layout.getListLevel`, el mismo par
// de llamadas que usa `editor.updateListLevel` interally (editor.js
// ~14037-14038) para lo mismo - ambas ya confirmadas null-safe: con
// `listId === -1` (párrafo fuera de cualquier lista, valor default)
// `getListById` no encuentra nada y devuelve `undefined`, y
// `getListLevel(undefined, ...)` devuelve `undefined` sin tirar error.
// `listLevelPattern === 'Bullet'` es el único valor de `ListLevelPattern`
// que corresponde a viñetas; cualquier otro patrón presente (Arabic,
// UpRoman, etc.) es una lista numerada.
function getListKind(editor: DocumentEditor): { isBulletList: boolean; isNumberedList: boolean } {
  const paraFormat = editor.selection.paragraphFormat;
  const list = editor.documentHelper.getListById(paraFormat.listId);
  const listLevel = editor.documentHelper.layout.getListLevel(list, paraFormat.listLevelNumber);
  if (!listLevel) return { isBulletList: false, isNumberedList: false };
  const isBullet = listLevel.listLevelPattern === 'Bullet';
  return { isBulletList: isBullet, isNumberedList: !isBullet };
}

// Instancias de `WAbstractList` ya normalizadas por `halveListLevelIndents`,
// para no repetir el trabajo (ni el `layoutWholeDocument()`) en cada
// `contentChange` mientras se sigue tipeando dentro de una lista ya
// procesada. Es un `WeakSet` a nivel de módulo (no por instancia de editor)
// a propósito: la clave es el objeto `abstractList` en sí, no un id ni el
// editor - así que no hace falta resetearlo al abrir un documento nuevo
// (las abstractLists viejas quedan sin referencias y el GC las limpia) y
// funciona sin cambios aunque en algún momento convivan varios editores.
// Ver `handleListContentChange` más abajo para el enganche centralizado y
// el razonamiento de por qué el guard se marca ANTES de mutar.
const halvedAbstractLists = new WeakSet<object>();

// Achica a la mitad la sangría por nivel de una lista RECIÉN CREADA, sin
// importar cómo se creó (botón del sidebar, autoformato nativo al escribir
// "* "/"- " + espacio, pegado de contenido con listas, importación de
// .docx, o cualquier otro camino futuro): se engancha a `contentChange`,
// el único evento a nivel de documento confirmado en runtime que dispara
// para cualquier cambio de contenido (ver `handleListContentChange`), en
// vez de llamarse a mano desde cada acción puntual como antes.
//
// Contexto confirmado leyendo código fuente real (no asumido):
// - `Editor.applyBulletOrNumbering` (editor.js, node_modules/@syncfusion/
//   ej2-documenteditor/.../editor/editor.js ~19282-19350), en la rama de
//   "lista nueva", crea el abstractList con UN solo level (el 0) via
//   `listLevel.paragraphFormat.leftIndent = 36; firstLineIndent = -18;`.
//   `Editor.prototype.addListLevels` (~19386-19419, la función con la
//   fórmula 36*i que motivó este ajuste) NO se ejecuta en este flujo: sólo
//   corre cuando el "format" recibido es el string literal 'bullet' /
//   'multiLevel' / 'numbering' (galería de estilos predefinidos de Word),
//   y acá se llama con el caracter de viñeta real ('●') o el numberFormat
//   ('%1.'), como hacen `toggleBulletList`/`toggleNumberedList` abajo.
// - El autoformato nativo (escribir "* "/"- " o "1." + espacio) es un
//   camino TOTALMENTE DISTINTO: `Editor.prototype.checkAndConvertList`
//   (editor.js ~5330-5451), invocado desde `insertTextInternal` cada vez
//   que el texto insertado es un espacio o tab (~4251-4256), arma su
//   propio `WListLevel` a mano con `leftIndent = 36` (o variantes según
//   sangría previa) y `firstLineIndent = -18` (~5411-5421) - ni pasa por
//   `applyBullet`/`applyNumbering` ni por `applyBulletOrNumbering`. Esto
//   explica el bug reportado: el hook viejo, colgado solo de
//   `toggleBulletList`/`toggleNumberedList`, nunca se ejecutaba para listas
//   creadas así, y quedaban con la sangría default de Syncfusion.
// - Los levels 1-8 no existen todavía en ese momento: se generan recién al
//   primer Tab que los necesita, de forma lazy, en
//   `Layout.prototype.getListLevel` (implementation/viewer/layout.js
//   ~8033-8041), que si `abstractList.levels.length <= listLevelNumber`
//   delega en OTRA función homónima, `Layout.prototype.addListLevels`
//   (~5218-5236) - con una fórmula totalmente distinta a la de Editor
//   (`leftIndent = 48 * (i + 1)`, `firstLineIndent = -24`), no la 36*i
//   citada en el pedido. Si sólo se pisara el level 0 acá, los levels 1-8
//   quedarían con ESTA otra fórmula (default, sin reducir) al primer Tab.
// Por eso se fuerza la generación completa de los 9 levels ACÁ (llamando
// `getListLevel` con el índice más alto, 8: el loop interno de
// `Layout.addListLevels` es `for (i = levels.length; i < 9; i++)`, o sea
// que rellena hasta 9 sin importar qué índice se pidió), y recién ahí se
// pisan `leftIndent`/`firstLineIndent` en los 9 levels con la fórmula a la
// mitad. Así, cuando el usuario haga Tab más adelante, los levels ya
// existen con el valor reducido - no hace falta ganchos por cada Tab.
//
// Nota: cubre listas nuevas o que cambian de tipo. Un caso borde no
// cubierto a propósito: seguir una lista multi-nivel YA existente en nivel
// > 0 sin reemplazarla (rama `isSameList` de `applyBulletOrNumbering`, o el
// "continuar lista anterior" de `checkNextLevelAutoList`) reusa el
// abstractList existente - ya pasó por acá cuando esa lista se creó, así
// que el guard de `halvedAbstractLists` lo salta correctamente sin
// necesidad de un caso especial.
function halveListLevelIndents(editor: DocumentEditor): void {
  const list = editor.documentHelper.getListById(editor.selection.paragraphFormat.listId);
  if (!list) return;

  // `list.abstractList` es el camino directo (así lo deja seteado tanto
  // `applyBulletOrNumbering` como `autoConvertList`/`checkAndConvertList`
  // al crear la lista: `list.abstractList = abstractList;` en ambos casos),
  // con fallback a `getAbstractListById` - mismo patrón defensivo que usa
  // el propio Syncfusion en `applyBulletOrNumbering` (editor.js ~19283:
  // `if (!abstractList) { abstractList =
  // this.documentHelper.getAbstractListById(list.abstractListId); }`).
  const abstractList = list.abstractList ?? editor.documentHelper.getAbstractListById(list.abstractListId);
  if (!abstractList || halvedAbstractLists.has(abstractList)) return;

  // Se marca ANTES de mutar/relayoutear, no después: `layoutWholeDocument()`
  // más abajo dispara una re-entrada síncrona de este mismo handler dentro
  // del mismo call stack. Confirmado leyendo runtime real: `layoutWholeDocument`
  // (layout.js ~372-410) pone `isShiftingEnabled = false` ANTES de llamar a
  // `editorModule.reLayout(...)` al final de su propio cuerpo - sin importar
  // qué haya seteado quien la llamó -, y `Editor.prototype.reLayout` termina
  // llamando a `this.fireContentChange()` (editor.js ~11408), cuyo guard
  // interno (`!isShiftingEnabled && ...`) ya da `false` disponible y deja
  // pasar el disparo del evento público `contentChange`. Si el guard se
  // marcara DESPUÉS de esta función (o no existiera), esa re-entrada
  // volvería a encontrar la misma `abstractList` sin marcar y reprocesaría
  // en loop. Marcando antes, la re-entrada la encuentra ya marcada y no
  // hace nada.
  halvedAbstractLists.add(abstractList);

  // Fuerza el alta lazy de los levels 1-8 (ver nota arriba) para pisarlos
  // ya mismo en vez de dejarlos con la fórmula default de Syncfusion a la
  // espera del primer Tab del usuario.
  editor.documentHelper.layout.getListLevel(list, 8);

  // `18 * (i + 1)` para TODOS los niveles, nivel 0 incluido - sin caso
  // especial. Con nivel 0 fijo en 18 y el resto en `18 * i` (fórmula
  // original de este fix), nivel 0 y nivel 1 daban el mismo valor
  // (`18 * 1 === 18`, igual que el nivel 0) - confirmado por evidencia de
  // consola en la investigación del bug "Tab no mueve el texto" que esto
  // no era una desincronización de Syncfusion, sino la coincidencia
  // matemática de esa fórmula. `18 * (i + 1)` da un salto de 18pt
  // consistente entre cada nivel consecutivo (18, 36, 54, 72...), sin
  // coincidencias.
  abstractList.levels.forEach((level, i) => {
    level.paragraphFormat.leftIndent = 18 * (i + 1);
    level.paragraphFormat.firstLineIndent = -9;
  });

  // Pisar `paragraphFormat` de los levels directo sobre el abstractList no
  // dispara relayout por sí solo (no pasa por `applyParagraphFormat`/
  // `reLayout`). Mismo patrón confirmado en `Editor.updateListLevelIndent`
  // (editor.js ~13965-13990), la función que Syncfusion usa para el caso
  // análogo de pisar `leftIndent` a mano en todos los levels de un
  // abstractList ya existente: ahí, después de la mutación directa, fuerza
  // `layoutWholeDocument()` para reflejar el cambio sin esperar otra
  // acción del usuario - se replica la misma secuencia acá.
  editor.documentHelper.owner.isShiftingEnabled = true;
  editor.documentHelper.layout.layoutWholeDocument();
  editor.documentHelper.owner.isShiftingEnabled = false;
}

// Detecta si el párrafo actual tiene el formato de "Cita" (barra izquierda
// sólida) aplicado. `editor.selection.paragraphFormat.borders` es
// `SelectionBorders` (selection-format.d.ts:345, pública, no @private) y su
// `.left` es `SelectionBorder` (selection-format.d.ts:232) con getters/setters
// públicos `color`/`lineStyle`/`lineWidth` documentados "Gets or sets ... for
// selected paragraph borders" - a diferencia de `editor.applyBorders` (el
// método público de `Editor`, editor.d.ts:2741), que NO sirve acá: su
// implementación (editor.js ~24009) arranca con
// `if (isNullOrUndefined(startPos.paragraph.associatedCell)) return;` - solo
// aplica a bordes de celda de tabla, nunca a un párrafo suelto. El camino que
// sí funciona para párrafos (confirmado leyendo `borders-and-shading-dialog.js`
// ~152, el mismo código que usa el diálogo nativo "Bordes y sombreado" de
// Syncfusion para la opción "Párrafo") es setear las propiedades de
// `SelectionBorder` directo, que internamente llaman a
// `Editor.applyParagraphBorders`/`onApplyParagraphFormat` (ambos @private, no
// se llaman a mano acá - alcanza con la superficie pública de `SelectionBorder`).
// `lineStyle === 'Single'` es el mismo valor que se aplica en `applyQuote` de
// abajo; sin cita, el valor por default es `'None'` (o `undefined` con
// selección mixta), nunca `'Single'`.
function isQuoteParagraph(editor: DocumentEditor): boolean {
  return editor.selection.paragraphFormat.borders.left.lineStyle === 'Single';
}

// Ancho de la barra de la cita, en puntos - `SelectionBorder.lineWidth` se
// interpreta en puntos, no píxeles ni ninguna otra unidad (confirmado en
// runtime: `render.js` dibuja el borde izquierdo de párrafo con
// `HelperMethods.convertPointToPixel(leftBorder.lineWidth)`, factor fijo
// 96/72). 3pt -> 4px en pantalla, el extremo superior de la referencia visual
// pedida (blockquote de Notion/GitHub, "típicamente 3-4px equivalente").
const QUOTE_BORDER_WIDTH_PT = 3;

// Mismo paso de indentación que un nivel de lista (ver `halveListLevelIndents`
// más abajo: `18 * (i + 1)` puntos por nivel, nivel 0 = 18pt) - el único valor
// de `leftIndent` ya usado en el proyecto, reusado acá como escala de
// referencia en vez de inventar un número nuevo sin relación.
const QUOTE_LEFT_INDENT_PT = 18;

// Fallback si `--accent` no resuelve (por ejemplo, `document` no disponible
// todavía): mismo valor hardcodeado que `styles/tokens.css` define en `:root`
// (modo oscuro, default de la app).
const QUOTE_BORDER_COLOR_FALLBACK = '#C7A46A';

// El canvas de Syncfusion no acepta `var(...)` - mismo problema ya resuelto en
// `useDocumentTheme.ts` para `documentHelper.backgroundColor`, que ahí se
// resuelve con un mapa hardcodeado por tema. Acá, en cambio, alcanza con leer
// el valor computado de `--accent` en el momento del click (no hace falta
// mantenerlo sincronizado en vivo como el fondo del canvas, que se repinta en
// cada cambio de tema): `getComputedStyle` ya devuelve el string hex resuelto
// para el tema activo en ese instante, sin duplicar los valores de
// `tokens.css` a mano en un segundo lugar.
function getAccentColor(): string {
  if (typeof document === 'undefined') return QUOTE_BORDER_COLOR_FALLBACK;
  const value = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  return value || QUOTE_BORDER_COLOR_FALLBACK;
}

const FONT_FAMILY_OPTIONS = ['Fira Code', 'Outfit', 'Georgia', 'Arial', 'Times New Roman'] as const;

// Nombres exactos que espera `editor.applyStyle` (confirmado en runtime
// v34.2.4: capitalización y espaciado literales, no hay normalización de
// casing de por medio). `selection.paragraphFormat.styleName` devuelve
// estos mismos strings al leerlo, aunque esté marcado `@private` en el
// .d.ts.
const PARAGRAPH_STYLE_OPTIONS = ['Normal', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4'] as const;
export type ParagraphStyleName = (typeof PARAGRAPH_STYLE_OPTIONS)[number];

export function useFormatControls(getEditor: () => DocumentEditor | null | undefined) {
  const [format, setFormat] = useState<FormatState>(INITIAL_STATE);

  const updateFormatState = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;

    try {
      const charFormat = editor.selection.characterFormat;
      const paraFormat = editor.selection.paragraphFormat;
      const { isBulletList, isNumberedList } = getListKind(editor);

      setFormat({
        fontFamily: charFormat.fontFamily || INITIAL_STATE.fontFamily,
        fontSize: charFormat.fontSize || INITIAL_STATE.fontSize,
        lineSpacing: paraFormat.lineSpacing || INITIAL_STATE.lineSpacing,
        bold: charFormat.bold || false,
        italic: charFormat.italic || false,
        underline: charFormat.underline !== 'None',
        alignment: paraFormat.textAlignment || 'Left',
        isImageSelected: editor.selection.isImageSelected,
        currentParagraphStyle: paraFormat.styleName || INITIAL_STATE.currentParagraphStyle,
        isBulletList,
        isNumberedList,
        isQuote: isQuoteParagraph(editor),
      });
    } catch (error) {
      console.error('Error updating format state:', error);
    }
  }, [getEditor]);

  useEffect(() => {
    const editor = getEditor();
    if (!editor) return;

    const handler = (args: any) => {
      if (args.isCompleted) {
        updateFormatState();
      }
    };

    editor.selectionChange = handler;
    updateFormatState();

    // Enganche centralizado de `halveListLevelIndents`: corre para
    // CUALQUIER camino que deje un párrafo con lista (botón del sidebar,
    // autoformato nativo, pegado, importación de .docx, etc.) en vez de
    // llamarse a mano desde cada acción puntual - ver el comment doc de
    // `halveListLevelIndents` para el detalle de qué código fuente
    // confirma esto en runtime.
    //
    // OJO acá con `contentChange`: es un evento `@Event()` de Syncfusion
    // (ej2-base/notify-property-change.js), NO un slot simple. Asignar
    // `editor.contentChange = fn` (como se hace arriba con
    // `selectionChange`) PISARÍA el handler que `DocumentEditor.tsx` ya
    // tiene puesto por prop de JSX (`contentChange={() => scheduleSave()}`,
    // el autoguardado) - confirmado leyendo el setter del decorador: guarda
    // el último valor asignado en `this.properties[key]` y hace
    // `removeEventListener` de ESE valor antes de agregar el nuevo, o sea
    // que una segunda asignación por propiedad desaloja a la primera.
    // `addEventListener`/`removeEventListener` (heredados de `Base`,
    // ej2-base/base.js) en cambio escriben directo al `modelObserver`
    // (multi-listener real, el mismo que usa el setter de `@Event()` por
    // debajo) sin tocar `this.properties[key]` - coexisten sin pisarse.
    // Por eso acá se registra así y NO con `editor.contentChange = ...`.
    const handleListContentChange = () => {
      try {
        if (editor.selection.paragraphFormat.listId !== -1) {
          halveListLevelIndents(editor);
        }
      } catch (error) {
        console.error('Error normalizing list indentation on content change:', error);
      }
    };
    editor.addEventListener('contentChange', handleListContentChange);

    return () => {
      // Best-effort: si el componente se desmonta (p.ej. al volver del
      // editor a la vista de arbol, ver App.tsx), Syncfusion puede haber
      // destruido ya la instancia interna (`DocumentEditorComponent`
      // corre su propio `destroy()` en el unmount) - acceder a sus
      // setters/eventos en ese estado puede tirar. No hay nada que limpiar
      // en una instancia ya destruida, así que un error acá se ignora en
      // vez de tumbar el arbol de React (ver EditingSidebar, que no tenia
      // error boundary y esto lo rompia entero).
      try {
        editor.selectionChange = undefined as any;
        editor.removeEventListener('contentChange', handleListContentChange);
      } catch (error) {
        console.warn('useFormatControls: cleanup sobre editor ya destruido, ignorado.', error);
      }
    };
  }, [getEditor, updateFormatState]);

  const setFontFamily = useCallback(
    (fontFamily: string) => {
      const editor = getEditor();
      if (!editor) return;
      editor.selection.characterFormat.fontFamily = fontFamily;
      updateFormatState();
    },
    [getEditor, updateFormatState],
  );

  const setFontSize = useCallback(
    (size: number) => {
      const editor = getEditor();
      if (!editor) return;
      editor.selection.characterFormat.fontSize = size;
      updateFormatState();
    },
    [getEditor, updateFormatState],
  );

  const setLineSpacing = useCallback(
    (spacing: number) => {
      const editor = getEditor();
      if (!editor) return;
      editor.selection.paragraphFormat.lineSpacing = spacing;
      editor.selection.paragraphFormat.lineSpacingType = 'Multiple';
      updateFormatState();
    },
    [getEditor, updateFormatState],
  );

  const toggleBold = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    editor.selection.characterFormat.bold = !format.bold;
    updateFormatState();
  }, [getEditor, format.bold, updateFormatState]);

  const toggleItalic = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    editor.selection.characterFormat.italic = !format.italic;
    updateFormatState();
  }, [getEditor, format.italic, updateFormatState]);

  const toggleUnderline = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    editor.selection.characterFormat.underline = format.underline ? 'None' : 'Single';
    updateFormatState();
  }, [getEditor, format.underline, updateFormatState]);

  const setAlignment = useCallback(
    (alignment: 'Left' | 'Center' | 'Right' | 'Justify') => {
      const editor = getEditor();
      if (!editor) return;
      editor.selection.paragraphFormat.textAlignment = alignment;
      updateFormatState();
    },
    [getEditor, updateFormatState],
  );

  const setParagraphStyle = useCallback(
    (style: ParagraphStyleName) => {
      const editor = getEditor();
      if (!editor) return;

      // `clearDirectFormatting: true` - el heading debe pisar cualquier
      // formato manual suelto (bold/italic aplicado a mano) en vez de
      // convivir con él.
      editor.editor.applyStyle(style, true);

      // El botón "Normal" (y H1-H4) deben poder sacar a un párrafo del modo
      // "Cita" - pero NO alcanza con lo de arriba. Investigado en runtime,
      // no asumido (ver `console.log` de diagnóstico que estuvo acá y se
      // sacó una vez confirmada la causa): `applyStyle(..., true)` SÍ limpia
      // `leftIndent` (queda en 0 tanto en `selection.paragraphFormat` como
      // en el `paragraphFormat` real del párrafo), pero el borde izquierdo
      // de la cita (`borders.left`) NO se limpia pese a que
      // `WParagraphFormat.prototype.clearFormat()` llama a
      // `this.borders.clearFormat()` - confirmado que ese `clearFormat()`
      // corre (el `uniqueParagraphFormat` y el `baseStyle` sí se resetean),
      // pero lo que después LEE/RENDERIZA `paragraphFormat.borders.left` no
      // es el mismo slot que esa función limpia: `WBorder` internamente
      // dedupe/interna las combinaciones de color+ancho+estilo en un pool
      // estático compartido (`WBorder.uniqueBorderFormats`), así que un
      // borde de cita ya no responde de forma confiable a `clearFormat()`.
      // Confirmado a mano en consola (mismo documento, mismo párrafo):
      // llamar a `paragraphFormat.borders.clearFormat()` directo, otra vez,
      // sobre el objeto ya "limpiado" por `applyStyle`, seguía sin sacar el
      // borde - pero volver a aplicar el borde por la MISMA vía que usa
      // `applyQuote()` (`onApplyParagraphFormat('leftBorder', ...)`, más
      // abajo) con `lineStyle: 'None'` sí lo saca de forma confirmada y
      // consistente. Por eso acá se limpia el borde explícitamente con esa
      // misma vía en vez de confiar en que `clearFormat()` lo haga - no
      // hace falta condicionar por si el párrafo era o no una cita: aplicar
      // "None" sobre un párrafo que ya no tiene borde es un no-op inocuo.
      //
      // Mismo riesgo de borde compartido que `applyQuote()` (ver su comment
      // doc para la evidencia completa): si el/los párrafo(s) tocados por
      // la selección actual todavía comparten el objeto `borders` con
      // otros párrafos del documento, mutar acá "en el lugar" via
      // `onApplyParagraphFormat` se propagaría a esos otros párrafos
      // también - mismo `dedupeSelectedParagraphBorders` antes de la
      // mutación de bajo nivel.
      dedupeSelectedParagraphBorders(editor);
      const noneBorder = new WBorder();
      noneBorder.lineStyle = 'None';
      noneBorder.lineWidth = 0;
      editor.editor.onApplyParagraphFormat('leftBorder', noneBorder, false, false);

      // Los estilos Heading 1-4 built-in de Word traen un color de fuente
      // fijo hardcodeado en la definición del estilo (ej. Heading 1 =
      // #2F5496, azul "Accent 1 Darker 25%" del theme clásico de Office),
      // que no se adapta al canvas oscuro. `#00000000` (alpha 0) es el
      // valor "automático" que ya usa el texto Normal por default: color
      // resuelto en runtime según el fondo, sin necesidad de condicionar
      // por tema acá.
      //
      // OJO: `characterFormat.fontColor = ...` con el cursor colapsado (sin
      // texto seleccionado) NO repinta los caracteres ya tipeados -
      // confirmado en runtime inspeccionando `onApplyCharacterFormat` en
      // editor.js: con `selection.isEmpty` y el cursor fuera del final
      // exacto del párrafo, el setter solo actualiza el "typing format"
      // (el formato que usarían los próximos caracteres tipeados), no el
      // run ya existente - por eso el heading seguía viéndose azul pese a
      // que `characterFormat.fontColor` ya leía el valor nuevo. Para que
      // pise el color del texto que ya está en el párrafo hace falta una
      // selección real: se selecciona el párrafo entero, se aplica el
      // color ahí, y se restaura el cursor/selección original.
      const selection = editor.selection;
      const startBeforeColorFix = selection.start.clone();
      const endBeforeColorFix = selection.end.clone();
      selection.selectParagraph();
      selection.characterFormat.fontColor = '#00000000';
      selection.selectPosition(startBeforeColorFix, endBeforeColorFix);

      updateFormatState();
    },
    [getEditor, updateFormatState],
  );

  // Bug crítico reportado en uso real (no cubierto por la verificación
  // anterior, que sólo probaba ciclos Cita/Normal repetidos sobre el MISMO
  // párrafo): seleccionar una sola frase dentro de UN párrafo, en un
  // documento de varios párrafos, y aplicar "Cita" terminaba poniendo la
  // barra en TODOS los párrafos del documento (incluidos espacios vacíos
  // que la selección nunca tocó) - mucho más allá de "aplica al párrafo
  // entero en vez de a la frase" (comportamiento esperable de un estilo de
  // párrafo).
  //
  // Causa raíz confirmada en runtime con logs temporales (no asumida): NO
  // es que `onApplyParagraphFormat`/`Editor.applyParaFormat` (editor.js
  // ~14692-14717) ignore los límites de la selección real - confirmado
  // leyendo ese código y con logs que, para una selección de una frase
  // dentro de un solo párrafo, `start.paragraph === end.paragraph` da
  // `true` y el método aplica una única vez y corta (`if (paragraph.equals
  // (end.paragraph)) return;`, sin recursión a
  // `getNextParagraphForFormatting`) - el scope de la operación en sí está
  // bien delimitado.
  //
  // La causa real está un nivel más abajo, en `Editor.prototype.
  // applyBorder` (editor.js ~24713), el método que `applyParaFormatProperty`
  // invoca para `property === 'leftBorder'`: `this.applyBorder(format.
  // borders.left, value)`. `applyBorder` MUTA `sourceBorder` (acá, `format.
  // borders.left`) EN EL LUGAR (`sourceBorder.lineStyle = ...`) en vez de
  // reemplazarlo por un objeto nuevo. El problema es que `format.borders.
  // left` no es necesariamente un objeto PROPIO de ese párrafo: Syncfusion
  // interna/deduplica instancias de `WBorder` entre párrafos que todavía no
  // tienen formato de borde propio (todos comparten el mismo objeto "sin
  // borde" por default - el mismo mecanismo de pool ya documentado en el
  // comment doc de `isQuoteParagraph` más abajo, `WBorder.
  // uniqueBorderFormats`). Confirmado en consola, con evidencia directa de
  // identidad de objeto, no sólo de comportamiento: en un documento de 3
  // párrafos nuevos (ninguno con borde propio todavía),
  // `paragraph0.paragraphFormat.borders.left ===
  // paragraph1.paragraphFormat.borders.left === paragraph2...left` daba
  // `true` - LITERALMENTE el mismo objeto en los 3. Aplicar "Cita" a una
  // frase del párrafo 2 mutaba ese objeto compartido, y la mutación se veía
  // reflejada en los 3 párrafos - incluidos los que la selección nunca
  // tocó. `leftIndent`, en cambio, es un número plano seteado directo sobre
  // `paragraphFormat` (`format.leftIndent = value`, sin objeto intermedio
  // compartido) - confirmado que ESE sí quedaba scoped correctamente al
  // párrafo tocado (único con `leftIndent` distinto de 0 en la misma
  // prueba), lo que explica por qué el bug afecta sólo a la barra y no a la
  // indentación, y por qué el ciclo de verificación anterior (que sólo
  // miraba si la barra aparecía/desaparecía en el párrafo tocado, en un
  // documento de un solo párrafo donde no hay a quién más "filtrarle" el
  // borde compartido) no lo detectó.
  //
  // Fix: antes de la mutación de bajo nivel, clonar `borders` (`WBorders.
  // prototype.cloneFormat()`, que sí crea instancias `WBorder` nuevas y
  // propias por cada lado - confirmado en el .d.ts público del paquete, no
  // marcado @private) para cada párrafo que la selección ACTUAL realmente
  // toca, usando `Selection.prototype.getParagraphsInSelection()` (también
  // pública - no reimplementa a mano el recorrido interno de
  // `getNextParagraphForFormatting` para no arriesgar un mismatch con casos
  // borde como tablas o saltos de página). Con `borders` ya des-compartido
  // para esos párrafos puntuales, la mutación subsiguiente cae en una copia
  // privada y no se propaga a párrafos hermanos que siguen compartiendo el
  // objeto original.
  function dedupeSelectedParagraphBorders(editor: DocumentEditor): void {
    editor.selection.getParagraphsInSelection().forEach((paragraph) => {
      paragraph.paragraphFormat.borders = paragraph.paragraphFormat.borders.cloneFormat();
    });
  }

  // Aplica el formato de "Cita" (blockquote tipo Notion/Markdown): barra
  // sólida a la izquierda del párrafo + indentación del texto, sin cursiva ni
  // fondo de color (ver el comment doc de `isQuoteParagraph` arriba para la
  // evidencia de por qué esto usa `paragraphFormat.borders.left`, no
  // `editor.applyBorders`). No es un toggle - para deshacerlo el usuario usa
  // el botón "Normal" ya existente de H1-H4 (`setParagraphStyle`, más abajo
  // en este archivo, saca la barra explícitamente por la misma vía de bajo
  // nivel que se usa acá para ponerla - ver el comment doc ahí para la
  // evidencia en runtime de por qué hace falta ese paso extra).
  const applyQuote = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;

    // Ver el comment doc de `dedupeSelectedParagraphBorders` arriba para la
    // evidencia completa del bug que esto previene (el borde compartido
    // propagándose a párrafos que la selección nunca tocó).
    dedupeSelectedParagraphBorders(editor);

    // OJO: asignar `color`/`lineStyle`/`lineWidth` como 3 sets sucesivos
    // sobre `editor.selection.paragraphFormat.borders.left` (la superficie
    // pública, `SelectionBorder`) NO funciona - confirmado en runtime, no
    // asumido. Cada uno de esos setters dispara por separado
    // `Editor.applyParagraphBorders` (editor.js ~24009), que arma un
    // `WBorder` NUEVO con SOLO esa propiedad seteada y lo aplica sobre el
    // borde real vía `applyBorder` (editor.js ~24694). `applyBorder` está
    // escrito como un merge ("solo pisa si `!isNullOrUndefined`"), pero
    // `WBorder.getPropertyValue` de una propiedad nunca seteada en ese
    // `WBorder` nuevo devuelve el default de la CLASE (`'None'`/`0`/
    // `'#000000'`), no `undefined` - así que el chequeo de merge nunca frena
    // nada, y cada set sucesivo termina pisando las otras 2 propiedades con
    // esos defaults. Resultado verificado a mano: setear lineStyle, después
    // lineWidth, después color deja lineStyle='None' y lineWidth=0 (sin
    // barra visible), con solo el último set (color) sobreviviendo.
    //
    // La forma que sí funciona: armar el `WBorder` completo (las 3
    // propiedades ya seteadas ANTES de aplicarlo) y aplicarlo en una única
    // llamada a `onApplyParagraphFormat('leftBorder', ...)` - el mismo
    // método interno que `applyParagraphBorders` termina llamando, pero acá
    // con un border que no tiene ninguna propiedad "sin setear" que pueda
    // pisar nada. `WBorder` es `@private` en el JSDoc pero SÍ forma parte de
    // la superficie pública del paquete (reexportado en cadena desde
    // `index.d.ts` -> `src/index.d.ts` -> `.../format/index.d.ts` ->
    // `border.d.ts`; confirmado compilando un import de prueba con `tsc -b`
    // sin errores).
    const border = new WBorder();
    border.lineStyle = 'Single';
    border.lineWidth = QUOTE_BORDER_WIDTH_PT;
    border.color = getAccentColor();
    editor.editor.onApplyParagraphFormat('leftBorder', border, false, false);

    // OJO: `editor.selection.paragraphFormat.leftIndent = ...` (la
    // superficie pública de más alto nivel, `SelectionParagraphFormat`) NO
    // es confiable acá - confirmado en runtime, no asumido: ese setter
    // (selection-format.js) arranca con
    // `if (value === this.leftIndentIn) { return; }`, comparando contra un
    // valor CACHEADO en el objeto de selección (`leftIndentIn`), no contra
    // el valor real del párrafo. Si ese cache ya venía en 18 (por ejemplo,
    // por herencia de formato al tipear Enter dentro de otra cita, el mismo
    // comportamiento esperado tipo Word que no se toca) el set queda pisado
    // por ese early-return y el párrafo se queda sin indentación real -
    // reproducido en consola: párrafo nuevo, cache de selección forzado a
    // 18 mientras el párrafo real seguía en 0, y el set de arriba no hacía
    // nada. La vía de bajo nivel usada para el borde (arriba) no tiene ese
    // problema porque no pasa por ese cache - por eso se usa la misma acá.
    editor.editor.onApplyParagraphFormat('leftIndent', QUOTE_LEFT_INDENT_PT, false, false);

    updateFormatState();
  }, [getEditor, updateFormatState]);

  // Toggle: si el párrafo ya es del tipo pedido, `clearList()` lo saca de
  // la lista (vuelve a párrafo normal, mismo botón prende/apaga). Si es del
  // otro tipo o no está en ninguna lista, `applyBullet`/`applyNumbering`
  // convierten el párrafo actual (no hace falta clearList antes: aplicar
  // bullet sobre un párrafo ya numerado pisa el listFormat existente).
  //
  // `applyBullet('●', 'Arial')` / `applyNumbering('%1.', 'Arabic')`: mismos
  // parámetros que usa MS Word como default para "nueva lista" (viñeta
  // sólida nivel 0, numeración arábiga con punto). No son opcionales por
  // capricho - `applyBullet`/`applyNumbering` piden bullet/numberFormat
  // como argumento obligatorio, no hay un "default implícito" en la firma.
  //
  // No hace falta llamar a `halveListLevelIndents` acá: el listener
  // centralizado de `contentChange` (ver el `useEffect` de arriba) ya la
  // corre en cuanto `applyBullet`/`applyNumbering` terminan de crear la
  // lista - confirmado en runtime que ambas disparan `contentChange` antes
  // de devolver el control acá (vía `setList` -> `layoutWholeDocument` ->
  // `reLayout` -> `fireContentChange`).
  const toggleBulletList = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (getListKind(editor).isBulletList) {
      editor.editor.clearList();
    } else {
      editor.editor.applyBullet('●', 'Arial');
    }
    updateFormatState();
  }, [getEditor, updateFormatState]);

  const toggleNumberedList = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (getListKind(editor).isNumberedList) {
      editor.editor.clearList();
    } else {
      editor.editor.applyNumbering('%1.', 'Arabic');
    }
    updateFormatState();
  }, [getEditor, updateFormatState]);

  // Ancho de imagen tipo Notion: "simple" (mitad de la columna de texto) o
  // "completo" (columna entera), en vez de resize libre continuo como único
  // mecanismo. `fraction` es la porción del ancho útil de columna que va a
  // ocupar la imagen.
  const applyImageWidth = useCallback(
    (fraction: 0.5 | 1) => {
      const editor = getEditor();
      if (!editor || !editor.selection.isImageSelected) return;

      const { pageWidth, leftMargin, rightMargin } = editor.selection.sectionFormat;
      const columnWidth = pageWidth - leftMargin - rightMargin;
      const newWidth = columnWidth * fraction;

      const imageFormat = editor.selection.imageFormat;
      // La proporción para recalcular el alto se toma del tamaño ACTUAL de
      // la imagen en el momento del click, no de un tamaño "original"
      // persistido: si la imagen fue deformada con el ImageResizer libre
      // antes de usar estos botones, esa deformación se propaga. Aceptado
      // por ahora — no se justifica infraestructura de metadata persistente
      // para esto todavía.
      const aspectRatio = imageFormat.height / imageFormat.width;

      // `width`/`height` en `SelectionImageFormat` son de solo lectura (no
      // hay setter pese a lo que muestra la documentación oficial con
      // asignación directa): `resize()` es el método real que aplica el
      // nuevo tamaño en esta versión de la librería.
      imageFormat.resize(newWidth, newWidth * aspectRatio);
      updateFormatState();
    },
    [getEditor, updateFormatState],
  );

  const setImageWidthSimple = useCallback(() => applyImageWidth(0.5), [applyImageWidth]);
  const setImageWidthFull = useCallback(() => applyImageWidth(1), [applyImageWidth]);

  const clearFormatting = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    editor.editor.clearFormatting();
    updateFormatState();
  }, [getEditor, updateFormatState]);

  return {
    format,
    setFontFamily,
    setFontSize,
    setLineSpacing,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    setAlignment,
    setParagraphStyle,
    applyQuote,
    toggleBulletList,
    toggleNumberedList,
    clearFormatting,
    setImageWidthSimple,
    setImageWidthFull,
    FONT_FAMILY_OPTIONS,
    PARAGRAPH_STYLE_OPTIONS,
  };
}