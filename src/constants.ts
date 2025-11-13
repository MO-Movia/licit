/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorView } from 'prosemirror-view';
export type EditorViewEx = EditorView & {
  readOnly?: boolean;
  disabled?: boolean;
  runtime?;
  placeholder?;
};

export const LAYOUT = {
  DESKTOP_SCREEN_4_3: 'desktop_screen_4_3',
  DESKTOP_SCREEN_16_9: 'desktop_screen_16_9',
  US_LETTER_LANDSCAPE: 'us_letter_landscape',
  US_LETTER_PORTRAIT: 'us_letter_portrait',
  A4_LANDSCAPE: 'a4_landscape',
  A4_PORTRAIT: 'a4_portrait',
};

export const ATTRIBUTE_LAYOUT = 'data-layout';

export const ATTRIBUTE_LIST_STYLE_TYPE = 'data-list-style-type';

export type EditorFocused = EditorView & {
  focused: boolean;
  runtime?;
  readOnly?;
};
