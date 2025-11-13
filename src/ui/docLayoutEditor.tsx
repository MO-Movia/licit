/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import { LAYOUT } from '../constants';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import {
  CustomButton,
  preventEventDefault, ThemeContext
} from '@modusoperandi/licit-ui-commands';
import CustomRadioButton from './customRadioButton';

import '../styles/czi-body-layout-editor.css';
import '../styles/czi-form.css';

export type DocLayoutEditorValue = {
  layout?: string;
  width?: number;
};

type DocLayoutEditorProps = {
  initialValue?: DocLayoutEditorValue;
  close: (val?: DocLayoutEditorValue) => void;
};

type DocLayoutEditorState = {
  selectedValue: string | number;
  layout?: string;
  width?: number;

};

class DocLayoutEditor extends React.PureComponent<DocLayoutEditorProps> {

  public static readonly contextType = ThemeContext;
  _unmounted = false;
  // [FS] IRAD-1005 2020-07-07
  // Upgrade outdated packages.
  // To take care of the property type declaration.
  public static readonly propsTypes = {
    close: function (props: DocLayoutEditorProps, propName: string): Error {
      const fn = props[propName];
      if (
        !fn.prototype ||
        (typeof fn.prototype.constructor !== 'function' &&
          fn.prototype.constructor.length !== 1)
      ) {
        return new Error(
          propName +
            'must be a function with 1 arg of type DocLayoutEditorValue'
        );
      }
      return null;
    },
  };

  declare state: DocLayoutEditorState;

  constructor(props: DocLayoutEditorProps) {
    super(props);
    const { width, layout } = this.props.initialValue || {};
    this.state = {
      width,
      layout,
      selectedValue: width || layout || LAYOUT.US_LETTER_PORTRAIT, // or LAYOUT.A4_PORTRAIT to define default layout
    };
  }

  render(): React.ReactElement<CustomRadioButton> {
    const { width, selectedValue } = this.state;
    console.warn('UICommand : ', UICommand.theme);
    const parentClassName = "czi-body-layout-editor " + UICommand.theme;
    const formClassName = "czi-form " + UICommand.theme;
    const customOption = width ? (
      <CustomRadioButton
        checked={selectedValue === String(width)}
        key="c"
        label={`Custom width: ${width}pt`}
        onSelect={this._onSelect}
        value={width}
      />
    ) : null;

    return (
      <div className={parentClassName}>
        <form className={formClassName} onSubmit={preventEventDefault}>
          <fieldset>
            <legend>Page Layout</legend>
            <CustomRadioButton
              checked={selectedValue === LAYOUT.US_LETTER_PORTRAIT}
              label="US Letter - Portrait"
              onSelect={this._onSelect}
              value={LAYOUT.US_LETTER_PORTRAIT}
            />
            <CustomRadioButton
              checked={selectedValue === LAYOUT.US_LETTER_LANDSCAPE}
              label="US Letter - Landscape"
              onSelect={this._onSelect}
              value={LAYOUT.US_LETTER_LANDSCAPE}
            />
            <CustomRadioButton
              checked={selectedValue === LAYOUT.A4_PORTRAIT}
              label="A4 - Portrait"
              onSelect={this._onSelect}
              value={LAYOUT.A4_PORTRAIT}
            />
            <CustomRadioButton
              checked={selectedValue === LAYOUT.A4_LANDSCAPE}
              label="A4 - Landscape"
              onSelect={this._onSelect}
              value={LAYOUT.A4_LANDSCAPE}
            />
            {customOption}
          </fieldset>
          <hr />
          <div className="czi-form-buttons">
            <CustomButton label="Cancel" onClick={this._cancel} />
            <CustomButton active={true} label="Apply" onClick={this._apply} />
          </div>
        </form>
      </div>
    );
  }

  _onSelect = (selectedValue: string): void => {
    this.setState({ selectedValue });
  };

  _cancel = (): void => {
    this.props.close();
  };

  _apply = (): void => {
    const { selectedValue } = this.state;
    if (typeof selectedValue === 'string') {
      this.props.close({ width: null, layout: selectedValue });
    } else {
      this.props.close({ width: selectedValue, layout: null });
    }
  };
}

export default DocLayoutEditor;
