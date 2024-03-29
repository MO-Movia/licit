import cx from 'classnames';
import * as React from 'react';
import { ThemeContext } from '@modusoperandi/licit-ui-commands';

import '../styles/czi-editor-frameset.css';

export type EditorFramesetProps = {
  body?: React.ReactElement;
  className?: string;
  embedded?: boolean;
  header?: React.ReactElement;
  height?: string | number;
  toolbarPlacement?: 'header' | 'body' | null;
  toolbar?: React.ReactElement;
  width?: string | number;
};

export const FRAMESET_BODY_CLASSNAME = 'czi-editor-frame-body';

function toCSS(val?: number | string): string {
  if (!val || val === 'auto') {
    // '', 0, null, false, 'auto' are all treated as undefined
    // instead of auto...
    return undefined;
  }
  if (isNaN(val as number)) {
    return `${val}`;
  }
  return `${val}px`;
}

class EditorFrameset extends React.PureComponent {
  static contextType = ThemeContext;
  props: EditorFramesetProps;

  render(): React.ReactElement {
    const {
      body,
      className,
      embedded,
      header,
      height,
      toolbarPlacement,
      toolbar,
      width,
    } = this.props;

    const mainStyle = {
      width: toCSS(width),
      height: toCSS(height),
    };

    const mainClassName = cx(className, {
      'czi-editor-frameset': true,
      // Layout is fixed when either width or height is set.
      'with-fixed-layout': mainStyle.width || mainStyle.height,
      embedded: embedded,
    });

    // added for theme
    const theme = this.context;
    const frameHeadClassName = cx('czi-editor-frame-head', theme);

    const toolbarHeader =
      toolbarPlacement === 'header' || !toolbarPlacement ? toolbar : null;
    const toolbarBody = toolbarPlacement === 'body' && toolbar;

    return (
      <div className={mainClassName} style={mainStyle}>
        <div className="czi-editor-frame-main">
        <div className={frameHeadClassName}>
            {header}
            {toolbarHeader}
          </div>
          <div className={FRAMESET_BODY_CLASSNAME}>
            {toolbarBody}
            <div className="czi-editor-frame-body-scroll">{body}</div>
          </div>
          <div className="czi-editor-frame-footer" />
        </div>
      </div>
    );
  }
}

export default EditorFrameset;
