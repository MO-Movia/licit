// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';

import CustomMenu from './CustomMenu';
import CustomMenuItem from './CustomMenuItem';
import { parseLabel, isExpandButton } from './EditorToolbarConfig';
import { ThemeContext } from '@modusoperandi/licit-ui-commands';

class CommandMenu extends React.PureComponent<any, any> {
  static contextType = ThemeContext;
  _activeCommand: ?UICommand = null;

  props: {
    commandGroups: Array<{ [string]: UICommand }>,
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
    onCommand: ?Function,
  };

  render(): React.Element<any> {
    const { commandGroups, editorState, editorView, title } = this.props;
    const children = [];
    const jj = commandGroups.length - 1;

    commandGroups.forEach((group, ii) => {
      Object.keys(group).forEach((label) => {
        const command = group[label];
        const { icon } = parseLabel(label, this.context);
        let disabled = true;
        try {
          // [FS] IRAD-1053 2020-10-22
          // Disable the Clear style menu when no styles applied to a paragraph
          disabled =
            !editorView || !command.isEnabled(editorState, editorView, label);
        } catch (ex) {
          disabled = false;
        }
        children.push(
          <CustomMenuItem
            active={command.isActive(editorState)}
            disabled={disabled}
            key={label}
            icon={icon}
            label={icon ? null : (command.renderLabel(editorState) || label)}
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
    return <CustomMenu isHorizontal={isExpandButton(title)}>{children}</CustomMenu>;
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
      onCommand && onCommand();
    }
  };
}

export default CommandMenu;
