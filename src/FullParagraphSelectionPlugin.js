import { Plugin, PluginKey, NodeSelection } from "prosemirror-state";

class FullParagraphSelectionPlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey("fullParagraphSelection"),
      appendTransaction: (transactions, oldState, newState) => {
        const { selection, doc } = newState;
        // Skip if the selection is empty
        if (selection.empty) return;

        const { $from, $to } = selection;
        // Ensure the selection is within the same parent node and that parent is a paragraph
        if (
          $from.parent === $to.parent &&
          $from.parent.type.name === "paragraph" &&
          $from.parentOffset === 0 &&
          $to.parentOffset === $to.parent.content.size &&
          $from.pos !== $to.pos // non-empty selection check
        ) {
          // Get the position before the paragraph node
          const nodePos = $from.before();
          // Replace the current selection with a NodeSelection for the entire paragraph
          return newState.tr.setSelection(NodeSelection.create(doc, nodePos));
        }
      }
    });
  }
}

export default FullParagraphSelectionPlugin;