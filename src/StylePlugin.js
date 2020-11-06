// [FS] IRAD-1052 2020-10-30
// Plugin to handle custom style on load
import {
    Plugin,
    PluginKey
} from 'prosemirror-state';
import {
    Node
} from 'prosemirror-model';
import {
    applyLatestStyle,
    NONE,
    STRONG,
    EM,
    COLOR,
    FONTSIZE,
    STRIKE,
    SUPER,
    TEXTHL,
    UNDERLINE,
    ALIGN,
    LHEIGHT
} from './CustomStyleCommand';

const ALLOWED_MARKS = [STRONG, EM, COLOR, FONTSIZE, STRIKE, SUPER, TEXTHL, UNDERLINE, ALIGN, LHEIGHT];

export default class StylePlugin extends Plugin {

    constructor() {

        super({
            key: new PluginKey('StylePlugin'),
            state: {
                init(config, state) {
                    this.loaded = false;
                },
                apply(tr, value, oldState, newState) {}
            },
            props: {
                handleDOMEvents: {
                    keydown(view, event) {}
                },
                nodeViews: []
            },
            appendTransaction: (transactions, prevState, nextState) => {
                let tr = null;
                if (!this.loaded) {
                    this.loaded = true;
                    // do this only once when the document is loaded.
                    tr = applyStyles(nextState);
            } else {
                        // when user makes changes.
            }
                return tr;
            },
        });
    }
	
	getEffectiveSchema(schema) {
		return applyEffectiveSchema(schema);
	}
}

function assingIDsForMissing(prevState, nextState) {
	let tr = nextState.tr;
	let modified = false;
	const objIds = [];

	// Adds a unique id to a node
	nextState.doc.descendants((node, pos) => {
		let required = false;
		if (requiredAddAttr(node)) {
			required = true;
		} else {
			const objId = node.attrs[ATTR_OBJID];
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
			const newId = guidGenerator();
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

function applyStyles(state) {
    let tr = state.tr;
    tr.doc.descendants(function(child, pos) {
        const contentLen = child.content.size;
        if (child instanceof Node && 1 < contentLen) {
            tr = applyStyle(tr, state, child, pos, pos + contentLen);
        }
    });

    return tr;
}

function applyStyle(tr, state, node, startPos, endPos) {
    const styleName = node.attrs.styleName;
    if (styleName && NONE !== styleName) {
        tr = applyLatestStyle(styleName, state, tr, node, startPos, endPos);
    }
    return tr;
}

function isMarkHasAttribute(mark, attrName) {
	return (mark.attrs && mark.attrs[attrName]);
}

function isTargetMarkAllowed(mark) {
	return ALLOWED_MARKS.includes(mark.type.name);
}

function requiredAddAttr(mark) {
	return isTargetMarkAllowed(mark) && !isMarkHasAttribute(mark, ATTR_OBJID);
}

function createMarkAttributes(mark, markName) {
	const requiredAttrs = [...NEWATTRS];

	requiredAttrs.forEach(key => {
		let newAttr = mark.attrs[key];
		if (mark.attrs && !newAttr) {
			const existingAttr = mark.attrs[Object.keys(mark.attrs)[0]];
			newAttr = Object.assign(
				Object.create(Object.getPrototypeOf(existingAttr)),
				existingAttr
			);
			newAttr.default = null;
			mark.attrs[key] = newAttr;
		}
	});
}

function createNewAttributes(schema) {
	const marks = [];

	ALLOWED_MARKS.forEach((name) => {
		getRequiredNodes(marks, name, schema);
	});

	for (let i = 0, name = ''; i < marks.length; i++) {
		if (i < marks.length - 1) {
			// even items are content.
			// odd items are nodes.
			// Hence name is available only in the node.
			if (0 === i % 2) {
				name = marks[i + 1].name;
			}
		} else {
			name = '';
		}
		createMarkAttributes(marks[i], name);
	}

	return schema;
}

function getRequiredMarks(marks, markName, schema) {
	nodes.push(getContent(markName, schema));
	nodes.push(schema.marks[markName]);
}

function applyEffectiveSchema(schema) {
	if (schema && schema[SPEC]) {
		createNewAttributes(schema);
	}

	return schema;
}

function getContent(type, schema) {
	let content = null;
	const contentArr = schema[SPEC]['marks']['content'];
	const len = contentArr.length;
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