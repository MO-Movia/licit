// @flow

import { Schema } from 'prosemirror-model';
import { AllSelection, EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import createPopUp from './ui/createPopUp';
import CustomStyleEditor from './ui/CustomStyleEditor';
import { BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH } from './NodeNames';
import UICommand from './ui/UICommand';
import { atViewportCenter } from './ui/PopUpPosition';

export function setTextAlign(
  tr: Transform,
  schema: Schema,
  alignment: ?string
): Transform {
  const { selection, doc } = tr;
  if (!selection || !doc) {
    return tr;
  }

  const { from, to } = selection;
  const { nodes } = schema;

  const blockquote = nodes[BLOCKQUOTE];
  const listItem = nodes[LIST_ITEM];
  const heading = nodes[HEADING];
  const paragraph = nodes[PARAGRAPH];

  const tasks = [];
  alignment = alignment || null;

  const allowedNodeTypes = new Set([blockquote, heading, listItem, paragraph]);

  doc.nodesBetween(from, to, (node, pos, parentNode) => {
    const nodeType = node.type;
    const align = node.attrs.align || null;
    if (align !== alignment && allowedNodeTypes.has(nodeType)) {
      tasks.push({
        node,
        pos,
        nodeType,
      });
    }
    return true;
  });

  if (!tasks.length) {
    return tr;
  }

  tasks.forEach(job => {
    const { node, pos, nodeType } = job;
    let { attrs } = node;
    if (alignment) {
      attrs = {
        ...attrs,
        align: alignment,
      };
    } else {
      attrs = {
        ...attrs,
        align: null,
      };
    }
    tr = tr.setNodeMarkup(pos, nodeType, attrs, node.marks);
  });

  return tr;
}

class TextAlignCommand extends UICommand {
  _alignment: string;
  _popUp: null;
  constructor(alignment: string) {
    super();
    this._alignment = alignment;
  }

  isActive = (state: EditorState): boolean => {
    const { selection, doc } = state;
    const { from, to } = selection;
    let keepLooking = true;
    let active = false;
    doc.nodesBetween(from, to, (node, pos) => {
      if (keepLooking && node.attrs.align === this._alignment) {
        keepLooking = false;
        active = true;
      }
      return keepLooking;
    });
    return active;
  };

  isEnabled = (state: EditorState): boolean => {
    const { selection } = state;
    return (
      selection instanceof TextSelection || selection instanceof AllSelection
    );
  };

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {


    // ** Temperoraly commented  the textalign functionality//
    // 2020-09-24

    // const {schema, selection} = state;
    // const tr = setTextAlign(
    //   state.tr.setSelection(selection),
    //   schema,
    //   this._alignment
    // );
    // if (tr.docChanged) {
    //   dispatch && dispatch(tr);
    //   return true;
    // } else {
    //   return false;
    // }
    this.showAlert()
  };

  showAlert() {
    const anchor = null;
    this._popUp = createPopUp(CustomStyleEditor, null, {
      anchor,
      position: atViewportCenter,
      onClose: val => {
        if (this._popUp) {
          this._popUp = null;

        }
      },
    });
  }
}

export default TextAlignCommand;
