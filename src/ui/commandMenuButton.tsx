/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import cx from 'classnames';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import * as React from 'react';

import CommandMenu from './commandMenu';
import {
  CustomButton,
  createPopUp,
  atAnchorRight,
  ThemeContext,
} from '@modusoperandi/licit-ui-commands';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import uuid from './uuid';
import {isExpandButton} from './editorToolbarConfig';
import {EditorViewEx} from '../constants';
export interface Arr {
  [key: string]: UICommand;
}
type PropsType = {
  className?: string;
  commandGroups: Array<unknown>;
  disabled?: boolean;
  dispatch: (tr: Transform) => void;
  editorState: EditorState;
  editorView: EditorViewEx;
  icon?: string | React.ReactElement;
  label?: string | React.ReactElement;
  title?: string;
  sub?: boolean;
};
type StateType = {
  expanded: boolean;
};

class CommandMenuButton extends React.PureComponent<PropsType, StateType> {
  declare props: PropsType;
  public static readonly contextType = ThemeContext;
  _menu = null;
  _id = uuid();

  state = {
    expanded: false,
  };

  render(): React.ReactElement<CustomButton> {
    let hasChild = false;
    const {
      className,
      label,
      commandGroups,
      editorState,
      editorView,
      icon,
      disabled,
      title,
    } = this.props;
    const enabled =
      !disabled &&
      commandGroups.some((group) => {
        return Object.keys(group).some((grpLabel) => {
          hasChild = true;
          const command = group[grpLabel];
          let disabledVal = true;
          try {
            disabledVal =
              !editorView ||
              !command.isEnabled(editorState, editorView, grpLabel);
          } catch (_error) {
            console.error('Error checking if command is enabled:', _error);
            disabledVal = false;
          }
          return !disabledVal;
        });
      });

    const {expanded} = this.state;
    const isMaximizeButton = isExpandButton(title);
    const theme_1 = UICommand.theme;
    const buttonClassName = cx(className, {
      'czi-custom-menu-button': true,
      'menu-expand-btn': isMaximizeButton,
      expanded,
    });

    return (
      <CustomButton
        className={buttonClassName}
        disabled={!enabled}
        hasChild={hasChild && !isMaximizeButton}
        icon={icon}
        id={this._id}
        label={label}
        onClick={this._onClick}
        theme={theme_1.toString()}
        title={title}
      />
    );
  }

  componentWillUnmount(): void {
    this._hideMenu();
  }

  _onClick = (): void => {
    const expanded = !this.state.expanded;
    this.setState({
      expanded,
    });
    if (expanded) {
      this._showMenu();
    } else {
      this._hideMenu();
    }
  };

  _hideMenu = (): void => {
    const menu = this._menu;
    this._menu = null;
    menu?.close();
  };

  _showMenu = (): void => {
    const menu = this._menu;
    const menuProps = {
      ...this.props,
      onCommand: this._onCommand,
      theme: UICommand.theme,
    };
    if (menu) {
      menu.update(menuProps);
    } else {
      let hasPopupId = false;
      if (menuProps.commandGroups[0]['Insert Table...']) {
        hasPopupId = true;
      }
      const popUpProps = {
        anchor: document.getElementById(this._id),
        onClose: this._onClose,
        IsChildDialog: true,
        autoDismiss: true,
        popUpId: menuProps.commandGroups[0]['Single']
          ? 'mo-menuList-1'
          : 'mo-menuList',
      };
      if (hasPopupId) {
        popUpProps.popUpId = null;
      }
      if (this.props.sub) {
        popUpProps['position'] = atAnchorRight;
      }
      this._menu = createPopUp(CommandMenu, menuProps, popUpProps);
    }
  };

  _onCommand = (): void => {
    this.setState({expanded: false});
    this._hideMenu();
  };

  _onClose = (): void => {
    if (this._menu) {
      this.setState({expanded: false});
      this._menu = null;
    }
  };
}

export default CommandMenuButton;
