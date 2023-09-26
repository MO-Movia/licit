// @flow

import cx from 'classnames';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';

import CommandMenu from './CommandMenu';
import { CustomButton } from '@modusoperandi/licit-ui-commands';
import { createPopUp } from '@modusoperandi/licit-ui-commands';
import uuid from './uuid';
import { isExpandButton } from './EditorToolbarConfig';
import {ThemeContext} from "./contextProvider";

import './czi-custom-menu-button.css';

class CommandMenuButton extends React.PureComponent<any, any> {
  static contextType = ThemeContext;
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
    parent?: ?React.Element<any>, // the parent command button
  };

  _menu = null;
  _id = uuid();

  state = {
    expanded: false,
  };

  render(): React.Element<any> {
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
      commandGroups.some((group, ii) => {
        return Object.keys(group).some((label) => {
          hasChild = true;
          const command = group[label];
          let disabledVal = true;
          try {
            disabledVal =
              !editorView || !command.isEnabled(editorState, editorView, label);
          } catch (ex) {
            disabledVal = false;
          }
          return !disabledVal;
        });
      });

    const { expanded } = this.state;
    const isMaximizeButton = isExpandButton(title);
    const theme = this.context;
    const buttonClassName = cx(className, {
      'czi-custom-menu-button': true,
      'menu-expand-btn': isMaximizeButton,
      expanded,
    });

    return (
      <CustomButton
        className={buttonClassName}
        disabled={!enabled}
        icon={icon}
        id={this._id}
        label={label}
        onClick={this._onClick}
        title={title}
        hasChild={(hasChild && !isMaximizeButton)}
        theme={theme}
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
    expanded ? this._showMenu() : this._hideMenu();
  };

  _hideMenu = (): void => {
    const menu = this._menu;
    this._menu = null;
    menu && menu.close();
  };

  _showMenu = (): void => {
    const menu = this._menu;
    const menuProps = {
      ...this.props,
      onCommand: this._onCommand,
    };
    if (menu) {
      menu.update(menuProps);
    } else {
      this._menu = createPopUp(CommandMenu, menuProps, {
        anchor: document.getElementById(this._id),
        onClose: this._onClose,
      });
    }
  };

  _onCommand = (): void => {
    this.setState({ expanded: false });
    this._hideMenu();
  };

  _onClose = (): void => {
    if (this._menu) {
      this.setState({ expanded: false });
      this._menu = null;
    }
  };
}

export default CommandMenuButton;
