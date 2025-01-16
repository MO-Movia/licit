import * as React from 'react';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import uuid from './uuid.js';

// [FS] IRAD-1039 2020-09-24
// UI to show the list buttons

class ListTypeMenu extends React.PureComponent<any, any> {
  _activeCommand: ?UICommand = null;
  props: {
    className?: ?string,
    commandGroups: Array<{ [string]: UICommand }>,
    disabled?: ?boolean,
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
    icon?: string | React.Element<any> | null,
    label?: string | React.Element<any> | null,
    title?: ?string,
  };

  _menu = null;
  _id = uuid();

  state = {
    expanded: false,
  };

  render() {
    const { commandGroups } = this.props;
    const children = [];

    commandGroups.forEach((group, ii) => {
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

  _onUIEnter = (command: UICommand, event: SyntheticEvent<*>) => {
    this._activeCommand && this._activeCommand.cancel();
    this._activeCommand = command;
    this._execute(command, event);
  };

  _execute = (command, e) => {
    const { dispatch, editorState, editorView, onCommand } = this.props;
    if (command.execute(editorState, dispatch, editorView, e)) {
      onCommand?.();
    }
  };
}

export default ListTypeMenu;
