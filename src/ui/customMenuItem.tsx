import '../styles/czi-custom-menu-item.css';
import {
  CustomButton,
  PointerSurfaceProps,
  TextAlignCommand,
  ThemeContext
} from '@modusoperandi/licit-ui-commands';
import * as React from 'react';
type CustomButtonProps = PointerSurfaceProps & {
  icon?: string | React.ReactElement | null;
  label?: string | React.ReactElement | null;
  theme?: string;

};

class CustomMenuItemSeparator extends React.PureComponent {
  render(): React.ReactElement {
    return <div className="czi-custom-menu-item-separator" />;
  }
}

class CustomMenuItem extends React.PureComponent {
  static Separator = CustomMenuItemSeparator;
  static contextType = ThemeContext;
  declare props: CustomButtonProps;

  render(): React.ReactElement<CustomButton> {
    // [FS] IRAD-1044 2020-09-22
    // Added a new class to adjust the width of the custom style menu dropdown.
    // const theme = this.context;
    // const className = 'czi-custom-menu-item';
    let className = 'czi-custom-menu-item ' + this.props.theme;
    if (this.props.value?.alignment) {
      className = 'czi-custom-menu-item-button ' + this.props.theme;
    }
    return <CustomButton {...this.props} className={className} theme={this.props.theme} />;
  }
}

export default CustomMenuItem;
