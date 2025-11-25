/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import cx from 'classnames';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import * as React from 'react';

import {CustomButton, ThemeContext} from '@modusoperandi/licit-ui-commands';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {EditorRuntime} from '../types';
export type CommandButtonProps = {
  className?: string;
  command: UICommand;
  disabled?: boolean;
  dispatch: (tr: Transform) => void;
  editorState: EditorState;
  editorView: EditorView & EditorRuntime;
  icon?: string | React.ReactElement;
  label?: string | React.ReactElement;
  title?: string;
  sub?: boolean;
};
class CommandButton extends React.PureComponent<CommandButtonProps> {
  public static readonly contextType = ThemeContext;
  declare context: React.ContextType<typeof ThemeContext>;
  declare props: CommandButtonProps;

  render(): React.ReactElement<CustomButton> {
    const {
      label,
      className,
      command,
      editorState,
      icon,
      title,
      editorView,
      sub,
    } = this.props;
    let disabled = this.props.disabled;
    const theme: string = this.context;
    if (!!disabled === false) {
      disabled = !editorView || !command.isEnabled(editorState, editorView);
    }
    UICommand.theme = theme.toString();
    const buttonClassName = sub
      ? cx(className, {
          'czi-custom-submenu-button': true,
        })
      : className;
    return (
      <CustomButton
        active={command.isActive(editorState)}
        className={buttonClassName}
        disabled={disabled}
        icon={icon}
        label={label}
        onClick={this._onUIEnter}
        onMouseEnter={this._onUIEnter}
        theme={theme ? theme.toString() : 'dark'}
        title={title}
        value={command}
      />
    );
  }

  _onUIEnter = (
    command: UICommand,
    event: React.SyntheticEvent<HTMLButtonElement>
  ): void => {
    if (command.shouldRespondToUIEvent(event)) {
      this._execute(command, event);
    }
  };

  _execute = (
    _value: UICommand,
    event: React.SyntheticEvent<HTMLButtonElement>
  ): void => {
    const {command, editorState, dispatch, editorView} = this.props;
    command.execute(editorState, dispatch, editorView, event);
  };
}

export default CommandButton;
