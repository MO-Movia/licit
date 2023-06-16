// @flow

import * as React from 'react';
import cx from 'classnames';
import './czi-custom-menu.css';
import './czi-custom-scrollbar.css';

class CustomMenu extends React.Component<any, any> {
  render(): React.Element<any> {
    const { children, isHorizontal } = this.props;
    const buttonClassName = cx('czi-custom-menu czi-custom-scrollbar', {
      'czi-horizontal-menu': isHorizontal
    });
    return (
      <div className={buttonClassName}>{children}</div>
    );
  }
}

export default CustomMenu;
