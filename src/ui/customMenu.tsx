import * as React from 'react';

import '../styles/czi-custom-menu.css';
import '../styles/czi-custom-scrollbar.css';
import cx from 'classnames';

class CustomMenu extends React.Component<
  /* eslint-disable  @typescript-eslint/no-explicit-any */ any,
  /* eslint-disable  @typescript-eslint/no-explicit-any */ any
> {
  render(): React.ReactElement {
    const { children, isHorizontal } = this.props;
    const buttonClassName = cx('czi-custom-menu czi-custom-scrollbar', {
      'czi-horizontal-menu': isHorizontal
    });
    return (
      // <div className="czi-custom-menu czi-custom-scrollbar">
      //   {this.props.children}
      // </div>
      <div className={buttonClassName}>{children}</div>
    );
  }
}

export default CustomMenu;
