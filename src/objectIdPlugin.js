// [FS] IRAD-??? 2020-10-19
// Plugin to handle automatic assign unique id to the block nodes.
import {
	Plugin,
	PluginKey
} from 'prosemirror-state';
import uuid from './uuid';
import SetDocAttrStep from './SetDocAttrStep';
import {
	POST
} from './client/http';

const SPEC = 'spec';
const ATTR_OBJID = 'objectId';
const NEWATTRS = [ATTR_OBJID, 'objectMetaData'];

const isNodeHasAttribute = (node, attrName) => {
	return (node.attrs && node.attrs[attrName]);
};

const isTargetNodeAllowed = (node) => {
	return ALLOWED_NODES.includes(node.type.name);
};

const ATTR_DELETEDOBJIDS = 'deletedObjectIds';
const DOC_NAME = 'doc';

const ALLOWED_NODES = [DOC_NAME, 'paragraph', 'bullet_list', 'heading', 'image', 'ordered_list', 'table'];

const requiredAddAttr = (node) => {
	return isTargetNodeAllowed(node) && !isNodeHasAttribute(node, ATTR_OBJID);
};

export default class ObjectIdPlugin extends Plugin {

	constructor() {

		super({
			key: new PluginKey('ObjectIdPlugin'),
			state: {
				init(config, state) {},
				apply(tr, set) {}
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
					tr = trackDeletedObjectId(prevState, nextState, tr);
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
	return 'new:' + uuid();
}

function isDocChanged(transactions) {
	return (transactions.some((transaction) => transaction.docChanged));
}

function assingIDsForMissing(prevState, nextState) {
	let tr = nextState.tr;
	let modified = false;
	let objIds = [];

	// Adds a unique id to the document
	if (requiredAddAttr(nextState.doc)) {
		tr = tr.step(new SetDocAttrStep(ATTR_OBJID, guidGenerator()));
		modified = true;
	}

	// Adds a unique id to a node
	nextState.doc.descendants((node, pos) => {
		let required = false;
		if (requiredAddAttr(node)) {
			required = true;
		} else {
			let objId = node.attrs[ATTR_OBJID];
			if(objIds.includes(objId)) {
				// objectId already exists, recreate
				required = true;
			} else {
				if(objId) {
					objIds.push(objId);
				}
			}
		}
		if (required) {
			let newId = guidGenerator();
			objIds.push(newId);

			const attrs = node.attrs;
			tr.setNodeMarkup(pos, undefined, {
				...attrs,
				[ATTR_OBJID]: newId
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
function trackDeletedObjectId(prevState, nextState, tr) {
	const deletedIds = new Set();

	if (prevState.doc !== nextState.doc) {
		let prevNodesById = {};
		let nextNodesById = {};

		prevNodesById = nodeAssignment(prevState);
		nextNodesById = nodeAssignment(nextState);

		for (const [id] of Object.entries(prevNodesById)) {
			if (nextNodesById[id] === undefined) {
				deletedIds.add(id);
			}
		}
	}

	if (0 < deletedIds.size) {
		if (null == tr) {
			tr = nextState.tr;
		}

		let existingIDs = nextState.doc.attrs[ATTR_DELETEDOBJIDS];
		let mergedIDs = [];
		
		if (!existingIDs) {
			existingIDs = [];
		}

		if (existingIDs) {
			mergedIDs = existingIDs.concat([...deletedIds]);
		}
		tr = tr.step(new SetDocAttrStep(ATTR_DELETEDOBJIDS, mergedIDs));
	}

	return tr;
}

function createNodeAttributes(node, nodeName) {
	let requiredAttrs = [...NEWATTRS];

	if (DOC_NAME == nodeName) {
		requiredAttrs.push(ATTR_DELETEDOBJIDS);
	}

	requiredAttrs.forEach(key => {
		let newAttr = node.attrs[key];
		if (node.attrs && !newAttr) {
			let existingAttr = node.attrs[Object.keys(node.attrs)[0]];
			newAttr = Object.assign(
				Object.create(Object.getPrototypeOf(existingAttr)),
				existingAttr
			);
			newAttr.default = null;
			node.attrs[key] = newAttr;
		}
	});
}

function createNewAttributes(schema) {
	let nodes = [];

	ALLOWED_NODES.forEach((name) => {
		getRequiredNodes(nodes, name, schema);
	});

	for (let i = 0, name = ''; i < nodes.length; i++) {
		if (i < nodes.length - 1) {
			// even items are content.
			// odd items are nodes.
			// Hence name is available only in the node.
			if (0 === i % 2) {
				name = nodes[i + 1].name;
			}
		} else {
			name = '';
		}
		createNodeAttributes(nodes[i], name);
	}

	return schema;
}

function getRequiredNodes(nodes, nodeName, schema) {
	nodes.push(getContent(nodeName, schema));
	nodes.push(schema.nodes[nodeName]);
}

function applyEffectiveSchema(schema) {
	if (schema && schema[SPEC]) {
		createNewAttributes(schema);
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