// [FS][16-10-2020]
// Plugin to handle objectId generation

import { Plugin, PluginKey } from "prosemirror-state"
import uuid from './uuid';

const isNodeHasAttribute = (node, attrName) => {
  Boolean(node.attrs && node.attrs[attrName]);
}

const attrName = "objectId";

export default class objectIdPlugin extends Plugin {

  constructor() {

    super({
      key: new PluginKey('objectId'),
      state: {
        init(config, state) {
        },
        apply(tr, set) {
        }
      },
      props: {
        handleDOMEvents: {
          keydown(view, event) {
            const charCode = event.key;
            console.log(charCode);

          }
        },
        nodeViews: []
      },
      appendTransaction: (transactions, prevState, nextState) => {
        const tr = nextState.tr;
        let modified = false;
        if (transactions.some((transaction) => transaction.docChanged)) {
          // Adds a unique id to a node
          nextState.doc.descendants((node, pos) => {
            const { paragraph } = nextState.schema.nodes;
            // now the key is generated for paragraphs only 
            //need to handle list and tables
            if ('paragraph' === node.type.name) {
              if (!isNodeHasAttribute(node, attrName)) {
                const attrs = node.attrs;
                tr.setNodeMarkup(pos, undefined, { ...attrs, [attrName]: guidGenerator() });
                modified = true;
              }
            }
          });
        }

        return modified ? tr : null;
      },
    });
  }

}
// returns new guid
function guidGenerator() {
  return uuid();
}