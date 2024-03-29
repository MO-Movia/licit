import * as React from 'react';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import uuid from './uuid';
import '../styles/listType.css';
import { Arr } from './commandMenuButton';

// [FS] IRAD-1039 2020-09-24
// UI to show the list buttons

class ListTypeMenu extends React.PureComponent {
  _activeCommand: UICommand = null;
  props: {
    className?: string;
    commandGroups: Array<Arr>;
    disabled?: boolean;
    dispatch: (tr: Transform) => void;
    editorState: EditorState;
    editorView: EditorView;
    onCommand;
    icon?: string | React.ReactElement | null;
    label?: string | React.ReactElement | null;
    title?: string;
  };

  _menu = null;
  _id = uuid();

  state = {
    expanded: false,
  };

  render(): JSX.Element {
    const { commandGroups } = this.props;
    const children = [];

    commandGroups.forEach((group, _ii) => {
      Object.keys(group).forEach((label) => {
        const command = group[label];
        children.push(
          <button
            className="buttonsize"
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
    return <div className="container">{children}</div>;
  }

  _onUIEnter = (command: UICommand, event: React.SyntheticEvent): void => {
    this._activeCommand && this._activeCommand.cancel();
    this._activeCommand = command;
    this._execute(command, event);
  };

  _execute = (command: UICommand, e: React.SyntheticEvent): void => {
    const { dispatch, editorState, editorView, onCommand } = this.props;
    if (command.execute(editorState, dispatch, editorView, e)) {
      onCommand && onCommand();
    }
  };
}

export default ListTypeMenu;
