// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';

import CustomMenu from './CustomMenu.js';
import CustomMenuItem from './CustomMenuItem.js';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

class CommandMenu extends React.PureComponent<any, any> {
  _activeCommand: ?UICommand = null;

  props: {
    commandGroups: Array<{ [string]: UICommand }>,
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
    onCommand: ?Function,
  };

  render(): React.Element<any> {
    const { commandGroups, editorState, editorView } = this.props;
    const children = [];
    const jj = commandGroups.length - 1;

    commandGroups.forEach((group, ii) => {
      Object.keys(group).forEach((label) => {
        const command = group[label];
        let disabled = true;
        try {
          // Disable the Clear style menu when no styles applied to a paragraph
          disabled =
            !editorView || !command.isEnabled(editorState, editorView, label);
        } catch {
          disabled = false;
        }
        children.push(
          <CustomMenuItem
            active={command.isActive(editorState)}
            disabled={disabled}
            key={label}
            label={command.renderLabel(editorState) || label}
            onClick={this._onUIEnter}
            onMouseEnter={this._onUIEnter}
            value={command}
          />
        );
      });
      if (ii !== jj) {
        children.push(<CustomMenuItem.Separator key={`${String(ii)}-hr`} />);
      }
    });
    return <CustomMenu>{children}</CustomMenu>;
  }

  _onUIEnter = (command: UICommand, event: SyntheticEvent<>): void => {
    if (command.shouldRespondToUIEvent(event)) {
      this._activeCommand && this._activeCommand.cancel();
      this._activeCommand = command;
      this._execute(command, event);
    }
  };

  _execute = (command: UICommand, e: SyntheticEvent<>) => {
    const { dispatch, editorState, editorView, onCommand } = this.props;
    if (command.execute(editorState, dispatch, editorView, e)) {
      onCommand?.();
    }
  };
}

export default CommandMenu;
