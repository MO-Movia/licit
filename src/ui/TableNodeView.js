import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { TableView } from 'prosemirror-tables';
import toCSSLength from './toCSSLength.js';

// A custom table view that renders the margin-left style.
export default class TableNodeView extends TableView {
  constructor(node: Node, colMinWidth: number, view: EditorView) {
    super(node, colMinWidth, view);
    this._updateAttrs(node);
  }
  update(node: Node): boolean {
    const updated = super.update(node);
    if (updated) {
      this._updateAttrs(node);
    }
    return updated;
  }

  _updateAttrs(node: Node): void {
    // Handle marginLeft
    const marginLeft = node.attrs?.marginLeft || 0;
    this.table.style.marginLeft = marginLeft ? `${marginLeft}px` : '';
    this.table.style.height = toCSSLength(node.attrs?.tableheight);

    const noOfColumns = node.attrs?.noOfColumns;
    if (typeof noOfColumns === 'number' && noOfColumns > 0) {
      this.table.setAttribute('data-no-of-columns', String(noOfColumns));
    } else {
      this.table.removeAttribute('data-no-of-columns');
    }

    // Handle vignette
    if (node.attrs?.vignette) {
      this.table.style.border = 'none';
    }

    // Handle dirty -> sets a data attribute for DOM/state sync
    if (node.attrs?.dirty) {
      this.table.setAttribute('dirty', 'true');
    } else {
      this.table.removeAttribute('dirty');
    }
    if (node.attrs?.coverPage) {
      this.table.setAttribute('data-cover-page', 'true');
    } else {
      this.table.removeAttribute('data-cover-page');
    }
  }
}
