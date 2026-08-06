// @flow

import type { EditorState } from 'prosemirror-state';
import type { Transform } from 'prosemirror-transform';
import type { EditorView } from 'prosemirror-view';

export const TABLE_STYLE_NAME_ATTRIBUTE = 'tableStyleName';
export const DEFAULT_TABLE_STYLE_NAME = 'Normal';

function findTableStylePlugin(state: EditorState): any {
  return state.plugins.find((plugin) => {
    const candidate: any = plugin;
    return (
      typeof candidate.openTableStylePicker === 'function' ||
      typeof candidate.applyTableStyle === 'function' ||
      typeof candidate.applyStoredTableStyles === 'function'
    );
  });
}

export function hasTableStylePlugin(state: EditorState): boolean {
  return !!findTableStylePlugin(state)?.openTableStylePicker;
}

export function openTableStylePicker(
  view: EditorView,
  options: Object
): any {
  const plugin = findTableStylePlugin(view.state);
  return plugin?.openTableStylePicker?.({ ...options, view }) || null;
}

export function applyTableStyle(
  state: EditorState,
  tr: Transform,
  tablePos: number,
  styleName: string
): Transform {
  const plugin = findTableStylePlugin(state);
  return plugin?.applyTableStyle?.(state, tr, tablePos, styleName) || tr;
}

export function applyStoredTableStyles(
  state: EditorState,
  tr: Transform
): Transform {
  const plugin = findTableStylePlugin(state);
  return plugin?.applyStoredTableStyles?.(state, tr) || tr;
}
