// @flow

import './czi-custom-button.css';
import * as React from 'react';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import './custom-dropdown.css';
import { getCustomStyleByName, getCustomStyle } from '../customStyle';
import PointerSurface from './PointerSurface';
import type { PointerSurfaceProps } from './PointerSurface';
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
    selectionClassName: ?string,
  };

  render(): React.Element<any> {
    const { label, hasText, ...pointerProps } = this.props;
    let text = '';
    let customStyle;
    // [FS] IRAD-1410 2021-06-28
    // The numbering in custom style drop menu not showing properly
    text = ' AaBbCcDd';
    const level = this.sampleLevel(pointerProps.command._customStyle.styles);
    const hasBoldPartial = this.hasBoldPartial(
      pointerProps.command._customStyle.styles
    );
    // [FS] IRAD-1505 2021-07-07
    // Style menu not showing properly for First Word Bold
    const hasBoldSentence = this.hasBoldSentence(pointerProps.command._customStyle.styles);
    // [FS] IRAD-1394 2021-05-25
    // Added two divs to display Numbering and bold first word/sentece.
    const BOLD_WORD = 'AaBb  ';
    const BOLD_SENTENCE = 'AaBbCc. ';
    const styleProps = getCustomStyleByName(label);
    const className = 'czi-custom-menu-item';
    if (styleProps && styleProps.styles) {
      customStyle = getCustomStyle(styleProps.styles);
    }
    const klass = cx(className);
    return (
      <div
        className={this.props.selectionClassName}
        id="container1"
        tag={label}
      >
        <div style={{ width: '140px', height: 'auto' }}>
          <PointerSurface
            {...pointerProps}
            className={klass}
            style={{ display: 'inline-block', width: '140px' }}
          >
            {label}
          </PointerSurface>
        </div>
        <div
          style={{
            display: level === '' ? 'none' : '',
            // [FS] IRAD-1410 2021-06-02
            // Issue: Number example in custom style menu box not showing properly
            marginTop: '-4px',
            fontWeight:
              pointerProps.command._customStyle.styles &&
                pointerProps.command._customStyle.styles.boldNumbering
                ? 'bold'
                : 'normal',
          }}
        >
          <PointerSurface
            {...pointerProps}
            className={klass}
            style={customStyle}
          >
            {level}
          </PointerSurface>
        </div>
        <div
          style={{
            display: hasBoldPartial ? '' : 'none',
            // [FS] IRAD-1410 2021-06-03
            // Issue: Number example along with Bold first word in custom style menu box not showing properly
            marginTop: '-4px',
            fontWeight: hasBoldPartial ? 'bold' : 'normal',
          }}
        >
          <PointerSurface
            {...pointerProps}
            className={klass}
            style={customStyle}
          >
            {(hasBoldPartial && hasBoldSentence) ? BOLD_SENTENCE : BOLD_WORD}
          </PointerSurface>
        </div>
        <div className="style-sampletext" style={customStyle}>
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
          style={{ width: '50px' }}
          style={hasText ? { display: 'block' } : { display: 'none' }}
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

  // [FS] IRAD-1394 2021-05-25
  // To show Numbering in dropdown menu sample text
  sampleLevel(styles: any): string {
    let level = '';
    if (this.props.hasText && styles && styles.hasNumbering) {
      for (let i = 0; i < parseInt(styles.styleLevel); i++) {
        level = level + '1.';
      }
    }
    return level;
  }

  hasBoldPartial(styles: any) {
    return styles && styles.boldPartial ? true : false;
  }

  hasBoldSentence(styles: any) {
    return styles && styles.boldSentence ? true : false;
  }
}

export default CustomStyleItem;
