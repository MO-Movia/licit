// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { findParentNodeOfType } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';
import { HEADING } from './NodeNames';
import noop from './noop';
import UICommand from './ui/UICommand';
import { atViewportCenter } from './ui/PopUpPosition';
import createPopUp from './ui/createPopUp';
import CustomStyleEditor from './ui/CustomStyleEditor';
import MarkToggleCommand from './MarkToggleCommand';
import TextColorCommand from './TextColorCommand';
import TextHighlightCommand from './TextHighlightCommand';
import TextAlignCommand from './TextAlignCommand';
import FontTypeCommand from './FontTypeCommand';
import FontSizeCommand from './FontSizeCommand';

// [FS] IRAD-1042 2020-10-01
// Creates commands based on custom style JSon object
function getTheCustomStylesCommand(customStyles) {
  const _commands = [];
  const propval = null;
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
      case 'align':

        _commands.push(new TextAlignCommand(customStyles[property]));
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
    let { schema, selection, tr } = state;
    if ('newstyle' === this._customStyle) {
      this._editWindow();
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

    _commands.forEach(element => {
      if (element instanceof MarkToggleCommand) {
        tr = element.executeCustom(state, tr);
      }
      else {
        tr = element.executeCustom(state, tr);
      }
    });

    if (tr.docChanged || tr.storedMarksSet) {
      // If selection is empty, the color is added to `storedMarks`, which
      // works like `toggleMark`
      // (see https://prosemirror.net/docs/ref/#commands.toggleMark).
      dispatch && dispatch(tr);
      return true;
    }
    return false;
  };

  _findHeading(state: EditorState): ?Object {
    const heading = state.schema.nodes[HEADING];
    const fn = heading ? findParentNodeOfType(heading) : noop;
    return fn(state.selection);
  }

  _editWindow() {

    const anchor = null;
    this._popUp = createPopUp(CustomStyleEditor, null, {
      anchor,
      position: atViewportCenter,
      onClose: val => {
        if (this._popUp) {
          this._popUp = null;

        }
      },
    });
  }
}


export default CustomStyleCommand;
