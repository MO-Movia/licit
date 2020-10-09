// @flow

import CommandMenuButton from './CommandMenuButton';
import HeadingCommand from '../HeadingCommand';
import CustomStyleCommand from '../CustomStyleCommand';
import * as React from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
// import { HEADING_NAMES } from '../HeadingNodeSpec';
import { HEADING_NAME_DEFAULT } from './findActiveHeading';
import { Transform } from 'prosemirror-transform';
import { getCustomStyles } from '../customStyle';

// [FS] IRAD-1042 2020-09-09
// To include custom styles in the toolbar

const HEADING_COMMANDS: Object = {
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
    const HEADING_NAMES = getCustomStyles();
    HEADING_NAMES.forEach(obj => {
      // This code is added to save the styles to localstorage for testing the functionality
      // remove the below code once the create customs style UI is implemented.
      // localStorage.setItem(obj.name, JSON.stringify(obj.customstyles));
      HEADING_COMMANDS[obj.stylename] = new CustomStyleCommand(obj.styles, obj.stylename);

    });

    HEADING_COMMANDS['newstyle'] = new CustomStyleCommand('newstyle', 'New Style..');
    HEADING_COMMANDS['clearstyle'] = new CustomStyleCommand('clearstyle', 'Clear Style');

    // const COMMAND_GROUPS = [HEADING_COMMANDS];

    return [HEADING_COMMANDS];
  }
  render(): React.Element<any> {

    const { dispatch, editorState, editorView } = this.props;
    const { selection, doc } = editorState;
    const { from, to } = selection;
    let customStyleName;
    // [FS] IRAD-1088 2020-10-05
    // get the custom style name from node attribute
    doc.nodesBetween(from, to, (node, pos) => {
      if (node.attrs.styleName) {
        customStyleName = node.attrs.styleName;
      }
    });

    return (
      <CommandMenuButton
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
      />
    );
  }
}

export default HeadingCommandMenuButton;
