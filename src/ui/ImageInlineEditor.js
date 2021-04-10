// @flow

import './czi-inline-editor.css';
import CustomButton from './CustomButton';
import * as React from 'react';

const ImageAlignValues = {
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

const DiagramMenuValues = {
  EDIT: {
    value: 'edit',
    text: 'Edit',
  },
  EDIT_FULL_SCREEN: {
    value: 'edit_full_screen',
    text: 'Edit in full screen',
  },
  ...ImageAlignValues,
};

export type ImageInlineEditorValue = {
  align: ?string,
};

class ImageInlineEditor extends React.PureComponent<any, any> {
  props: {
    onSelect: (val: ImageInlineEditorValue) => void,
    value: ?ImageInlineEditorValue,
  };

  render(): React.Element<any> {
    const align = this.props.value ? this.props.value.align : null;
    const values =
      this.props.value.diagram === '1' ? DiagramMenuValues : ImageAlignValues;

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
    this.props.onSelect({align: align});
  };
}

export default ImageInlineEditor;
