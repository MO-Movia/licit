/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import * as React from 'react';

import CustomMenu from './customMenu';
import CustomMenuItem from './customMenuItem';
import {parseLabel, isExpandButton} from './editorToolbarConfig';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import CommandMenuButton, {Arr} from './commandMenuButton';

type PropsType = {
  commandGroups: Array<Arr>;
  dispatch: (tr: Transform) => void;
  editorState: EditorState;
  editorView?: EditorView;
  onCommand?: () => void;
  title?: string;
  theme?: string;
};
class CommandMenu extends React.PureComponent<PropsType> {
  // static contextType = ThemeContext;
  _activeCommand?: UICommand = null;

  declare props: PropsType;

  render(): React.ReactElement {
    const {commandGroups, editorState, title, theme} = this.props;
    const children = [];
    const jj = commandGroups.length - 1;
    commandGroups.forEach((group, ii) => {
      Object.keys(group).forEach((label) => {
        const command = group[label];
        if (command instanceof UICommand) {
          const {icon} = parseLabel(label, theme.toString());
          children.push(
            this._renderCustomMenuItem(label, command, editorState, icon, theme)
          );
        } else if (Array.isArray(command)) {
          children.push(this._renderMenuButton(label, command, theme));
        }
      });
      if (ii !== jj) {
        children.push(<CustomMenuItem.Separator key={`${String(ii)}-hr`} />);
      }
    });
    return (
      <CustomMenu theme={theme} isHorizontal={isExpandButton(title)}>
        {children}
      </CustomMenu>
    );
  }

  _renderCustomMenuItem = (
    label: string,
    command: UICommand,
    editorState: EditorState,
    icon: string | React.ReactElement,
    theme: string
  ): React.ReactElement<CustomMenuItem> => {
    return (
      <CustomMenuItem
        active={command.isActive(editorState)}
        disabled={!command.isEnabled(editorState)}
        icon={icon}
        key={label}
        // label={icon ? null : (command.renderLabel(editorState) || label)}
        label={
          icon
            ? null
            : (command.renderLabel(editorState) as
                | string
                | React.ReactElement) || label
        }
        onClick={this._onUIEnter}
        onMouseEnter={this._onUIEnter}
        value={command}
        theme={theme}
      />
    );
  };

  _renderMenuButton = (
    label: string,
    commandGroups: Array<Arr>,
    theme: string
  ): React.ReactElement<CommandMenuButton> => {
    const {editorState, editorView, dispatch} = this.props;
    const {icon, title} = parseLabel(label, theme);
    let isDropdown = false;
    if (commandGroups && commandGroups.length > 0) {
      isDropdown = commandGroups[0] instanceof UICommand;
    }

    return (
      <CommandMenuButton
        commandGroups={commandGroups}
        disabled={false}
        dispatch={dispatch}
        editorState={editorState}
        editorView={editorView}
        icon={icon}
        key={label}
        label={icon ? null : title}
        sub={isDropdown ? false : true}
        title={title}
      />
    );
  };

  _onUIEnter = (command: UICommand, event: React.SyntheticEvent): void => {
    if (command.shouldRespondToUIEvent(event)) {
      this._activeCommand?.cancel();
      this._activeCommand = command;
      this._execute(command, event);
    }
  };

  _execute = (command: UICommand, e: React.SyntheticEvent): void => {
    const {dispatch, editorState, editorView, onCommand} = this.props;
    if (command.execute(editorState, dispatch, editorView, e)) {
      onCommand?.();
    }
  };
}

export default CommandMenu;
