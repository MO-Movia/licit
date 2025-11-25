/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import cx from 'classnames';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import * as React from 'react';
import {
  CustomButton,
  createPopUp,
  ThemeContext,
} from '@modusoperandi/licit-ui-commands';
import uuid from './uuid';
import ListTypeMenu from './listTypeMenu';
import '../styles/czi-custom-menu-button.css';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';

type ListTypeButtonType = {
  className?: string;
  commandGroups: Array<UICommand>;
  disabled?: boolean;
  dispatch: (tr: Transform) => void;
  editorState: EditorState;
  editorView: EditorView;
  icon?: string | React.ReactElement;
  label?: string | React.ReactElement;
  title?: string;
  theme?: string;
};
class ListTypeButton extends React.PureComponent<ListTypeButtonType> {
  public static readonly contextType = ThemeContext;
  declare props: ListTypeButtonType;

  _menu = null;
  _id = uuid();

  state = {
    expanded: false,
  };

  render(): React.ReactElement<CustomButton> {
    const {className, label, commandGroups, icon, disabled, title, theme} =
      this.props;
    const enabled =
      !disabled &&
      commandGroups.some((group, _ii) => {
        return Object.keys(group).some((_label) => {
          const disabledVal = false;
          return !disabledVal;
        });
      });

    const {expanded} = this.state;
    const buttonClassName = cx(className, {
      'czi-custom-menu-button': true,
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
        theme={theme}
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
    };
    if (menu) {
      menu.update(menuProps);
    } else {
      this._menu = createPopUp(ListTypeMenu, menuProps, {
        anchor: document.getElementById(this._id),
        onClose: this._onClose,
      });
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

export default ListTypeButton;
