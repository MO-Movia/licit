// [FS] IRAD-??? 2020-10-19
// Plugin to handle automatic assign unique id to the block nodes.
import {
  Plugin,
  PluginKey
} from "prosemirror-state"
import uuid from './uuid';
import SetDocAttrStep from './SetDocAttrStep';
import { POST } from './client/http';

const SPEC = "spec";
const OBJECTID = ['objectId', 'objectMetaData'];
const url = window.location.protocol + '\/\/' +
  window.location.hostname + ':3002/docs/' +
  1;
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
        let tr = null;
        if (isDocChanged(transactions)) {
          tr = assingIDsForMissing(prevState, nextState);
          trackDeletedObjectId(prevState, nextState);
        }
        return tr;
      },
    });
  }

  getEffectiveSchema(schema) {
    return applyEffectiveSchema(schema);
  }
}

function guidGenerator() {
  // returns new guid
  // prefix with "new:" to identify the newly created ids.
  return "new:" + uuid();
}

function isDocChanged(transactions) {
  return (transactions.some((transaction) => transaction.docChanged));
}

function assingIDsForMissing(prevState, nextState) {
  let tr = nextState.tr;
  let modified = false;
  // Adds a unique id to the document
  if (requiredAddAttr(nextState.doc)) {
    tr = tr.step(new SetDocAttrStep(ATTR_NAME, guidGenerator()));
    modified = true;
    //docModified = true;
  }

  // Adds a unique id to a node
  nextState.doc.descendants((node, pos) => {
    if (requiredAddAttr(node)) {
      const attrs = node.attrs;
      tr.setNodeMarkup(pos, undefined, {
        ...attrs,
        [ATTR_NAME]: guidGenerator()
      });
      modified = true;
    }
  });

  return modified ? tr : null;
}

function nodeAssignment(state) {
  const nodesById = {};
  state.doc.descendants((node) => {
    if (isTargetNodeAllowed(node)) {
      if (node.attrs.objectId) {
        nodesById[node.attrs.objectId] = node;
      }
    }
  });

  return nodesById;
}

// track the deleted nodes
function trackDeletedObjectId(prevState, nextState) {
  if (prevState.doc !== nextState.doc) {
    let prevNodesById = {};
    let nextNodesById = {};
    const deletedIds = new Set();

    prevNodesById = nodeAssignment(prevState);
    nextNodesById = nodeAssignment(nextState);

    for (const [id] of Object.entries(prevNodesById)) {
      if (nextNodesById[id] === undefined) {
        deletedIds.add(id);
      }
    }
    // console.log({
    // 	deletedIds
    // });
    if (deletedIds.size > 0) {
      updateDeleteIds(deletedIds);
    }
  }
}

function updateDeleteIds(ids) {
  // to avoid cyclic reference error, use flatted string.
  let delId = [];
  ids.forEach(obj => {
    delId.push(obj);
  });
  const delids = JSON.stringify(delId);
  POST(url + '/objectid/', delids, 'application/json').then(
    data => {
      console.log("objectids updated");

    },
    err => {
      console.log("error on update");
    }
  );
}

function createAttribute(content, value) {

  OBJECTID.forEach(key => {

    let objectIdAttr = content.attrs[key];
    if (content.attrs && !objectIdAttr) {
      let contentAttr = content.attrs[Object.keys(content.attrs)[0]];
      objectIdAttr = Object.assign(
        Object.create(Object.getPrototypeOf(contentAttr)),
        contentAttr
      );
      objectIdAttr.default = value;
      content.attrs[key] = objectIdAttr;
    }
  });

}

function createObjectIdAttribute(schema) {

  let contentArr = []

  ALLOWED_NODES.forEach((name) => {
    getContentArray(contentArr, name, schema);
  });

  contentArr.forEach((content) => {
    createAttribute(content);
  });
  return schema;
}

function getContentArray(contentArr, nodeName, schema) {
  contentArr.push(getContent(nodeName, schema));
  contentArr.push(schema.nodes[nodeName]);
}
function applyEffectiveSchema(schema) {
  if (schema && schema[SPEC]) {
    createObjectIdAttribute(schema);
  }

  return schema;
}

function getContent(type, schema) {

  let content = null;
  const contentArr = schema[SPEC]['nodes']['content'];
  let len = contentArr.length;
  // check even index to find the content type name
  for (let i = 0; i < len; i += 2) {
    if (type == contentArr[i]) {
      // found, so get the actual content which is in the next index.
      content = contentArr[i + 1];
      // break the loop;
      i = len;
    }
  }

  return content;
}