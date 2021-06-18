// temp view for custom style have to check this view is needed?

import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';

export class StyleView {
  constructor(editorView: EditorView) {
    this.update(editorView, null);
  }

  update(view: EditorView, lastState: EditorState): void {
    if (view.readOnly) {
      this.destroy();
      return;
    }
  }

  destroy() {}
}
