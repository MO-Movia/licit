/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import uuid from './uuid';
import '../styles/listType.css';

// [FS] IRAD-1039 2020-09-24
// UI to show the list buttons

class ListTypeMenu extends React.PureComponent {
  _activeCommand: UICommand = null;
  declare props: {
    className?: string;
    commandGroups: Array<UICommand>;
    disabled?: boolean;
    dispatch: (tr: Transform) => void;
    editorState: EditorState;
    editorView: EditorView;
    onCommand;
    icon?: string | React.ReactElement;
    label?: string | React.ReactElement;
    title?: string;
    theme?: string;
  };

  _menu = null;
  _id = uuid();

  state = {
    expanded: false,
  };

  render(): JSX.Element {
    const {commandGroups} = this.props;
    const children = [];
    const theme = this.props.theme;
    const className = 'buttonsize ' + theme;
    const cont_classname = 'ol-container ' + theme;
    commandGroups.forEach((group, _ii) => {
      Object.keys(group).forEach((label) => {
        const command = group[label];
        children.push(
          <button
            className={className}
            id={label}
            key={label}
            onClick={(e) => this._onUIEnter(command, e)}
            value={command}
          >
            {command.label}
          </button>
        );
      });
    });
    return <div className={cont_classname}>{children}</div>;
  }

  _onUIEnter = (command: UICommand, event: React.SyntheticEvent): void => {
    this._activeCommand?.cancel();
    this._activeCommand = command;
    this._execute(command, event);
  };

  _execute = (command: UICommand, e: React.SyntheticEvent): void => {
    const {dispatch, editorState, editorView, onCommand} = this.props;
    if (command.execute(editorState, dispatch, editorView, e)) {
      onCommand?.();
    }
  };
}

export default ListTypeMenu;
