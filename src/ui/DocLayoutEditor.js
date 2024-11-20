// @flow

import * as React from 'react';
import { LAYOUT } from '../DocNodeSpec.js';
import { CustomButton, preventEventDefault } from '@modusoperandi/licit-ui-commands';
import CustomRadioButton from './CustomRadioButton.js';

import './czi-body-layout-editor.css';
import './czi-form.css';

export type DocLayoutEditorValue = {
  layout: ?string,
  width: ?number,
};

type State = {
  layout: ?string,
  selectedValue: any,
  width: ?number,
};

class DocLayoutEditor extends React.PureComponent<any, any> {
  _unmounted = false;

  // [FS] IRAD-1005 2020-07-07
  // Upgrade outdated packages.
  // To take care of the property type declaration.
  static propsTypes = {
    // initialValue: PropTypes.shape({
    //   layout: PropTypes.string,
    //   width: PropTypes.number,
    // }),

    close: function (props: any, propName: string) {
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

  state: State;

  constructor(props: Object, context: Object) {
    super(props, context);
    const { width, layout } = this.props.initialValue || {};
    this.state = {
      width,
      layout,
      selectedValue: width || layout || LAYOUT.US_LETTER_PORTRAIT, // or LAYOUT.A4_PORTRAIT to define default layout
    };
  }

  render(): React.Element<any> {
    const { width, selectedValue } = this.state;
    const customOption = width ? (
      <CustomRadioButton
        checked={selectedValue === width}
        key="c"
        label={`Custom width: ${width}pt`}
        onSelect={this._onSelect}
        value={width}
      />
    ) : null;

    return (
      <div className="czi-body-layout-editor">
        <form className="czi-form" onSubmit={preventEventDefault}>
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
            <CustomRadioButton
              checked={selectedValue === LAYOUT.DESKTOP_SCREEN_4_3}
              label="4:3 Desktop Screen"
              onSelect={this._onSelect}
              value={LAYOUT.DESKTOP_SCREEN_4_3}
            />
            <CustomRadioButton
              checked={selectedValue === LAYOUT.DESKTOP_SCREEN_16_9}
              label="16:9 Desktop Screen"
              onSelect={this._onSelect}
              value={LAYOUT.DESKTOP_SCREEN_16_9}
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

  _onSelect = (selectedValue: any): void => {
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
