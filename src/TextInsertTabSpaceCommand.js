// @flow

import { Schema } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { findParentNodeOfType } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';
import { HEADING, LIST_ITEM, PARAGRAPH, SPACER } from './NodeNames.js';
import { SPACER_SIZE_TAB, HANGING_INDENT_TAB } from './SpacerMarkSpec.js';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import * as React from 'react';

function applyHangingIndent(state, node, pos, from): Transform {
  const hangingInches = parseFloat(node.attrs.indentPosition);
  const hangingPx = (hangingInches * 96);
  const tr = state.tr.setNodeMarkup(pos, undefined, {
    ...node.attrs,
    isHangingIndentApplied: true,
    indentPosition: hangingPx,
    isHangingIndentTab: true,
  });
  return tr;
}


function insertTabSpace(
  state: EditorState,
  tr: Transform,
  schema: Schema
): Transform {
  const { selection } = tr;
  if (!selection.empty || !(selection instanceof TextSelection)) {
    return tr;
  }

  const spacer = schema.nodes[SPACER];
  if (!spacer) {
    return tr;
  }
  const paragraph = schema.nodes[PARAGRAPH];
  const heading = schema.nodes[HEADING];
  const listItem = schema.nodes[LIST_ITEM];

  const found =
    (listItem && findParentNodeOfType(listItem)(selection)) ||
    (paragraph && findParentNodeOfType(paragraph)(selection)) ||
    (heading && findParentNodeOfType(heading)(selection));

  if (!found) {
    return tr;
  }

  const { $from, from, to } = selection;
  let latestIndentNode = null;
  const isHangingIndent = ($from.parentOffset > 0 & found.node.attrs.indentPosition && !found.node.attrs.isHangingIndentApplied);
  if (isHangingIndent) {
    tr = applyHangingIndent(state, found.node, found.pos, from);
    latestIndentNode = tr.doc.nodeAt(found.pos);
  }

  if (found.node.type === listItem && found.pos === from - 2) {
    // Cursur is at the begin of the list-item, let the default indentation
    // behavior happen.
    return tr;
  }

  if (found.node.type === paragraph && found.pos === from - 1) {
    return tr;
  }

  const indentPx = latestIndentNode ? latestIndentNode.attrs.indentPosition : null;
  if (indentPx) {
    const paragraphStart = found.pos + 1;
    const cursorOffset = from - paragraphStart;
    const paragraphText = found.node.textContent || '';
    const textBeforeCursor = paragraphText.slice(0, cursorOffset);
    const font = window.getComputedStyle(document.body).font || '16px Arial';
    const currentWidth = measureTextWidth(textBeforeCursor, font);
    const neededSpace = indentPx - currentWidth;
    const spacerNode = spacer.create({
      size: isHangingIndent ? HANGING_INDENT_TAB : SPACER_SIZE_TAB,
      indentPosition: neededSpace,
    });
    tr.replaceSelectionWith(spacerNode, false);
    tr = tr.setSelection(TextSelection.create(tr.doc, to + 1, to + 1));
    return tr;
  }
  const spacerNode = spacer.create({
    size: SPACER_SIZE_TAB,
    indentPosition: null,
  });
  tr.replaceSelectionWith(spacerNode, false);
  tr = tr.setSelection(TextSelection.create(tr.doc, to + 1, to + 1));
  return tr;
}

function measureTextWidth(text, font = '16px Arial') {
  const canvas = measureTextWidth._canvas || (measureTextWidth._canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  return context.measureText(text).width;
}

class TextInsertTabSpaceCommand extends UICommand {
  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    event: ?SyntheticEvent<>
  ): boolean => {
    const { schema, tr } = state;
    const trNext = insertTabSpace(state, tr, schema);
    if (trNext.docChanged) {
      dispatch && dispatch(trNext);
      return true;
    }
    return false;
  };

  waitForUserInput = (
    _state: EditorState,
    _dispatch: ?(tr: Transform) => void,
    _view: ?EditorView,
    _event: ?React.SyntheticEvent
  ): Promise<undefined> => {
    return Promise.resolve(undefined);
  };

  executeWithUserInput = (
    _state: EditorState,
    _dispatch: ?(tr: Transform) => void,
    _view: ?EditorView,
    _inputs: ?string
  ): boolean => {
    return false;
  };

  cancel(): void {
    return null;
  }
}

export default TextInsertTabSpaceCommand;
