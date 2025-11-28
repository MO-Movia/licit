/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import '../styles/czi-custom-menu-item.css';
import {
  CustomButton,
  PointerSurfaceProps,
  ThemeContext,
} from '@modusoperandi/licit-ui-commands';
import * as React from 'react';
type CustomButtonProps = PointerSurfaceProps & {
  icon?: string | React.ReactElement;
  label?: string | React.ReactElement;
  theme?: string;
};

class CustomMenuItemSeparator extends React.PureComponent {
  render(): React.ReactElement {
    return <div className="czi-custom-menu-item-separator" />;
  }
}

class CustomMenuItem extends React.PureComponent {
  public static readonly Separator = CustomMenuItemSeparator;
  public static readonly contextType = ThemeContext;
  declare props: CustomButtonProps;

  render(): React.ReactElement<CustomButton> {
    // [FS] IRAD-1044 2020-09-22
    // Added a new class to adjust the width of the custom style menu dropdown.
    // const theme = this.context;
    // const className = 'czi-custom-menu-item';
    let className = 'czi-custom-menu-item ' + this.props.theme;
   if (this.props.value.constructor.name.startsWith('TextAlignCommand')) {
      const command = this.props.value;
      if (command['_alignment']) {
        className = 'czi-custom-menu-item-button ' + this.props.theme;
      }
    }
    return (
      <CustomButton
        {...this.props}
        className={className}
        theme={this.props.theme}
      />
    );
  }
}

export default CustomMenuItem;
