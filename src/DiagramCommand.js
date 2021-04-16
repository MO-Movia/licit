// @flow

import {Fragment, Schema} from 'prosemirror-model';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';

import {IMAGE} from './NodeNames';
import UICommand from './ui/UICommand';
import {EMPTY_DIAGRAM_SRC} from './ui/ImageNodeView';
function insertImage(tr: Transform, schema: Schema): Transform {
  const {selection} = tr;
  if (!selection) {
    return tr;
  }
  const {from, to} = selection;
  if (from !== to) {
    return tr;
  }

  const image = schema.nodes[IMAGE];
  if (!image) {
    return tr;
  }

  const attrs = {
    src: EMPTY_DIAGRAM_SRC,
    alt: '',
    title: '',
    diagram: '1',
    width: 701,
    height: 535,
  };

  const node = image.create(attrs, null, null);
  const frag = Fragment.from(node);
  tr = tr.insert(from, frag);
  return tr;
}
class DiagramCommands extends UICommand {
  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    const {selection, schema} = state;
    const tr = insertImage(state.tr.setSelection(selection), schema);
    if (tr.docChanged) {
      dispatch && dispatch(tr);
      return true;
    } else {
      return false;
    }
  };
}

export default DiagramCommands;
