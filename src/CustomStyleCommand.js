// @flow
import {
    EditorState,
    TextSelection
} from 'prosemirror-state';
import {
    Transform
} from 'prosemirror-transform';
import {
    EditorView
} from 'prosemirror-view';
import { Node, Schema } from 'prosemirror-model';
import UICommand from './ui/UICommand';
import {
    atViewportCenter
} from './ui/PopUpPosition';
import createPopUp from './ui/createPopUp';
import CustomStyleEditor from './ui/CustomStyleEditor';
import MarkToggleCommand from './MarkToggleCommand';
import TextColorCommand from './TextColorCommand';
import TextHighlightCommand from './TextHighlightCommand';
import TextAlignCommand from './TextAlignCommand';
import FontTypeCommand from './FontTypeCommand';
import FontSizeCommand from './FontSizeCommand';
import TextLineSpacingCommand from './TextLineSpacingCommand';
import { setTextAlign } from './TextAlignCommand';
import ParagraphSpacingCommand from './ParagraphSpacingCommand';
import IndentCommand from './IndentCommand';
import {
    clearCustomStyleMarks
} from './clearCustomStyleMarks';
import {
    saveStyle,
    getCustomStyleByName
} from './customStyle';
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
import { getLineSpacingValue } from './ui/toCSSLineSpacing';

export const STRONG = 'strong';
export const EM = 'em';
export const COLOR = 'color';
export const FONTSIZE = 'fontsize';
export const FONTNAME = 'fontname';
export const STRIKE = 'strike';
export const SUPER = 'super';
export const TEXTHL = 'texthighlight';
export const UNDERLINE = 'underline';
export const ALIGN = 'align';
export const LHEIGHT = 'lineheight';
export const NONE = 'None';
export const SAFTER = 'spaceafter';
export const SBEFORE = 'spacebefore';
export const ATTR_OVERRIDDEN = 'overridden';
export const INDENT = 'indent';
export const NUMBERING = 'hasnumbering';
export const LEVELBASEDINDENT = 'islevelbased';
export const LEVEL = 'level';

// [FS] IRAD-1042 2020-10-01
// Creates commands based on custom style JSon object
export function getCustomStyleCommands(customStyle: any) {
    const commands = [];
    for (const property in customStyle) {

        switch (property) {
            case STRONG:
                // [FS] IRAD-1043 2020-10-23
                // Issue fix : unselect a style when creating a new style
                // and that unselected styles also applied in selected paragraph
                if (customStyle[property])
                    commands.push(new MarkToggleCommand('strong'));
                break;

            case EM:
                // [FS] IRAD-1043 2020-10-23
                // Issue fix : unselect a style when creating a new style
                // and that unselected styles also applied in selected paragrapgh
                if (customStyle[property]) commands.push(new MarkToggleCommand('em'));
                break;

            case COLOR:
                commands.push(new TextColorCommand(customStyle[property]));
                break;

            case FONTSIZE:
                commands.push(new FontSizeCommand(Number(customStyle[property])));
                break;

            case FONTNAME:
                commands.push(new FontTypeCommand(customStyle[property]));
                break;

            case STRIKE:
                // [FS] IRAD-1043 2020-10-23
                // Issue fix : unselect a style when creating a new style
                // and that unselected styles also applied in selected paragrapgh
                if (customStyle[property])
                    commands.push(new MarkToggleCommand('strike'));
                break;

            case SUPER:
                commands.push(new MarkToggleCommand('super'));
                break;

            case TEXTHL:
                commands.push(new TextHighlightCommand(customStyle[property]));
                break;

            case UNDERLINE:
                // [FS] IRAD-1043 2020-12-15
                // Issue fix: user unselect Underline from a existing custom style, it didn't reflect in editor
                if (customStyle[property])
                commands.push(new MarkToggleCommand('underline'));
                break;

            case ALIGN:
                commands.push(new TextAlignCommand(customStyle[property]));
                break;

            case LHEIGHT:
                commands.push(new TextLineSpacingCommand(customStyle[property]));
                break;

            // [FS] IRAD-1100 2020-11-05
            // Add in leading and trailing spacing (before and after a paragraph)
            case SAFTER:
                commands.push(new ParagraphSpacingCommand(customStyle[property], true));
                break;

            case SBEFORE:
                commands.push(new ParagraphSpacingCommand(customStyle[property], false));
                break;
            case INDENT:
                commands.push(new IndentCommand(customStyle[property]));
                break;

            case LEVELBASEDINDENT:
                if (customStyle[LEVEL] && Number(customStyle[LEVEL]) > 0) {
                    commands.push(new IndentCommand(customStyle[LEVEL]));
                }
                break;
            default:
                break;
        }
    }
    return commands;
}

class CustomStyleCommand extends UICommand {
    _customStyleName: string;
    _customStyle = [];
    _popUp = null;

    constructor(customStyle: any, customStyleName: string) {
        super();
        this._customStyle = customStyle;
        this._customStyleName = customStyleName;
    }

    renderLabel = (state: EditorState): any => {
        return this._customStyleName;
    };

    getTheInlineStyles = (isInline: boolean) => {
        let attrs = {};
        let propsCopy = [];
        propsCopy = Object.assign(propsCopy, this._customStyle);

        propsCopy.forEach((style) => {
            attrs = Object.assign(attrs, style);
            Object.entries(style).forEach(([key, value]) => {
                if (isInline && typeof value === 'boolean') {
                    delete attrs[key];
                } else if (!isInline && typeof value != 'boolean') {
                    delete attrs[key];
                }
            });
        });
        return attrs;
    };

    isEmpty = (obj) => {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    isEnabled = (state: EditorState, view: EditorView, menuTitle: string): boolean => {
        // [FS] IRAD-1053 2020-10-22
        // Disable the Clear style menu when no styles applied to a paragraph
        return !('clearstyle' == menuTitle && NONE == this.isCustomStyleApplied(state));
    };

    // [FS] IRAD-1053 2020-10-22
    // returns the applied style of a paragraph
    isCustomStyleApplied(editorState: EditorState) {
        const {
            selection,
            doc
        } = editorState;
        const {
            from,
            to
        } = selection;
        let customStyleName = NONE;
        doc.nodesBetween(from, to, (node, pos) => {
            if (node.attrs.styleName) {
                customStyleName = node.attrs.styleName;
            }
        });
        return customStyleName;
    }

    execute = (
        state: EditorState,
        dispatch: ?(tr: Transform) => void,
        view: ?EditorView
    ): boolean => {
        let {
            tr
        } = state;
        const {
            selection
        } = state;


        if ('newstyle' === this._customStyle) {
            this.editWindow(state, view);
            return false;
        }
        // [FS] IRAD-1053 2020-10-08
        // to remove the custom styles applied in the selected paragraph
        else if ('clearstyle' === this._customStyle || 'None' === this._customStyle) {
            tr = clearCustomStyleMarks(state.tr.setSelection(selection), state.schema, state);
            if (dispatch && tr.docChanged) {
                dispatch(tr);
                return true;
            }
            return false;
        }

        tr = applyStyle(this._customStyle.styles, this._customStyle.stylename, state, tr);

        if (tr.docChanged || tr.storedMarksSet) {
            // view.focus();
            dispatch && dispatch(tr);
            return true;
        }
        return false;
    };

    // shows the create style popup
    editWindow(state: EditorState, view: EditorView) {

        const {
            dispatch
        } = view;
        let tr = state.tr;
        const doc = state.doc;

        this._popUp = createPopUp(CustomStyleEditor, this.createCustomObject(), {
            autoDismiss: false,
            position: atViewportCenter,
            onClose: val => {
                if (this._popUp) {
                    this._popUp = null;
                    //handle save style object part here
                    if (undefined !== val) {
                        this.saveStyleObject(val);
                        tr = tr.setSelection(TextSelection.create(doc, 0, 0));
                        // Apply created styles to document
                        tr = applyStyle(val.styles, val.stylename, state, tr);
                        dispatch(tr);
                        view.focus();
                    }
                }
            },
        });
    }

    // creates a sample style object
    createCustomObject() {
        return {
            stylename: '',
            mode: 0,//new
            styles: {},
        };

    }

    // locally save style object
    saveStyleObject(style: any) {
        saveStyle(style, style.styleName);
    }
}

function compareMarkWithStyle(mark, style, tr, startPos, endPos, retObj) {
    let same = false;
    let overridden = false;

    switch (mark.type.name) {
        case MARK_STRONG:
            same = (undefined != style[STRONG]);
            break;
        case MARK_EM:
            same = (undefined != style[EM]);
            break;
        case MARK_TEXT_COLOR:
            same = mark.attrs['color'] == style[COLOR];
            break;
        case MARK_FONT_SIZE:
            same = mark.attrs['pt'] == style[FONTSIZE];
            break;
        case MARK_FONT_TYPE:
            same = mark.attrs['name'] == style[FONTNAME];
            break;
        case MARK_STRIKE:
            same = (undefined != style[STRIKE]);
            break;
        case MARK_SUPER:
            break;
        case MARK_TEXT_HIGHLIGHT:
            break;
        case MARK_UNDERLINE:
            same = (undefined != style[UNDERLINE]);
            break;
        default:
            break;
    }

    overridden = !same;

    if (undefined != mark.attrs[ATTR_OVERRIDDEN] &&
        mark.attrs[ATTR_OVERRIDDEN] != overridden &&
        tr.curSelection) {
        mark.attrs[ATTR_OVERRIDDEN] = overridden;

        tr = tr.removeMark(startPos, endPos, mark);
        tr = tr.addMark(startPos, endPos, mark);
        retObj.modified = true;
    }
    /*
    case SUPER:
    case TEXTHL:
    case ALIGN:
    case LHEIGHT:*/

    return tr;
}

export function updateOverrideFlag(styleName: string, tr: Transform, node: Node,
    startPos: Number, endPos: Number, retObj: any) {
    const style = getCustomStyleByName(styleName);

    if (style) {
        node.descendants(function (child: Node, pos: number, parent: Node) {
            if (child instanceof Node) {
                child.marks.forEach(function (mark, index) {
                    tr = compareMarkWithStyle(mark, style, tr, startPos, endPos, retObj);
                });
            }
        });
    }

    return tr;
}

function onLoadRemoveAllMarksExceptOverridden(node: Node, schema: Schema,
    from: Number, to: Number, tr: Transform) {
    const tasks = [];
    node.descendants(function (child: Node, pos: number, parent: Node) {
        if (child instanceof Node) {
            child.marks.forEach(function (mark, index) {
                if (!mark.attrs[ATTR_OVERRIDDEN]) {
                    tasks.push({
                        child,
                        pos,
                        mark
                    });
                }
            });
        }
    });

    return handleRemoveMarks(tr, tasks, from, to, schema);
}

export function getMarkByStyleName(styleName: string, schema: Schema) {

    const style = getCustomStyleByName(styleName);
    const marks = [];
    let markType = null;
    let attrs = null;
    for (const property in style) {

        switch (property) {
            case STRONG:

                if (style[property]) {
                    markType = schema.marks[MARK_STRONG];
                    marks.push(markType.create(attrs));
                }
                break;

            case EM:

                markType = schema.marks[MARK_EM];

                if (style[property]) marks.push(markType.create(attrs));
                break;

            case COLOR:
                markType = schema.marks[MARK_TEXT_COLOR];
                 attrs = style[property] ? { color: style[property] } : null;
                marks.push(markType.create(attrs));
                break;

            case FONTSIZE:
                markType = schema.marks[MARK_FONT_SIZE];
                 attrs = style[property] ? { pt: style[property] } : null;
                marks.push(markType.create(attrs));

                break;

            case FONTNAME:
                markType = schema.marks[MARK_FONT_TYPE];
                 attrs = style[property] ? { name: style[property] } : null;
                marks.push(markType.create(attrs));
                break;


            case TEXTHL:
                markType = schema.marks[MARK_TEXT_HIGHLIGHT];
                 attrs = style[property] ? { highlightColor: style[property] } : null;
                marks.push(markType.create(attrs));
                break;

            case UNDERLINE:
                markType = schema.marks[MARK_UNDERLINE];
        
                marks.push(markType.create(attrs));
                break;


            default:
                break;
        }
    }
    return marks;
}
function applyStyleEx(style: any, styleName: string, state: EditorState, tr: Transform,
    node: Node, startPos: Number, endPos: Number) {
    const loading = !style;
    if (loading) {
        style = getCustomStyleByName(styleName);
    }
    const _commands = getCustomStyleCommands(style);

    if (loading) {
        tr = onLoadRemoveAllMarksExceptOverridden(node, state.schema, startPos, endPos, tr);
    } else {
        // [FS] IRAD-1087 2020-11-02
        // Issue fix: applied link is missing after applying a custom style.
        tr = removeAllMarksExceptLink(startPos, endPos, tr, state.schema);
    }

    const newattrs = Object.assign({}, node.attrs);
    // [FS] IRAD-1074 2020-10-22
    // Issue fix on not removing center alignment when switch style with center
    // alignment to style with left alignment
    newattrs['align'] = null;
    newattrs['lineSpacing'] = null;
    newattrs['paragraphSpacingAfter'] = null;
    newattrs['paragraphSpacingBefore'] = null;

    _commands.forEach((element) => {
        // to set the node attribute for text-align
        if (element instanceof TextAlignCommand) {
            newattrs['align'] = style.align;
            // to set the node attribute for line-height
        } else if (element instanceof TextLineSpacingCommand) {
            // [FS] IRAD-1104 2020-11-13
            // Issue fix : Linespacing Double and Single not applied in the sample text paragrapgh
            newattrs['lineSpacing'] = getLineSpacingValue(style.lineheight);
        } else if (element instanceof ParagraphSpacingCommand) {
            // [FS] IRAD-1100 2020-11-05
            // Add in leading and trailing spacing (before and after a paragraph)
            newattrs['paragraphSpacingAfter'] = style.spaceafter ? style.spaceafter : null;
            newattrs['paragraphSpacingBefore'] = style.spacebefore ? style.spacebefore : null;
        }
        else if (element instanceof IndentCommand) {
            newattrs['indent'] = style.indent;
        }
        // to set the marks for the node
        if (element.executeCustom) {
            tr = element.executeCustom(state, tr, startPos, endPos);
        }
    });

    if (style && style[NUMBERING]) {
        newattrs['styleLevel'] = Number(style.level);
        newattrs['customStyle'] = {
            strong: style[STRONG],
            em: style[EM],
            color: style[COLOR],
            fontSize: style[FONTSIZE],
            fontName: style[FONTNAME],
            strike: style[STRIKE],
            underline: style[UNDERLINE]
        };
    } else {
        newattrs['styleLevel'] = null;
    }
    // to set custom styleName attribute for node
    newattrs['styleName'] = styleName;
    // tr = _setNodeAttribute(node, tr, startPos, endPos, newattrs);

    const selection = TextSelection.create(tr.doc, endPos, endPos - 1);
    tr = tr.setSelection(selection);
    tr = _setNodeAttribute(state, tr, startPos, endPos, newattrs);
    return tr;
}

export function executeCommands(state, tr, styleName, startPos, endPos) {

    const style = getCustomStyleByName(styleName);
    const _commands = getCustomStyleCommands(style);
    _commands.forEach((element) => {
        if (element.executeCustom) {
            tr = element.executeCustom(state, tr, startPos, endPos);
        }
    });
    return tr;
}

// Need to change this function code duplicates with applyStyle()
export function applyLatestStyle(styleName: String, state: EditorState, tr: Transform,
    node: Node, startPos: Number, endPos: Number) {
    return applyStyleEx(null, styleName, state, tr, node, startPos, endPos);
}

function isAllowedNode(node) {
    return (node.type.name === 'paragraph');
}

// [FS] IRAD-1088 2020-10-05
// set custom style for node
function _setNodeAttribute(state: EditorState, tr: Transform, from: Number,
    to: Number, attribute: any) {
    // if (isAllowedNode(node)) {
    //     node.descendants(function (child: Node, pos: number, parent: Node) {
    //         tr = tr.setNodeMarkup(pos, undefined, attribute);

    //     });
    // }
    // return tr;

    state.doc.nodesBetween(from, to, (node, startPos) => {
        if (isAllowedNode(node)) {
            tr = tr.setNodeMarkup(startPos, undefined, attribute);
        }
    });
    return tr;
}

// [FS] IRAD-1087 2020-11-02
// Issue fix: Missing the applied link after applying a style
function removeAllMarksExceptLink(from: Number, to: Number, tr: Transform, schema: Schema) {
    const { doc } = tr;
    const tasks = [];
    doc.nodesBetween(from, to, (node, pos) => {
        if (node.marks && node.marks.length) {
            node.marks.some(mark => {
                if ('link' !== mark.type.name) {
                    tasks.push({
                        node,
                        pos,
                        mark
                    });
                }
            });
            return true;
        }
        return true;
    });
    return handleRemoveMarks(tr, tasks, from, to, schema);
}

function handleRemoveMarks(tr: Transform, tasks: any, from: Number,
    to: Number, schema: Schema) {
    tasks.forEach(job => {
        const { mark } = job;
        tr = tr.removeMark(from, to, mark.type);
    });
    tr = setTextAlign(tr, schema, null);
    return tr;
}

// [FS] IRAD-1087 2020-10-14
// Apply selected styles to document
export function applyStyle(style: any, styleName: String, state: EditorState, tr: Transform) {
    const {
        selection
    } = state;
    const startPos = selection.$from.before(1);
    const endPos = selection.$to.after(1);
    const node = getNode(state, startPos, endPos);
    return applyStyleEx(style, styleName, state, tr, node, startPos, endPos);
}

//to get the selected node
export function getNode(state: EditorState, from: Number, to: Number) {
    let selectedNode = null;
    state.doc.nodesBetween(from, to, (node, startPos) => {
        if (node.type.name === 'paragraph') {
            selectedNode = node;
        }
    });
    return selectedNode;
}
export default CustomStyleCommand;