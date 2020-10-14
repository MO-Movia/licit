// @flow

import {
  EditorState, TextSelection
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
import { clearCustomStyleMarks } from './clearCustomStyleMarks';
import { saveStyle } from './customStyle';
// [FS] IRAD-1042 2020-10-01
// Creates commands based on custom style JSon object
function getTheCustomStylesCommand(customStyles) {
  const _commands = [];
  for (const property in customStyles) {

    switch (property) {
      case 'strong':
        _commands.push(new MarkToggleCommand('strong'));
        break;

      case 'em':
        _commands.push(new MarkToggleCommand('em'));
        break;

      case 'color':
        _commands.push(new TextColorCommand(customStyles[property]));
        break;

      case 'fontsize':
        _commands.push(new FontSizeCommand(Number(customStyles[property])));
        break;

      case 'fontname':
        _commands.push(new FontTypeCommand(customStyles[property]));
        break;

      case 'strike':
        _commands.push(new MarkToggleCommand('strike'));
        break;

      case 'super':
        _commands.push(new MarkToggleCommand('super'));
        break;

      case 'texthighlight':
        _commands.push(new TextHighlightCommand(customStyles[property]));
        break;

      case 'underline':
        _commands.push(new MarkToggleCommand('underline'));
        break;

      case 'align':
        _commands.push(new TextAlignCommand(customStyles[property]));
        break;

      case 'lineheight':
        _commands.push(new TextLineSpacingCommand(customStyles[property]));
        break;

      default:
        break;
    }
  }
  return _commands;
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

  isEnabled = (state: EditorState): boolean => {
    return true;
  };

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

    const { dispatch } = view;
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

  // [FS] IRAD-1088 2020-10-05
  // set custom style for node
  _setNodeAttribute(state: EditorState, tr: Transform,
    from: Number, to: Number, attribute): Transform {

    state.doc.nodesBetween(from, to, (node, startPos) => {
      if (node.type.name === 'paragraph') {
        tr = tr.setNodeMarkup(startPos, undefined, attribute);
      }
    });
    return tr;
  }

  //to get the selected node
  _getNode(state: EditorState, from: Number, to: Number,): Node {
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
      styles: {}
    };

  }

  // [FS] IRAD-1087 2020-10-14
  // Apply selected styles to document
  applyStyle(style, styleName: String, state: EditorState, tr: Transform) {

    const {
      selection
    } = state;

    const _commands = getTheCustomStylesCommand(style);
    const startPos = selection.$from.before(1);
    const endPos = selection.$to.after(1);
    // to remove all applied marks in the selection
    tr = tr.removeMark(startPos, endPos, null);
    const node = this._getNode(state, startPos, endPos);
    const newattrs = Object.assign({}, node.attrs);
    _commands.forEach(element => {
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
    tr = this._setNodeAttribute(state, tr, startPos, endPos, newattrs);
    return tr;
  }

  // locally save style object
  saveStyleObject(style) {
    saveStyle(style);
  }
}

export default CustomStyleCommand;