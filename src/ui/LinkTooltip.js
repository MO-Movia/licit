// @flow

import { EditorView } from 'prosemirror-view';
import * as React from 'react';

import { CustomButton } from '@modusoperandi/licit-ui-commands';


class LinkTooltip extends React.PureComponent<any, any> {
  props: {
    editorView: EditorView,
    href: string,
  };

  render(): React.Element<any> {
    const { href, tocItemPos_, selectionId_ } =
      this.props;
    const getLabel = () => {
      if (tocItemPos_ && selectionId_) {
        return tocItemPos_.textContent === '' ? 'Reference not found' : tocItemPos_.textContent;
      } else if (!tocItemPos_ && selectionId_) {
        return 'Reference not found';
      }
      return href;
    };

    const label = getLabel();
    const isRemoved = label === 'Reference not found';

    return (
      <div className="czi-link-tooltip">
        <div className="czi-link-tooltip-body">
          <div className="czi-link-tooltip-row">
            <CustomButton
              className={`czi-link-tooltip-href ${isRemoved ? 'red-text disabled' : ''}`}
              label={label}
              style={{ color: isRemoved ? 'red' : undefined }}
              target="new"
              title={label}
              value={label}
            />

          </div>
        </div>
      </div>
    );
  }

}

export default LinkTooltip;
