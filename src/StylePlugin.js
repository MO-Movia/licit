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
    updateOverrideFlag,
    ATTR_OVERRIDDEN,
    NONE
} from './CustomStyleCommand';
import {
    MARK_STRONG,
    MARK_EM,
    MARK_TEXT_COLOR,
    MARK_FONT_SIZE,
    MARK_FONT_TYPE,
    MARK_STRIKE,
    MARK_SUPER,
    MARK_TEXT_HIGHLIGHT,
    MARK_UNDERLINE
} from './MarkNames';

const ALLOWED_MARKS = [MARK_STRONG, MARK_EM, MARK_TEXT_COLOR, MARK_FONT_SIZE, MARK_FONT_TYPE, MARK_STRIKE, MARK_SUPER, MARK_TEXT_HIGHLIGHT, MARK_UNDERLINE];
const SPEC = 'spec';
const NEWATTRS = [ATTR_OVERRIDDEN];

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

                tr = handleMarkOverridenFlag(prevState, nextState);

                if (!this.loaded) {
                    this.loaded = true;
                    // do this only once when the document is loaded.
                    tr = applyStyles(nextState, tr);
                } else {
                    // TODO: Incomplete and so commenting out
                    // when user updates
                    tr = updateStyleOverrideFlag(nextState, tr);
                }

                return tr;
            },
        });
    }

    getEffectiveSchema(schema) {
        return applyEffectiveSchema(schema);
    }
}

function handleMarkOverridenFlag(prevState, nextState) {
    const tr = nextState.tr;
    let modified = false;

    // Adds overriden flag to all nodes' marks.
    nextState.doc.descendants((node, parentPos) => {
        node.descendants(function(child: Node, pos: number, parent: Node) {
            const contentLen = child.content.size;
            if (child instanceof Node && (parent.type.name === 'paragraph') && 1 < contentLen) {
                child.marks.forEach(function(mark, index) {
                    if (requiredAddAttr(mark)) {
                        mark.attrs[ATTR_OVERRIDDEN] = false;
                        modified = true;
                    }

                    if (modified) {
                        tr = tr.removeMark(pos, pos + contentLen, mark);
                        tr = tr.addMark(pos, pos + contentLen, mark);
                    }
                });
            }
        });
    });

    return modified ? tr : null;
}

function updateStyleOverrideFlag(state, tr) {
    let retObj = { modified: false };	
    if (!tr) {
        tr = state.tr;
    }

    tr.doc.descendants(function(child, pos) {
        const contentLen = child.content.size;
        if (haveEligibleChildren(child, contentLen)) {
            tr = updateOverrideFlag(child.attrs.styleName, tr, child, pos, pos + contentLen, retObj);
        }
    });

    return retObj.modified ? tr : null;
}

function haveEligibleChildren(node, contentLen) {
    return (node instanceof Node) && (1 < contentLen) && (node.type.name === 'paragraph') && (NONE !== node.attrs.styleName);
}

function applyStyles(state, tr) {
    if (!tr) {
        tr = state.tr;
    }

    tr.doc.descendants(function(child, pos) {
        const contentLen = child.content.size;
        if (haveEligibleChildren(child, contentLen)) {
            tr = applyLatestStyle(child.attrs.styleName, state, tr, child, pos, pos + contentLen);
        }
    });

    return tr;
}

function isMarkHasAttribute(mark, attrName) {
    return (mark.attrs && (undefined != mark.attrs[attrName]));
}

function isTargetMarkAllowed(mark) {
    return ALLOWED_MARKS.includes(mark.type.name);
}

function requiredAddAttr(mark) {
    return isTargetMarkAllowed(mark) && !isMarkHasAttribute(mark, ATTR_OVERRIDDEN);
}

function createMarkAttributes(mark, markName, existingAttr) {
    if (mark) {
        const requiredAttrs = [...NEWATTRS];

        requiredAttrs.forEach(key => {
            if (mark.attrs) {
                let newAttr = mark.attrs[key];
                if (!newAttr) {
                    if (existingAttr) {
                        newAttr = Object.assign(
                            Object.create(Object.getPrototypeOf(existingAttr)),
                            existingAttr
                        );
                        newAttr.default = false;
                    } else {
                        newAttr = {};
                        newAttr.hasDefault = true;
                        newAttr.default = false;
                    }
                    mark.attrs[key] = newAttr;
                }
            }
        });
    }
}

function getAnExistingAttribute(schema) {
    let existingAttr = null;

    try {
        existingAttr = schema['marks']['link']['attrs']['href'];
    } catch (err) {}

    return existingAttr;
}

function createNewAttributes(schema) {
    const marks = [];
    const existingAttr = getAnExistingAttribute(schema);

    ALLOWED_MARKS.forEach((name) => {
        getRequiredMarks(marks, name, schema);
    });

    for (let i = 0, name = ''; i < marks.length; i++) {
        if (i < marks.length - 1) {
            // even items are content.
            // odd items are marks.
            // Hence name is available only in the node.
            if (0 === i % 2) {
                const mark = marks[i + 1];
                if (mark) {
                    name = mark.name;
                }
            }
        } else {
            name = '';
        }
        createMarkAttributes(marks[i], name, existingAttr);
    }

    return schema;
}

function getRequiredMarks(marks, markName, schema) {
    const mark = getContent(markName, schema);

    if (mark) {
        marks.push(mark);
        marks.push(schema.marks[markName]);
    }
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