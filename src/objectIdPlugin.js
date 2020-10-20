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
					trackDeletedObjectId(prevState, nextState);
				}
				return tr;
			},
		});
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