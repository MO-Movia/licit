// [FS] IRAD-??? 2020-10-19
// Plugin to handle automatic assign unique id to the block nodes.
import {
  Plugin,
  PluginKey
} from "prosemirror-state"
import uuid from './uuid';
import SetDocAttrStep from './SetDocAttrStep';

const isNodeHasAttribute = (node, attrName) => {
  return (node.attrs && node.attrs[attrName]);
}

const isTargetNodeAllowed = (node) => {
  return ALLOWED_NODES.includes(node.type.name);
}

const ATTR_NAME = "objectId";
const DOC_NAME = "doc";

const ALLOWED_NODES = [DOC_NAME, "paragraph", "bullet_list", "heading", "image", "list_item", "ordered_list", "table"];

const requiredAddAttr = (node) => {
  return isTargetNodeAllowed(node) && !isNodeHasAttribute(node, ATTR_NAME);
}

export default class ObjectIdPlugin extends Plugin {

  constructor() {

    super({
      key: new PluginKey('ObjectIdPlugin'),
      state: {
        init(config, state) { },
        apply(tr, set) { }
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
        let tr = nextState.tr;
        let modified = false;
        if (transactions.some((transaction) => transaction.docChanged)) {
          // Adds a unique id to the document
          if (requiredAddAttr(nextState.doc)) {
            tr = tr.step(new SetDocAttrStep(ATTR_NAME, guidGenerator()));
            modified = true;
          }

          // Adds a unique id to a node
          nextState.doc.descendants((node, pos) => {
            if (requiredAddAttr(node)) {
              if (DOC_NAME == node.type.name) {
                tr = tr.step(new SetDocAttrStep(ATTR_NAME, guidGenerator()));
              } else {
                const attrs = node.attrs;
                tr.setNodeMarkup(pos, undefined, {
                  ...attrs,
                  [ATTR_NAME]: guidGenerator()
                });
                modified = true;
              }
            }
          });
        }
        trackDeletedObjectId(prevState, nextState);
        return modified ? tr : null;
      },
    });
  }

}
// returns new guid
function guidGenerator() {
  return uuid();
}

// track the deleted nodes
function trackDeletedObjectId(prevState, nextState) {
  if (prevState.doc !== nextState.doc) {
    const prevNodesById = {};
    const deletedIds = new Set();

    prevState.doc.descendants((node) => {
      if (isTargetNodeAllowed(node)) {
        if (node.attrs.objectId) {
          prevNodesById[node.attrs.objectId] = node;
        }
      }
    })
    const nextNodesById = {}
    nextState.doc.descendants((node) => {
      if (isTargetNodeAllowed(node)) {
        if (node.attrs.objectId) {
          nextNodesById[node.attrs.objectId] = node;
        }
      }
    })

    for (const [id, node] of Object.entries(prevNodesById)) {
      if (nextNodesById[id] === undefined) {
        deletedIds.add(id);
      }
    }
    console.log({
      deletedIds
    });
  }
}