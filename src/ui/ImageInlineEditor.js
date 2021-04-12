// @flow

import './czi-inline-editor.css';
import CustomButton from './CustomButton';
import * as React from 'react';

export type PropValue = {
  value: ?string,
  text: ?string,
};

type Key = 'NONE' | 'LEFT' | 'CENTER' | 'RIGHT' | 'EDIT' | 'EDIT_FULL_SCREEN';

const ImageAlignValues: {[key: Key]: PropValue} = {
  NONE: {
    value: null,
    text: 'Inline',
  },
  LEFT: {
    value: 'left',
    text: 'Float left',
  },
  CENTER: {
    value: 'center',
    text: 'Break text',
  },
  RIGHT: {
    value: 'right',
    text: 'Float right',
  },
};

const DiagramMenuValues: {[key: Key]: PropValue} = {
  ...ImageAlignValues,
  EDIT: {
    value: 'edit',
    text: 'Edit',
  },
  EDIT_FULL_SCREEN: {
    value: 'edit_full_screen',
    text: 'Edit in full screen',
  },
};

export type ImageInlineEditorValue = {
  align: ?string,
  diagram: ?string,
};

class ImageInlineEditor extends React.PureComponent<any, any> {
  props: {
    onSelect: (val: ImageInlineEditorValue) => void,
    value: ?ImageInlineEditorValue,
  };

  render(): React.Element<any> {
    const align = this.props.value ? this.props.value.align : null;
    const values: {[key: Key]: PropValue} = this.props.value
      ? this.props.value.diagram === '1'
        ? DiagramMenuValues
        : ImageAlignValues
      : ImageAlignValues;

    const onClick = this._onClick;
    const buttons = Object.keys(values).map((key) => {
      const {value, text} = values[key];
      return (
        <CustomButton
          active={align === value}
          key={key}
          label={text}
          onClick={onClick}
          value={value}
        />
      );
    });

    return <div className="czi-inline-editor">{buttons}</div>;
  }

  _onClick = (align: ?string): void => {
    this.props.onSelect({align: align, diagram: undefined});
  };
}

export default ImageInlineEditor;
