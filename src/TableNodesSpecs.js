// @flow

import toCSSColor from './ui/toCSSColor.js';
import { Node } from 'prosemirror-model';
import { tableNodes } from 'prosemirror-tables';

const NO_VISIBLE_BORDER_WIDTH = new Set(['0pt', '0px']);

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
  },
});

// Override the default table node spec to support custom attributes.
const TableNodeSpec = Object.assign({}, TableNodesSpecs.table, {
  attrs: {
    marginLeft: { default: null },
    dirty: { default: false },
  },
  parseDOM: [
    {
      tag: 'table',
      getAttrs(dom: HTMLElement): ?Object {
        const dirty = dom.getAttribute('dirty') || false;
        const { marginLeft } = dom.style;
        const attrs = { dirty };

        if (marginLeft && /\d+px/.test(marginLeft)) {
          attrs.marginLeft = parseFloat(marginLeft);
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
    const { marginLeft, dirty } = node.attrs;
    const domAttrs = {};
    if (marginLeft) {
      domAttrs.style = `margin-left: ${marginLeft}px`;
    }
    if (dirty) {
      domAttrs.dirty = dirty;
    }
    return ['table', domAttrs, 0];
  },
});
Object.assign(TableNodesSpecs, { table: TableNodeSpec });

export default TableNodesSpecs;
