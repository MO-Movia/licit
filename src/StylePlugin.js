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
                    this.firstTime = true;
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
                    tr = applyStyles(nextState, tr);
                } else if(isDocChanged(transactions)) {
                    if(!this.firstTime) {
                        // when user updates
                        tr = updateStyleOverrideFlag(nextState, tr);
                    }
                    this.firstTime = false;
                }

                return tr;
            },
        });
    }

    getEffectiveSchema(schema) {
        return applyEffectiveSchema(schema);
    }
}

function isDocChanged(transactions) {
	return (transactions.some((transaction) => transaction.docChanged));
}

function updateStyleOverrideFlag(state, tr) {
    const retObj = { modified: false };
    if (!tr) {
        tr = state.tr;
    }

    tr.doc.descendants(function(child, pos) {
        const contentLen = child.content.size;
        if (haveEligibleChildren(child, contentLen)) {
            const startPos = tr.curSelection.$anchor.pos;//pos
            const endPos = tr.curSelection.$head.pos;//pos + contentLen
            tr = updateOverrideFlag(child.attrs.styleName, tr, child, startPos, endPos, retObj);
        }
    });

    return retObj.modified ? tr : null;
}

function haveEligibleChildren(node, contentLen) {
    return (node instanceof Node) && (0 < contentLen) && (node.type.name === 'paragraph') && (NONE !== node.attrs.styleName);
}

function applyStyles(state, tr) {
    if (!tr) {
        tr = state.tr;
    }

    tr.doc.descendants(function(child, pos) {
        const contentLen = child.content.size;
        if (haveEligibleChildren(child, contentLen)) {
            tr = applyLatestStyle(child.attrs.styleName, state, tr, child, pos, pos + contentLen + 1);
        }
    });

    return tr;
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