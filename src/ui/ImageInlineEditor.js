// @flow

import { CustomButton } from '@modusoperandi/licit-ui-commands';
import * as React from 'react';

export type PropValue = {
  value: ?string,
  text: ?string,
};

type Key = 'NONE' | 'LEFT' | 'CENTER' | 'RIGHT';

const ImageAlignValues: { [key: Key]: PropValue } = {
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
    const onClick = this._onClick;
    const buttons = Object.keys(ImageAlignValues).map((key) => {
      const { value, text } = ImageAlignValues[key];
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
    this.props.onSelect({ align: align });
  };
}

export default ImageInlineEditor;
