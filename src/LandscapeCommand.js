// @flow

import { wrapIn } from 'prosemirror-commands';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

import { BULLET_LIST, LANDSCAPE_SECTION, ORDERED_LIST } from './NodeNames.js';

class LandscapeCommand extends UICommand {
  isEnabled = (state: EditorState): boolean => {
    return !!state.schema.nodes[LANDSCAPE_SECTION];
  };

  isActive = (state: EditorState): boolean => {
    const { $from } = state.selection;
    const type = state.schema.nodes[LANDSCAPE_SECTION];
    return !!type && this._findLandscapeDepth($from, type) > -1;
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    return this._toggleLandscape(state, dispatch);
  };

  waitForUserInput = (): Promise<null> => {
    return Promise.resolve(null);
  };

  executeWithUserInput = (): boolean => {
    return false;
  };

  cancel(): void {
    return null;
  }

  _toggleLandscape(
    state: EditorState,
    dispatch: ?(tr: Transform) => void
  ): boolean {
    const { $from, $to } = state.selection;
    const type = state.schema.nodes[LANDSCAPE_SECTION];
    if (!type) {
      return false;
    }

    const landscapeDepth = this._findLandscapeDepth($from, type);
    if (landscapeDepth > -1) {
      return this._unwrapLandscape(state, dispatch, landscapeDepth);
    }

    const wrapperDepth = this._findSharedLandscapeWrapperDepth($from, $to);
    if (wrapperDepth > -1) {
      return this._wrapNodeInLandscape(state, dispatch, type, wrapperDepth);
    }

    const listDepth = this._findListDepth($from);
    if (listDepth > -1) {
      return this._wrapNodeInLandscape(state, dispatch, type, listDepth);
    }

    if (state.selection.empty) {
      return this._insertEmptyLandscapeSection(state, dispatch, type);
    }

    if (!$from.blockRange($to)) {
      return false;
    }

    return wrapIn(type)(state, dispatch);
  }

  _unwrapLandscape(
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    landscapeDepth: number
  ): boolean {
    const { $from } = state.selection;
    const nodeStart = $from.before(landscapeDepth);
    const nodeEnd = $from.after(landscapeDepth);
    const landscapeNode = $from.node(landscapeDepth);

    if (dispatch) {
      let tr = state.tr.deleteRange(nodeStart, nodeEnd);
      tr = tr.insert(nodeStart, landscapeNode.content);
      tr = this._setNearTextSelection(tr, tr.mapping.map($from.pos));
      dispatch(tr.scrollIntoView());
    }

    return true;
  }

  _wrapNodeInLandscape(
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    type: Object,
    nodeDepth: number
  ): boolean {
    const { $from } = state.selection;
    const node = $from.node(nodeDepth);
    const parent = $from.node(nodeDepth - 1);
    const index = $from.index(nodeDepth - 1);

    if (!parent.canReplaceWith(index, index + 1, type)) {
      return false;
    }

    if (dispatch) {
      const nodeStart = $from.before(nodeDepth);
      const nodeEnd = $from.after(nodeDepth);
      const landscapeNode = type.create(null, node.copy(node.content));
      let tr = state.tr.replaceRangeWith(nodeStart, nodeEnd, landscapeNode);
      tr = this._setNearTextSelection(tr, tr.mapping.map($from.pos));
      dispatch(tr.scrollIntoView());
    }

    return true;
  }

  _insertEmptyLandscapeSection(
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    type: Object
  ): boolean {
    const paragraphType = state.schema.nodes.paragraph;
    if (!paragraphType) {
      return false;
    }

    const landscapeNode = type.create(null, paragraphType.createAndFill());
    const { $from } = state.selection;
    let insertPos = -1;

    for (let depth = $from.depth; depth > 0; depth--) {
      const parent = $from.node(depth - 1);
      const index = $from.indexAfter(depth - 1);
      if (parent.canReplaceWith(index, index, type)) {
        insertPos = $from.after(depth);
        break;
      }
    }

    if (insertPos < 0) {
      return false;
    }

    if (dispatch) {
      let tr = state.tr.insert(insertPos, landscapeNode);
      tr = tr.setSelection(
        TextSelection.near(tr.doc.resolve(Math.min(insertPos + 2, tr.doc.content.size)))
      );
      dispatch(tr.scrollIntoView());
    }

    return true;
  }

  _findLandscapeDepth($from: Object, type: Object): number {
    for (let depth = $from.depth; depth > 0; depth--) {
      if ($from.node(depth).type === type) {
        return depth;
      }
    }
    return -1;
  }

  _findSharedLandscapeWrapperDepth($from: Object, $to: Object): number {
    const enhancedFigureDepth = this._findSharedEnhancedFigureDepth($from, $to);
    if (enhancedFigureDepth > -1) {
      return enhancedFigureDepth;
    }

    return this._findSharedTableDepth($from, $to);
  }

  _findSharedEnhancedFigureDepth($from: Object, $to: Object): number {
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name !== 'enhanced_table_figure') {
        continue;
      }

      const figureStart = $from.before(depth);
      const figureEnd = $from.after(depth);
      if ($to.pos >= figureStart && $to.pos <= figureEnd) {
        return depth;
      }
    }

    return -1;
  }

  _findSharedTableDepth($from: Object, $to: Object): number {
    for (let depth = $from.depth; depth > 0; depth--) {
      const nodeType = $from.node(depth).type;
      if (!this._isTableNode(nodeType)) {
        continue;
      }

      const tableStart = $from.before(depth);
      const tableEnd = $from.after(depth);
      if ($to.pos >= tableStart && $to.pos <= tableEnd) {
        return depth;
      }
    }

    return -1;
  }

  _isTableNode(type: Object): boolean {
    return type.name === 'table' || type.spec.tableRole === 'table';
  }

  _findListDepth($from: Object): number {
    let listDepth = -1;
    for (let depth = $from.depth; depth > 0; depth--) {
      if (this._isListNode($from.node(depth).type)) {
        listDepth = depth;
      }
    }
    return listDepth;
  }

  _isListNode(type: Object): boolean {
    return type.name === ORDERED_LIST || type.name === BULLET_LIST;
  }

  _setNearTextSelection(tr: Transform, pos: number): Transform {
    const safePos = Math.min(Math.max(0, pos), tr.doc.content.size);
    let selectionPos = safePos;
    let resolved = tr.doc.resolve(safePos);

    if (!resolved.parent.isTextblock) {
      for (let ii = safePos; ii <= tr.doc.content.size; ii++) {
        resolved = tr.doc.resolve(Math.min(ii, tr.doc.content.size));
        if (resolved.parent.isTextblock) {
          selectionPos = resolved.pos;
          break;
        }
      }

      if (selectionPos === safePos) {
        for (let ii = safePos - 1; ii >= 0; ii--) {
          resolved = tr.doc.resolve(ii);
          if (resolved.parent.isTextblock) {
            selectionPos = resolved.pos;
            break;
          }
        }
      }
    }

    return tr.setSelection(TextSelection.near(tr.doc.resolve(selectionPos)));
  }
}

export default LandscapeCommand;
