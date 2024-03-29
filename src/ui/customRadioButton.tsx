import '../styles/czi-custom-radio-button.css';
import {
  PointerSurface,
  PointerSurfaceProps,
  preventEventDefault,
} from '@modusoperandi/licit-ui-commands';
import * as React from 'react';
import cx from 'classnames';
import uuid from './uuid';

class CustomRadioButton extends React.PureComponent {
  props: PointerSurfaceProps & {
    checked?: boolean;
    inline?: boolean;
    label?: string | React.ReactElement | null;
    name?: string;
    onSelect?: (val, e: React.SyntheticEvent) => void;
  };

  _name = uuid();

  render(): React.ReactElement<PointerSurface> {
    const {
      title,
      className,
      checked,
      label,
      inline,
      name,
      onSelect,
      disabled,
      ...pointerProps
    } = this.props;

    const klass = cx(className, 'czi-custom-radio-button', {
      checked: checked,
      inline: inline,
    });

    return (
      <PointerSurface
        {...pointerProps}
        className={klass}
        disabled={disabled}
        onClick={onSelect}
        title={title || (label as string)}
      >
        <input
          checked={checked}
          className="czi-custom-radio-button-input"
          disabled={disabled}
          name={name || this._name}
          onChange={preventEventDefault}
          tabIndex={disabled ? null : 0}
          type="radio"
        />
        <span className="czi-custom-radio-button-icon" />
        <span className="czi-custom-radio-button-label">{label}</span>
      </PointerSurface>
    );
  }
}

export default CustomRadioButton;
