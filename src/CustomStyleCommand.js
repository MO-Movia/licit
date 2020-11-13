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
import { Node } from 'prosemirror-model';
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
import ListToggleCommand from './ListToggleCommand';
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
import {getLineSpacingValue} from './ui/toCSSLineSpacing';

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

// [FS] IRAD-1042 2020-10-01
// Creates commands based on custom style JSon object
export function getCustomStyleCommands(customStyle) {
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
            case NUMBERING:
                commands.push(new ListToggleCommand(true, 'x.x.x'));
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
    isCustomStyleApplied(editorState) {
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
        else if ('clearstyle' === this._customStyle) {
            tr = clearCustomStyleMarks(state.tr.setSelection(selection), state.schema, state);
            if (dispatch && tr.docChanged) {
                dispatch(tr);
                return true;
            }
            return false;
        }

        tr = applyStyle(this._customStyle.styles, this._customStyle.stylename, state, tr);

        if (tr.docChanged || tr.storedMarksSet) {
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
                        console.log(val);
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
    saveStyleObject(style) {
        saveStyle(style);
    }
}

function compareMarkWithStyle(mark, style, tr, startPos, endPos, retObj) {
    let same = false;
    let overridden = false;

    switch (mark.type.name) {
        case MARK_STRONG:
            same = style[STRONG];
            break;
        case MARK_EM:
            same = style[EM];
            break;
        case MARK_TEXT_COLOR:
            same = mark.attrs['color'] == style[COLOR];
            break;
        case MARK_FONT_SIZE:
            same = mark.attrs['pt'] == style[FONTSIZE];
            break;
        case MARK_FONT_TYPE:
            break;
        case MARK_STRIKE:
            break;
        case MARK_SUPER:
            break;
        case MARK_TEXT_HIGHLIGHT:
            break;
        case MARK_UNDERLINE:
            break;
        default:
            break;
    }

    overridden = !same;

    if (mark.attrs[ATTR_OVERRIDDEN] != overridden) {
        mark.attrs[ATTR_OVERRIDDEN] = overridden;

        tr = tr.removeMark(startPos, endPos, mark);
        tr = tr.addMark(startPos, endPos, mark);
        retObj.modified = true;
    }
    /*
    case FONTNAME:
    case STRIKE:
    case SUPER:
    case TEXTHL:
    case UNDERLINE:
    case ALIGN:
    case LHEIGHT:*/

    return tr;
}

export function updateOverrideFlag(styleName, tr, node, startPos, endPos, retObj) {
    const style = getCustomStyleByName(styleName);
    node.descendants(function (child: Node, pos: number, parent: Node) {
        if (child instanceof Node) {
            child.marks.forEach(function (mark, index) {
                tr = compareMarkWithStyle(mark, style, tr, startPos, endPos, retObj);
            });
        }
    });

    return tr;
}

function applyStyleEx(style, styleName: String, state: EditorState, tr: Transform, node, startPos, endPos) {
    const loading = !style;
    if (loading) {
        style = getCustomStyleByName(styleName);
    }
    const _commands = getCustomStyleCommands(style);

    // [FS] IRAD-1087 2020-11-02
    // Issue fix: applied link is missing after applying a custom style.
    tr = removeAllMarksExceptLink(startPos, endPos, tr, state.schema, loading ? exceptOverridden : exceptLink);

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
        else if (element instanceof ListToggleCommand) {
            newattrs['indent'] = 0;
        }
        // to set the marks for the node
       
            tr = element.executeCustom(state, tr, startPos, endPos);
        
    });

    // to set custom styleName attribute for node
    newattrs['styleName'] = styleName;
    tr = _setNodeAttribute(state, tr, startPos, endPos, newattrs);
    return tr;
}

// Need to change this function code duplicates with applyStyle()
export function applyLatestStyle(styleName: String, state: EditorState, tr: Transform, node, startPos, endPos) {
    return applyStyleEx(null, styleName, state, tr, node, startPos, endPos);
}

function isAllowedNode(node) {
    return (node.type.name === 'paragraph');
}

// [FS] IRAD-1088 2020-10-05
// set custom style for node
function _setNodeAttribute(state, tr, from, to, attribute) {
    state.doc.nodesBetween(from, to, (node, startPos) => {
        if (isAllowedNode(node)) {
            tr = tr.setNodeMarkup(startPos, undefined, attribute);
        }
    });
    return tr;
}

function exceptLink(mark) {
	return ('link' !== mark.type.name);
}

function exceptOverridden(mark) {
	return !mark.attrs[ATTR_OVERRIDDEN];
}

// [FS] IRAD-1087 2020-11-02
// Issue fix: Missing the applied link after applying a style
function removeAllMarksExceptLink(from, to, tr, schema, callback) {
    const { doc } = tr;
    const tasks = [];
    doc.nodesBetween(from, to, (node, pos) => {
        if (node.marks && node.marks.length) {
            node.marks.some(mark => {
                if (callback(mark)) {
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
    tasks.forEach(job => {
        const { mark } = job;
        tr = tr.removeMark(from, to, mark.type);
    });
    tr = setTextAlign(tr, schema, null);
    return tr;
}

// [FS] IRAD-1087 2020-10-14
// Apply selected styles to document
export function applyStyle(style, styleName, state, tr) {
    const {
        selection
    } = state;
    const startPos = selection.$from.before(1);
    const endPos = selection.$to.after(1);
    const node = getNode(state, startPos, endPos);
    return applyStyleEx(style, styleName, state, tr, node, startPos, endPos);
}

//to get the selected node
export function getNode(state, from, to) {
    let selectedNode = null;
    state.doc.nodesBetween(from, to, (node, startPos) => {
        if (node.type.name === 'paragraph') {
            selectedNode = node;
        }
    });
    return selectedNode;
}
export default CustomStyleCommand;