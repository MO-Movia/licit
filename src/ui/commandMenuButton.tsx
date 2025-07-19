import cx from 'classnames';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import * as React from 'react';

import CommandMenu from './commandMenu';
import {
  CustomButton,
  createPopUp,
  atAnchorRight,
  ThemeContext
} from '@modusoperandi/licit-ui-commands';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import uuid from './uuid';
import { isExpandButton } from './editorToolbarConfig';
import '../styles/czi-custom-menu-button.css';
import { EditorViewEx } from '../constants';
export interface Arr {
  [key: string]: UICommand;
}
type PropsType = {
  className?: string;
  commandGroups: Array<any>;
  disabled?: boolean;
  dispatch: (tr: Transform) => void;
  editorState: EditorState;
  editorView: EditorViewEx;
  icon?: string | React.ReactElement | null;
  label?: string | React.ReactElement | null;
  title?: string;
  sub?: boolean;
  theme?: string;
};
type StateType = {
  expanded: boolean;
};

class CommandMenuButton extends React.PureComponent<PropsType, StateType> {
  declare props: PropsType;
  static contextType = ThemeContext;
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
      sub,
      theme
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
          } catch (ex) {
            disabledVal = false;
          }
          return !disabledVal;
        });
      });

    const { expanded } = this.state;
    const isMaximizeButton = isExpandButton(title);
    // const theme_1 = this.context;
    const theme_1 = UICommand.theme;
    // const buttonClassName = sub
    //   ? cx(className, {
    //       'czi-custom-submenu-button': true,
    //       expanded,
    //     })
    //   : cx(className, {
    //       'czi-custom-menu-button': true,
    //       expanded,
    //     });

    // let className = 'czi-custom-menu-item ' + theme;

    const buttonClassName = cx(className, {
      'czi-custom-menu-button': true,
      'menu-expand-btn': isMaximizeButton,
      expanded,
    });

    return (
      <CustomButton
        className={buttonClassName}
        disabled={!enabled}
        hasChild={(hasChild && !isMaximizeButton)}
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
    expanded ? this._showMenu() : this._hideMenu();
  };

  _hideMenu = (): void => {
    const menu = this._menu;
    this._menu = null;
    menu && menu.close();
    // alert('hello seybi');
  };

  _showMenu = (): void => {
    const menu = this._menu;
    const menuProps = {
      ...this.props,
      onCommand: this._onCommand,
      theme: UICommand.theme
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
