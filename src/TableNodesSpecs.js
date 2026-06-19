// @flow

import toCSSColor from './ui/toCSSColor.js';
import { toCSSLengthOrNull as toCSSLength } from './ui/toCSSLength.js';
import { Node } from 'prosemirror-model';
import { tableNodes } from 'prosemirror-tables';

const NO_VISIBLE_BORDER_WIDTH = new Set(['0pt', '0px']);

function appendStyle(attrs: Object, cssText: string): void {
  attrs.style = (attrs.style || '') + `;${cssText};`;
}

function appendStyleForValue(attrs: Object, cssProperty: string, value: any): void {
  if (value !== null && value !== undefined && value !== '') {
    appendStyle(attrs, `${cssProperty}: ${String(value)}`);
  }
}

function toDataAttributeName(name: string): string {
  return `data-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
}

function getCellAttributeValue(
  dom: HTMLElement,
  attrName: string,
  styleName: string,
  aliases?: Array<string> = []
): ?string {
  const attrNames = [attrName, toDataAttributeName(attrName), ...aliases];
  for (let ii = 0; ii < attrNames.length; ii++) {
    const attrValue = dom.getAttribute(attrNames[ii]);
    if (attrValue !== null && attrValue !== '') {
      return attrValue;
    }
  }

  const styleValue = dom.style[styleName];
  return styleValue || null;
}

function getLengthCellAttribute(
  dom: HTMLElement,
  attrName: string,
  styleName: string,
  aliases?: Array<string> = []
): ?string {
  return toCSSLength(getCellAttributeValue(dom, attrName, styleName, aliases));
}

function setLengthDOMAttr(cssProperty: string): Function {
  return (value, attrs) => {
    const cssValue = toCSSLength(value);
    if (cssValue) {
      appendStyle(attrs, `${cssProperty}: ${cssValue}`);
    }
  };
}

function setStyleDOMAttr(cssProperty: string): Function {
  return (value, attrs) => {
    appendStyleForValue(attrs, cssProperty, value);
  };
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
        return getLengthCellAttribute(dom, 'cellWidth', 'width', ['width']);
      },
      setDOMAttr(value, attrs) {
        const cssValue = toCSSLength(value);
        if (cssValue) {
          attrs.cellWidth = cssValue;
          appendStyle(attrs, `width: ${cssValue}`);
          appendStyle(attrs, `min-width: ${cssValue}`);
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
        return getLengthCellAttribute(dom, 'fontSize', 'fontSize');
      },
      setDOMAttr: setLengthDOMAttr('font-size'),
    },
    fontName: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(dom, 'fontName', 'fontFamily');
      },
      setDOMAttr(value, attrs) {
        appendStyleForValue(attrs, 'font-family', value);
      },
    },
    letterSpacing: {
      default: null,
      getFromDOM(dom) {
        return getLengthCellAttribute(dom, 'letterSpacing', 'letterSpacing');
      },
      setDOMAttr: setLengthDOMAttr('letter-spacing'),
    },
    marginTop: {
      default: null,
      getFromDOM(dom) {
        return getLengthCellAttribute(dom, 'marginTop', 'marginTop');
      },
      setDOMAttr: setLengthDOMAttr('margin-top'),
    },
    marginBottom: {
      default: null,
      getFromDOM(dom) {
        return getLengthCellAttribute(dom, 'marginBottom', 'marginBottom');
      },
      setDOMAttr: setLengthDOMAttr('margin-bottom'),
    },
    paddingTop: {
      default: null,
      getFromDOM(dom) {
        return getLengthCellAttribute(dom, 'paddingTop', 'paddingTop', [
          'PaddingTop',
        ]);
      },
      setDOMAttr: setLengthDOMAttr('padding-top'),
    },
    paddingBottom: {
      default: null,
      getFromDOM(dom) {
        return getLengthCellAttribute(dom, 'paddingBottom', 'paddingBottom');
      },
      setDOMAttr: setLengthDOMAttr('padding-bottom'),
    },
    lineHeight: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(dom, 'lineHeight', 'lineHeight');
      },
      setDOMAttr: setStyleDOMAttr('line-height'),
    },
    borderWidth: {
      default: null,
      getFromDOM(dom) {
        return getLengthCellAttribute(dom, 'borderWidth', 'borderWidth');
      },
      setDOMAttr: setLengthDOMAttr('border-width'),
    },
    borderLeftWidth: {
      default: null,
      getFromDOM(dom) {
        return getLengthCellAttribute(dom, 'borderLeftWidth', 'borderLeftWidth');
      },
      setDOMAttr: setLengthDOMAttr('border-left-width'),
    },
    borderRightWidth: {
      default: null,
      getFromDOM(dom) {
        return getLengthCellAttribute(dom, 'borderRightWidth', 'borderRightWidth');
      },
      setDOMAttr: setLengthDOMAttr('border-right-width'),
    },
    borderTopWidth: {
      default: null,
      getFromDOM(dom) {
        return getLengthCellAttribute(dom, 'borderTopWidth', 'borderTopWidth');
      },
      setDOMAttr: setLengthDOMAttr('border-top-width'),
    },
    borderBottomWidth: {
      default: null,
      getFromDOM(dom) {
        return getLengthCellAttribute(
          dom,
          'borderBottomWidth',
          'borderBottomWidth'
        );
      },
      setDOMAttr: setLengthDOMAttr('border-bottom-width'),
    },
    borderLeftColor: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(dom, 'borderLeftColor', 'borderLeftColor');
      },
      setDOMAttr: setStyleDOMAttr('border-left-color'),
    },
    borderRightColor: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(
          dom,
          'borderRightColor',
          'borderRightColor'
        );
      },
      setDOMAttr: setStyleDOMAttr('border-right-color'),
    },
    borderTopColor: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(dom, 'borderTopColor', 'borderTopColor');
      },
      setDOMAttr: setStyleDOMAttr('border-top-color'),
    },
    borderBottomColor: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(
          dom,
          'borderBottomColor',
          'borderBottomColor'
        );
      },
      setDOMAttr: setStyleDOMAttr('border-bottom-color'),
    },
    borderLeftStyle: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(dom, 'borderLeftStyle', 'borderLeftStyle');
      },
      setDOMAttr: setStyleDOMAttr('border-left-style'),
    },
    borderRightStyle: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(
          dom,
          'borderRightStyle',
          'borderRightStyle'
        );
      },
      setDOMAttr: setStyleDOMAttr('border-right-style'),
    },
    borderTopStyle: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(dom, 'borderTopStyle', 'borderTopStyle');
      },
      setDOMAttr: setStyleDOMAttr('border-top-style'),
    },
    borderBottomStyle: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(
          dom,
          'borderBottomStyle',
          'borderBottomStyle'
        );
      },
      setDOMAttr: setStyleDOMAttr('border-bottom-style'),
    },
    verticalAlign: {
      default: null,
      getFromDOM(dom) {
        return getCellAttributeValue(dom, 'verticalAlign', 'verticalAlign', [
          'valign',
          'vAlign',
        ]);
      },
      setDOMAttr(value, attrs) {
        if (value !== null && value !== undefined && value !== '') {
          const verticalAlign = String(value);
          attrs.verticalAlign = verticalAlign;
          attrs.valign = verticalAlign;
          appendStyle(attrs, `vertical-align: ${verticalAlign}`);
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

        if (marginLeft && /\d{1,1000}px/.test(marginLeft)) {
          attrs.marginLeft = parseFloat(marginLeft);
        }
        if (height || dom.getAttribute('height')) {
          attrs.tableheight = height || dom.getAttribute('height');
        }
        if (noOfColumnsAttr && /^\d{1,1000}$/.test(noOfColumnsAttr)) {
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
