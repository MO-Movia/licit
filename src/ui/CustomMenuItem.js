// @flow

import './czi-custom-menu-item.css';
import CustomButton from './CustomButton';
import * as React from 'react';

class CustomMenuItemSeparator extends React.PureComponent<any, any> {
  render(): React.Element<any> {
    return <div className="czi-custom-menu-item-separator" />;
  }
}

class CustomMenuItem extends React.PureComponent<any, any> {
  static Separator = CustomMenuItemSeparator;

  props: {
    label: string,
    disabled?: ?boolean,
    onClick: ?(value: any, e: SyntheticEvent<>) => void,
    onMouseEnter: ?(value: any, e: SyntheticEvent<>) => void,
    value: any,
  };

  render(): React.Element<any> {
    // [FS] IRAD-1044 2020-09-22
    // Added a new class to adjust the width of the custom style menu dropdown.

    let className = 'czi-custom-menu-item';
    if (this.props.value._customStyleName) {
      className += ' custom-style-menu-item';
    }
    return <CustomButton {...this.props} className={className} />;
  }
}

export default CustomMenuItem;
