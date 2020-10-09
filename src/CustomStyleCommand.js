// @flow

import {
  EditorState
} from 'prosemirror-state';
import {
  Transform
} from 'prosemirror-transform';
import {
  EditorView
} from 'prosemirror-view';
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

      case 'text-highlight':
        _commands.push(new TextHighlightCommand(customStyles[property]));
        break;

      case 'underline':
        _commands.push(new MarkToggleCommand('underline'));
        break;

      case 'textalign':
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
      selection,
      tr
    } = state;
    if ('newstyle' === this._customStyle) {
      this.editWindow();
      return false;
    }
   // [FS] IRAD-1053 2020-10-08 
   // to remove the custom styles applied in the selected paragraph
   else if ('clearstyle' === this._customStyle) {
     tr = clearCustomStyleMarks(state.tr.setSelection(state.selection), state.schema);
     if (dispatch && tr.docChanged) { 
      dispatch(tr);
      return true;
    }
    return false;
    }

    // [FS] IRAD-1087 2020-09-29
    // Fix: Iterate the Command Array and chekes the command type and execute the command wrote in each
    // command class.
    // need to check the type check is needed

    const _commands = getTheCustomStylesCommand(this._customStyle[0]);
    const startPos = selection.$from.before(1);
    const endPos = selection.$to.after(1);
    // to remove all applied marks in the selection
    tr = tr.removeMark(startPos, endPos, null);
    let node = this._getNode(state, startPos, endPos);
    const newattrs = Object.assign({}, node.attrs);
    _commands.forEach(element => {
      // to set the node attribute for text-align
      if (element instanceof TextAlignCommand) {
        newattrs['align'] = this._customStyle[0].textalign;
        // to set the node attribute for line-height
      } else if (element instanceof TextLineSpacingCommand) {
        newattrs['lineSpacing'] = this._customStyle[0].lineheight;
      }
      // to set the marks for the node
      else {
        tr = element.executeCustom(state, tr, startPos, endPos);
      }
    });
    // to set custom styleName attribute for node
    newattrs['styleName'] = this._customStyle[0].stylename;
    tr = this._setNodeAttribute(state, tr, startPos, endPos, newattrs);

    if (tr.docChanged || tr.storedMarksSet) {
      dispatch && dispatch(tr);
      return true;
    }
    return false;
  };

  // shows the create style popup
  editWindow() {

    this._popUp = createPopUp(CustomStyleEditor, this.createCustomObject(), {
      autoDismiss: false,
      position: atViewportCenter,
      onClose: val => {
        if (this._popUp) {
          this._popUp = null;
          //handle save style object part here
          console.log(val);
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
      name: 'Test',
      strike: true,
      strong: true,
      em: true,
      super: false,
      underline: false,
      color: 'red',
      fontsize: '14',
      fontname: 'Acme',
      texthighlight: '',
      align: 'center',
      lineheight: '165%',
      numbering: '1.1.1.',
      indent:'2'
    };

  }
}

export default CustomStyleCommand;