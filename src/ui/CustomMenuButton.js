// @flow
// [FS] IRAD-1039 2020-09-23
// Command button to handle different type of list types
// Need to add Icons instead of label

import cx from 'classnames';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import CustomButton from './CustomButton';
import UICommand from './UICommand';
import createPopUp from './createPopUp';
import uuid from './uuid';
import CustomMenuUI from './CustomMenuUI';
import './custom-dropdown.css';

class CustomMenuButton extends React.PureComponent<any, any> {
  props: {
    className?: ?string,
    commandGroups: Array<{ [string]: UICommand }>,
    staticCommand: Array<{ [string]: UICommand }>,
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
  // _popupId = uuid();

  state = {
    expanded: false,
  };

  render(): React.Element<any> {
    const {
      className,
      label,
      icon,

    } = this.props;
    // const enabled =
    //   !disabled &&
    //   commandGroups.some((group, ii) => {
    //     return Object.keys(group).some(label => {
    //       const command = group[label];
    //       let disabledVal = true;
    //       try {
    //         disabledVal =
    //           !editorView || !command.isEnabled(editorState, editorView);
    //       } catch (ex) {
    //         disabledVal = false;
    //       }
    //       return !disabledVal;
    //     });
    //   });

    const { expanded } = this.state;
    const buttonClassName = cx(className, {
      'czi-custom-menu-button': true,
      expanded,
    });

    return (
      <CustomButton
        className={buttonClassName}
        disabled={false}
        icon={icon}
        id={this._id}
        label={label}
        onClick={this._onClick}
        title={label}
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
      // popupId: this._popupId
    };
    if (menu) {
      menu.update(menuProps);
    } else {
      // const anchor =document.getElementById('mo-submenu');

      this._menu = createPopUp(CustomMenuUI, menuProps, {
        autoDismiss: true,
        // Id: this._popupId,
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

export default CustomMenuButton;
