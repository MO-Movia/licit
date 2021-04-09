// @flow

import './czi-custom-button.css';
import * as React from 'react';
import UICommand from './UICommand';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import './custom-dropdown.css';
import {getCustomStyleByName, getCustomStyle} from '../customStyle';
import PointerSurface from './PointerSurface';
import type {PointerSurfaceProps} from './PointerSurface';
import Icon from './Icon';
import cx from 'classnames';
class CustomStyleItem extends React.PureComponent<any, any> {
  props: PointerSurfaceProps & {
    command: UICommand,
    disabled?: ?boolean,
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
    label: string,
    onClick: ?(value: any, e: SyntheticEvent<>) => void,
    onMouseEnter: ?(value: any, e: SyntheticEvent<>) => void,
    hasText?: ?Boolean,
    onCommand: ?Function,
  };

  render(): React.Element<any> {
    const {label, hasText, ...pointerProps} = this.props;
    let text = '';
    let customStyle;
    text = this.sampleText();
    const styleProps = getCustomStyleByName(label);
    const className = 'czi-custom-menu-item';
    if (styleProps && styleProps.styles) {
      customStyle = getCustomStyle(styleProps.styles);
    }
    const klass = cx(className);
    return (
      <div id="container1" tag={label}>
        <div style={{width: '140px', height: 'auto'}}>
          <PointerSurface
            {...pointerProps}
            className={klass}
            style={{display: 'inline-block', width: '140px'}}
          >
            {label}
          </PointerSurface>
        </div>
        <div style={{width: '100px'}} style={customStyle}>
          <PointerSurface
            {...pointerProps}
            className={klass}
            style={customStyle}
          >
            {text}
          </PointerSurface>
        </div>
        <div
          className="arrow-right"
          style={{width: '50px'}}
          style={hasText ? {display: 'block'} : {display: 'none'}}
        >
          {/* Need to change the below icon to downarroe */}
          <PointerSurface {...pointerProps} className={klass + ' edit-icon'}>
            {Icon.get('edit')}
            {''}
          </PointerSurface>
        </div>
      </div>
    );
  }

  // temp method to clear sample text for new and clear command menu item
  sampleText(): string {
    let text = 'AaBbCcDd';
    if (!this.props.hasText) {
      text = '';
    }
    return text;
  }
}

export default CustomStyleItem;
