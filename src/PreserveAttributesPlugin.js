// plugin to keep the copied content's attributes when pasting
import { Plugin, PluginKey } from 'prosemirror-state';

const SPEC = {
  key: new PluginKey('preserveAttributesPlugin'),
  props: {
    handlePaste(view, event, slice) {
      let tr = view.state.tr;
      const currentNode = view.state.doc.nodeAt(
        view.state.selection.$from.before(1)
      );
      if (currentNode?.content?.size > 0) {
        return false;
      }
      tr = tr.delete(
        view.state.selection.$from.before(1),
        view.state.selection.$from.after(1)
      );
      slice.content.forEach((node) => {
        if (node.type.name === 'paragraph') {
          tr.replaceSelectionWith(
            node.type.create({ ...node.attrs }, node.content, node.marks)
          );
        } else {
          tr.replaceSelectionWith(node);
        }
      });

      view.dispatch(tr);
      return true;
    },
  },
};

class PreserveAttributesPlugin extends Plugin {
  constructor() {
    super(SPEC);
  }
}

export default PreserveAttributesPlugin;
