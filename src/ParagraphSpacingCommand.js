// @flow

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { AllSelection, TextSelection } from 'prosemirror-state';
import { BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH } from './NodeNames';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import * as React from 'react';

export function setParagraphSpacing(
  tr: Transform,
  schema: Schema,
  paragraphSpacing: ?string,
  isAfter: ?boolean
): Transform {
  const { selection, doc } = tr;
  if (!selection || !doc) {
    return tr;
  }

  if (
    !(selection instanceof TextSelection) &&
    !(selection instanceof AllSelection)
  ) {
    return tr;
  }

  const { from, to } = selection;
  const paragraph = schema.nodes[PARAGRAPH];
  const heading = schema.nodes[HEADING];
  const listItem = schema.nodes[LIST_ITEM];
  const blockquote = schema.nodes[BLOCKQUOTE];
  if (!paragraph && !heading && !listItem && !blockquote) {
    return tr;
  }

  const tasks = [];
  const paragraphSpacingValue = paragraphSpacing || null;

  doc.nodesBetween(from, to, (node, pos, parentNode) => {
    const nodeType = node.type;
    if (
      nodeType === paragraph ||
      nodeType === heading ||
      nodeType === listItem ||
      nodeType === blockquote
    ) {
      const paragraphSpacing = node.attrs.paragraphSpacing || null;
      if (paragraphSpacing !== paragraphSpacingValue) {
        tasks.push({
          node,
          pos,
          nodeType,
        });
      }
      return nodeType === listItem ? true : false;
    }
    return true;
  });

  if (!tasks.length) {
    return tr;
  }

  tasks.forEach((job) => {
    const { node, pos, nodeType } = job;
    let { attrs } = node;
    if (isAfter) {
      attrs = {
        ...attrs,
        paragraphSpacingAfter: paragraphSpacingValue
          ? paragraphSpacingValue
          : null,
      };
    } else {
      attrs = {
        ...attrs,
        paragraphSpacingBefore: paragraphSpacingValue
          ? paragraphSpacingValue
          : null,
      };
    }
    tr = tr.setNodeMarkup(pos, nodeType, attrs, node.marks);
  });

  return tr;
}

class ParagraphSpacingCommand extends UICommand {
  _paragraphSpacing: ?string;
  _isAfter: ?boolean;

  constructor(paragraphSpacing: ?string, isAfter: ?boolean) {
    super();
    this._paragraphSpacing = paragraphSpacing;
    this._isAfter = isAfter;
  }

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    const { schema, selection } = state;
    const tr = setParagraphSpacing(
      state.tr.setSelection(selection),
      schema,
      this._paragraphSpacing,
      this._isAfter
    );
    if (tr.docChanged) {
      dispatch && dispatch(tr);
      return true;
    } else {
      return false;
    }
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

export default ParagraphSpacingCommand;
