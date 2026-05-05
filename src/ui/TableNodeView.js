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
      this.table.dataset.noOfColumns = String(noOfColumns);
    } else {
      delete this.table.dataset.noOfColumns;
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
      this.table.dataset.coverPage = 'true';
    } else {
      delete this.table.dataset.coverPage;
    }

    this._updateCellAttrs(node);
  }

  _updateCellAttrs(tableNode: Node): void {
    const tbody = this.table.tBodies?.[0];
    if (!tbody) {
      return;
    }

    const rowElements = Array.from(tbody.rows);
    const rowCount = Math.min(tableNode.childCount, rowElements.length);

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowNode = tableNode.child(rowIndex);
      const rowEl = rowElements[rowIndex];
      const cellElements = Array.from(rowEl.cells);
      const cellCount = Math.min(rowNode.childCount, cellElements.length);

      for (let colIndex = 0; colIndex < cellCount; colIndex++) {
        const cellNode = rowNode.child(colIndex);
        const cellEl = cellElements[colIndex];
        this._applyCellAttrs(cellEl, cellNode.attrs);
      }
    }
  }

  _applyCellAttrs(cellEl: HTMLTableCellElement, attrs): void {
    const css = (v) => (v ? toCSSLength(v) : '');

    const {
      fontSize,
      letterSpacing,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      cellWidth,
      paddingTop,
      paddingBottom,
      paddingRight,
      paddingLeft,
      lineHeight,
      borderWidth,
      verticalAlign
    } = attrs;

    cellEl.style.fontSize = css(fontSize);
    cellEl.style.letterSpacing = letterSpacing ? toCSSLength(letterSpacing) : '';
    cellEl.style.marginTop = css(marginTop);
    cellEl.style.marginBottom = css(marginBottom);
    cellEl.style.marginLeft = css(marginLeft);
    cellEl.style.marginRight = css(marginRight);
    cellEl.style.paddingTop = css(paddingTop);
    cellEl.style.paddingBottom = css(paddingBottom);
    cellEl.style.paddingRight = css(paddingRight);
    cellEl.style.paddingLeft = css(paddingLeft);
    cellEl.style.lineHeight = css(lineHeight);
    cellEl.style.borderWidth = css(borderWidth);
    cellEl.style.verticalAlign = css(verticalAlign);
    cellEl.style.width = css(cellWidth);
  }
}
