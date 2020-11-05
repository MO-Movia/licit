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
import {
    Node
} from 'prosemirror-model';
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
import {
    clearCustomStyleMarks
} from './clearCustomStyleMarks';
import {
    saveStyle,
    getCustomStyleByName
} from './customStyle';

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

// [FS] IRAD-1042 2020-10-01
// Creates commands based on custom style JSon object
export function getCustomStyleCommands(customStyle) {
    const commands = [];
    for (const property in customStyle) {

        switch (property) {
            case STRONG:
                // [FS] IRAD-1043 2020-10-23
                // Issue fix : unselect a style when creating a new style
                // and that unselected styles also applied in selected paragrapgh
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
                    _commands.push(new MarkToggleCommand('strike'));
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
        dispatch: ? (tr: Transform) => void,
        view : ? EditorView
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
            tr = clearCustomStyleMarks(state.tr.setSelection(selection), state.schema);
            if (dispatch && tr.docChanged) {
                dispatch(tr);
                return true;
            }
            return false;
        }

        tr = this.applyStyle(this._customStyle.styles, this._customStyle.stylename, state, tr);

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
                        tr = this.applyStyle(val.styles, val.stylename, state, tr);
                        dispatch(tr);
                        view.focus();
                    }
                }
            },
        });
    }



    //to get the selected node
    _getNode(state: EditorState, from: Number, to: Number): Node {
        let selectedNode = null;
        state.doc.nodesBetween(from, to, (node, startPos) => {
            if (node.type.name === 'paragraph') {
                selectedNode = node;
            }
        });
        return selectedNode;
    }

    // creates a sample style object
    createCustomObject() {
        return {
            stylename: '',
            styles: {},
        };

    }

    // [FS] IRAD-1087 2020-10-14
    // Apply selected styles to document
    applyStyle(style, styleName: String, state: EditorState, tr: Transform) {
        const {
            selection
        } = state;

        const startPos = selection.$from.before(1);
        const endPos = selection.$to.after(1);
        const node = this._getNode(state, startPos, endPos);

        return applyStyleEx(style, styleName, state, tr, node, startPos, endPos);
    }

    // locally save style object
    saveStyleObject(style) {
        saveStyle(style);
    }
}

function retainOverrideStyle(style, tr, node, startPos, endPos) {
	//node.content.content[0].marks[0].type.name
	
	for (const property in style) {

        switch (property) {
            case STRONG:
                //if (style[property])
                break;

            case EM:
                break;

            case COLOR:
                break;

            case FONTSIZE:
                break;

            case FONTNAME:
                break;

            case STRIKE:
                break;

            case SUPER:
                break;

            case TEXTHL:
                break;

            case UNDERLINE:
                break;

            case ALIGN:
                break;

            case LHEIGHT:
                break;

            default:
                break;
        }
    }
	
	return tr;
}

function applyStyleEx(style, styleName: String, state: EditorState, tr: Transform, node, startPos, endPos) {
    const loading = !style;
    if (loading) {
        style = getCustomStyleByName(styleName);
    }
    const _commands = getCustomStyleCommands(style);

	//if (loading) {		
		tr = retainOverrideStyle(style, tr, node, startPos, endPos);
	//} else {
		// to remove all applied marks in the selection
		tr = tr.removeMark(startPos, endPos, null);		
	//}

    const newattrs = Object.assign({}, node.attrs);
    // [FS] IRAD-1074 2020-10-22
    // Issue fix on not removing center alignment when switch style with center
    // alignment to style with left alignment
    newattrs['align'] = null;
    newattrs['lineSpacing'] = null;

    _commands.forEach((element) => {
        // to set the node attribute for text-align
        if (element instanceof TextAlignCommand) {
            newattrs['align'] = style.align;
            // to set the node attribute for line-height
        } else if (element instanceof TextLineSpacingCommand) {
            newattrs['lineSpacing'] = style.lineheight;
        }
        // to set the marks for the node
        else {
            tr = element.executeCustom(state, tr, startPos, endPos);
        }
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
// [FS] IRAD-1088 2020-10-05
// set custom style for node
function _setNodeAttribute(state, tr, from, to, attribute) {
    state.doc.nodesBetween(from, to, (node, startPos) => {
        if (node.type.name === 'paragraph') {
            tr = tr.setNodeMarkup(startPos, undefined, attribute);
        }
    });
    return tr;
}
export default CustomStyleCommand;