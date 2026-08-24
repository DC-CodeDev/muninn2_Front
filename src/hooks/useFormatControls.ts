import { useCallback, useEffect, useState } from 'react';

import type { DocumentEditor } from '@syncfusion/ej2-documenteditor';

interface FormatState {
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'Left' | 'Center' | 'Right' | 'Justify';
}

const INITIAL_STATE: FormatState = {
  fontFamily: 'Georgia',
  fontSize: 11,
  lineSpacing: 1,
  bold: false,
  italic: false,
  underline: false,
  alignment: 'Left',
};

const FONT_FAMILY_OPTIONS = ['Fira Code', 'Outfit', 'Georgia', 'Arial', 'Times New Roman'] as const;

export function useFormatControls(getEditor: () => DocumentEditor | null | undefined) {
  const [format, setFormat] = useState<FormatState>(INITIAL_STATE);

  const updateFormatState = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;

    try {
      const charFormat = editor.selection.characterFormat;
      const paraFormat = editor.selection.paragraphFormat;

      setFormat({
        fontFamily: charFormat.fontFamily || INITIAL_STATE.fontFamily,
        fontSize: charFormat.fontSize || INITIAL_STATE.fontSize,
        lineSpacing: paraFormat.lineSpacing || INITIAL_STATE.lineSpacing,
        bold: charFormat.bold || false,
        italic: charFormat.italic || false,
        underline: charFormat.underline !== 'None',
        alignment: paraFormat.textAlignment || 'Left',
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

    return () => {
      editor.selectionChange = undefined as any;
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
    clearFormatting,
    FONT_FAMILY_OPTIONS,
  };
}