// @flow

import CustomMenuButton from './CustomMenuButton';
import HeadingCommand from '../HeadingCommand';
import CustomStyleCommand from '../CustomStyleCommand';
import * as React from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { HEADING_NAME_DEFAULT } from './findActiveHeading';
import { Transform } from 'prosemirror-transform';
import { getCustomStyles } from '../customStyle';

// [FS] IRAD-1042 2020-09-09
// To include custom styles in the toolbar

let HEADING_COMMANDS: Object = {
  [HEADING_NAME_DEFAULT]: new HeadingCommand(0),
};

class HeadingCommandMenuButton extends React.PureComponent<any, any> {
  props: {
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
  };

  //[FS] IRAD-1085 2020-10-09
  //method to build commands for list buttons
  getCommandGroups() {
    //get custom styles from local storage
    // let HEADING_COMMANDS = this.clearCommands();
    const HEADING_NAMES = getCustomStyles();
    HEADING_COMMANDS = null;
    HEADING_COMMANDS = {
      [HEADING_NAME_DEFAULT]: new HeadingCommand(0),
    };
    HEADING_NAMES.forEach(obj => {
      HEADING_COMMANDS[obj.stylename] = new CustomStyleCommand(obj, obj.stylename);

    });
    return [HEADING_COMMANDS];
  }
  staticCommands() {
    const MENU_COMMANDS: Object = {
      ['newstyle']: new CustomStyleCommand('newstyle', 'New Style..')
    };
    MENU_COMMANDS['clearstyle'] = new CustomStyleCommand('clearstyle', 'Clear Style');
    return [MENU_COMMANDS];
  }
  isAllowedNode(node) {
    return (node.type.name === 'paragraph' || node.type.name === 'ordered_list');
  }
  render(): React.Element<any> {

    const { dispatch, editorState, editorView } = this.props;
    const { selection, doc } = editorState;
    const { from, to } = selection;
    let customStyleName;
    let selectedStyleCount = 0;
    // [FS] IRAD-1088 2020-10-05
    // get the custom style name from node attribute
    doc.nodesBetween(from, to, (node, pos) => {
      if (node.attrs.styleName && this.isAllowedNode(node)) {
        // [FS] IRAD-1043 2020-10-27
        // Show blank as style name when select paragrapghs with multiple custom styles applied
        selectedStyleCount++;
        // [FS] IRAD-1100 2020-10-30
        // Issue fix: style name shows blank when select multiple paragraph with same custom style applied
        if (1 === selectedStyleCount || (1 < selectedStyleCount && node.attrs.styleName === customStyleName)) {
          customStyleName = node.attrs.styleName;
        }
      }
    });

    return (
      <CustomMenuButton
        className="width-100"
        // [FS] IRAD-1008 2020-07-16
        // Disable font type menu on editor disable state
        commandGroups={this.getCommandGroups()}
        disabled={editorView && editorView.disabled ? true : false}
        dispatch={dispatch}
        editorState={editorState}
        editorView={editorView}
        label={customStyleName}
        parent={this}
        staticCommand={this.staticCommands()}
      />
    );
  }
}

export default HeadingCommandMenuButton;
