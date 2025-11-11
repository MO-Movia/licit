// [FS] IRAD-1039 2020-09-23
// Command button to handle different type of list types
// Need to add Icons instead of label

import cx from 'classnames';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { CustomButton, createPopUp,ThemeContext } from '@modusoperandi/licit-ui-commands';
import uuid from './uuid';
import ListTypeMenu from './listTypeMenu';
import '../styles/czi-custom-menu-button.css';
import { Arr } from './commandMenuButton';

type ListTypeButtonType = {
  className?: string;
  commandGroups: Array<any>;
  disabled?: boolean;
  dispatch: (tr: Transform) => void;
  editorState: EditorState;
  editorView: EditorView;
  icon?: string | React.ReactElement | null;
  label?: string | React.ReactElement | null;
  title?: string;
  theme?:string
};
class ListTypeButton extends React.PureComponent<ListTypeButtonType> {
  static contextType = ThemeContext;
 declare  props: ListTypeButtonType;

  _menu = null;
  _id = uuid();

  state = {
    expanded: false,
  };

  render(): React.ReactElement<CustomButton> {
    const { className, label, commandGroups, icon, disabled, title,theme } =
      this.props;
    const enabled =
      !disabled &&
      commandGroups.some((group, _ii) => {
        return Object.keys(group).some((_label) => {
          let disabledVal = true;
          try {
            disabledVal = false;
          } catch (ex) {
            disabledVal = false;
          }
          return !disabledVal;
        });
      });

    const { expanded } = this.state;
    const buttonClassName = cx(className, {
      'czi-custom-menu-button': true,
      expanded,
    });
    // const theme = this.context;
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
