// @flow

import './czi-custom-menu-item.css';
import {
  CustomButton,
  TextAlignCommand,
  ThemeContext,
} from '@modusoperandi/licit-ui-commands';
import * as React from 'react';

class CustomMenuItemSeparator extends React.PureComponent<any, any> {
  render(): React.Element<any> {
    return <div className="czi-custom-menu-item-separator" />;
  }
}

class CustomMenuItem extends React.PureComponent<any, any> {
  static Separator = CustomMenuItemSeparator;
  static contextType = ThemeContext;
  props: {
    label: string,
    icon?: string | React.Element<any> | null,
    disabled?: ?boolean,
    onClick: ?(value: any, e: SyntheticEvent<>) => void,
    onMouseEnter: ?(value: any, e: SyntheticEvent<>) => void,
    value: any,
  };

  render(): React.Element<any> {
    // [FS] IRAD-1044 2020-09-22
    // Added a new class to adjust the width of the custom style menu dropdown.

    const theme = this.context;

    let className = 'czi-custom-menu-item ' + theme;
    if (this.props.value instanceof TextAlignCommand) {
      className = 'czi-custom-menu-item-button ' + theme;
    }
    if (this.props.value._customStyleName) {
      className += ' custom-style-menu-item';
    }
    return <CustomButton {...this.props} className={className} />;
  }
}

export default CustomMenuItem;
