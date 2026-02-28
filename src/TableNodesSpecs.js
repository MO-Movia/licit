// @flow

import toCSSColor from './ui/toCSSColor.js';
import { Node } from 'prosemirror-model';
import { tableNodes } from 'prosemirror-tables';

const NO_VISIBLE_BORDER_WIDTH = new Set(['0pt', '0px']);

function toCSSLength(value: mixed): ?string {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && isFinite(value)) {
    return `${value}px`;
  }
  const stringValue = String(value).trim();
  if (!stringValue) {
    return null;
  }
  if (/^-?\d+(\.\d+)?$/.test(stringValue)) {
    return `${stringValue}px`;
  }
  return stringValue;
}

function appendStyle(attrs: Object, cssText: string): void {
  attrs.style = (attrs.style || '') + `;${cssText};`;
}

// https://github.com/ProseMirror/prosemirror-tables/blob/master/demo.js
const TableNodesSpecs = tableNodes({
  tableGroup: 'block',
  cellContent: 'block+',
  cellAttributes: {
    className: {
      default: null,
      getFromDOM(dom) {
        return dom.getAttribute('class') || null;
      },
      setDOMAttr(value, attrs) {
        if (value) {
          attrs.class = value;
        }
      },
    },
    borderTop: {
      default: null,
      getFromDOM(dom) {
        return dom.style.borderTop || null;
      },
      setDOMAttr(value, attrs) {
        if (value) {
          attrs.style = (attrs.style || '') + `;border-top: ${value};`;
        }
      },
    },
    borderRight: {
      default: null,
      getFromDOM(dom) {
        return dom.style.borderRight || null;
      },
      setDOMAttr(value, attrs) {
        if (value) {
          attrs.style = (attrs.style || '') + `;border-right: ${value};`;
        }
      },
    },
    borderBottom: {
      default: null,
      getFromDOM(dom) {
        return dom.style.borderBottom || null;
      },
      setDOMAttr(value, attrs) {
        if (value) {
          attrs.style = (attrs.style || '') + `;border-bottom: ${value};`;
        }
      },
    },
    borderLeft: {
      default: null,
      getFromDOM(dom) {
        return dom.style.borderLeft || null;
      },
      setDOMAttr(value, attrs) {
        if (value) {
          attrs.style = (attrs.style || '') + `;border-left: ${value};`;
        }
      },
    },
    borderColor: {
      default: null,
      getFromDOM(dom) {
        const { borderColor, borderWidth } = dom.style;

        if (NO_VISIBLE_BORDER_WIDTH.has(borderWidth)) {
          return 'transparent';
        }

        return (borderColor && toCSSColor(borderColor)) || null;
      },
      setDOMAttr(value, attrs) {
        if (value) {
          const colorValue = String(value);
          attrs.style = (attrs.style || '') + `;border-color: ${colorValue};`;
        }
      },
    },
    background: {
      default: null,
      // TODO: Move these to a table helper.
      getFromDOM(dom) {
        return dom.style.backgroundColor || null;
      },
      setDOMAttr(value, attrs) {
        if (value) {
          const colorValue = String(value);
          attrs.style =
            (attrs.style || '') + `;background-color: ${colorValue};`;
        }
      },
    },
    cellWidth: {
      default: null,
      getFromDOM(dom) {
        return dom.style.width || dom.getAttribute('width') || null;
      },
      setDOMAttr(value, attrs) {
        const cssValue = toCSSLength(value);
        if (cssValue) {
          appendStyle(attrs, `width: ${cssValue}`);
        }
      },
    },
    cellStyle: {
      default: null,
      getFromDOM(dom) {
        return dom.getAttribute('data-cell-style') || null;
      },
      setDOMAttr(value, attrs) {
        if (value === null || value === undefined) {
          return;
        }
        const styleValue = String(value).trim();
        if (!styleValue) {
          return;
        }
        attrs['data-cell-style'] = styleValue;
        attrs.style = (attrs.style || '') + `;${styleValue}`;
      },
    },
    fontSize: {
      default: null,
      getFromDOM(dom) {
        return dom.style.fontSize || null;
      },
      setDOMAttr(value, attrs) {
        const cssValue = toCSSLength(value);
        if (cssValue) {
          appendStyle(attrs, `font-size: ${cssValue}`);
        }
      },
    },
    letterSpacing: {
      default: null,
      getFromDOM(dom) {
        return dom.style.letterSpacing || null;
      },
      setDOMAttr(value, attrs) {
        const cssValue = toCSSLength(value);
        if (cssValue) {
          appendStyle(attrs, `letter-spacing: ${cssValue}`);
        }
      },
    },
    marginTop: {
      default: null,
      getFromDOM(dom) {
        return dom.style.marginTop || null;
      },
      setDOMAttr(value, attrs) {
        const cssValue = toCSSLength(value);
        if (cssValue) {
          appendStyle(attrs, `margin-top: ${cssValue}`);
        }
      },
    },
    marginBottom: {
      default: null,
      getFromDOM(dom) {
        return dom.style.marginBottom || null;
      },
      setDOMAttr(value, attrs) {
        const cssValue = toCSSLength(value);
        if (cssValue) {
          appendStyle(attrs, `margin-bottom: ${cssValue}`);
        }
      },
    },
  },
});

// Override the default table node spec to support custom attributes.
const TableNodeSpec = Object.assign({}, TableNodesSpecs.table, {
  attrs: {
    ...TableNodesSpecs.table.attrs,
    noOfColumns: { default: null },
    tableheight: { default: null },
    marginLeft: { default: null },
    dirty: { default: false },
    coverPage: { default: false },
  },
  parseDOM: [
    {
      tag: 'table',
      getAttrs(dom: HTMLElement): ?Object {
        const dirty = dom.getAttribute('dirty') || false;
        const coverPage = dom.getAttribute('data-cover-page') === 'true';
        const { marginLeft, height } = dom.style;
        const noOfColumnsAttr =
          dom.getAttribute('data-no-of-columns') ||
          dom.getAttribute('noOfColumns') ||
          dom.getAttribute('no-of-columns');
        const attrs = { dirty, coverPage };

        if (marginLeft && /\d+px/.test(marginLeft)) {
          attrs.marginLeft = parseFloat(marginLeft);
        }
        if (height || dom.getAttribute('height')) {
          attrs.tableheight = height || dom.getAttribute('height');
        }
        if (noOfColumnsAttr && /^\d+$/.test(noOfColumnsAttr)) {
          attrs.noOfColumns = parseInt(noOfColumnsAttr, 10);
        }
        if (!attrs.noOfColumns) {
          const firstRow = dom.querySelector('tr');
          const cells = firstRow
            ? firstRow.querySelectorAll('th, td').length
            : 0;
          if (cells > 0) {
            attrs.noOfColumns = cells;
          }
        }

        return attrs;
      },
    },
  ],
  toDOM(node: Node): Array<any> {
    // Normally, the DOM structure of the table node is rendered by
    // `TableNodeView`. This method is only called when user selects a
    // table node and copies it, which triggers the "serialize to HTML" flow
    //  that calles this method.
    const { noOfColumns, tableheight, marginLeft, dirty, coverPage } =
      node.attrs;
    const domAttrs = {};
    const styleChunks = [];
    if (marginLeft !== null && marginLeft !== undefined) {
      styleChunks.push(`margin-left: ${marginLeft}px`);
    }
    const tableHeight = toCSSLength(tableheight);
    if (tableHeight) {
      styleChunks.push(`height: ${tableHeight}`);
    }
    if (styleChunks.length) {
      domAttrs.style = styleChunks.join('; ');
    }
    if (dirty) {
      domAttrs.dirty = dirty;
    }
    if (coverPage) {
      domAttrs['data-cover-page'] = 'true';
    }
    if (typeof noOfColumns === 'number' && noOfColumns > 0) {
      domAttrs['data-no-of-columns'] = String(noOfColumns);
    }
    return ['table', domAttrs, 0];
  },
});

const TableRowNodeSpec = Object.assign({}, TableNodesSpecs.table_row, {
  attrs: {
    ...TableNodesSpecs.table_row.attrs,
    rowHeight: { default: null },
  },
  parseDOM: [
    {
      tag: 'tr',
      getAttrs(dom: HTMLElement): ?Object {
        const rowHeight =
          dom.style.height || dom.getAttribute('height') || null;
        return rowHeight ? { rowHeight } : null;
      },
    },
  ],
  toDOM(node: Node): Array<any> {
    const domAttrs = {};
    const rowHeight = toCSSLength(node.attrs?.rowHeight);
    if (rowHeight) {
      domAttrs.style = `height: ${rowHeight}`;
    }
    return ['tr', domAttrs, 0];
  },
});

Object.assign(TableNodesSpecs, {
  table: TableNodeSpec,
  table_row: TableRowNodeSpec,
});

export default TableNodesSpecs;
