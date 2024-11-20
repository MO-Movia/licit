// @flow

import { EditorView } from 'prosemirror-view';
import { TextSelection } from 'prosemirror-state';
import * as React from 'react';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import sanitizeURL from '../sanitizeURL.js';
import { CustomButton } from '@modusoperandi/licit-ui-commands';

import './czi-link-tooltip.css';

function isBookMarkHref(href: string): boolean {
  return !!href && href.startsWith('#') && href.length >= 2;
}

class LinkTooltip extends React.PureComponent<any, any> {
  props: {
    editorView: EditorView,
    href: string,
    onCancel: (view: EditorView) => void,
    onEdit: (view: EditorView) => void,
    onRemove: (view: EditorView) => void,
  };

  render(): React.Element<any> {
    const { href, editorView, onEdit, onRemove, tocItemPos_, selectionId_ } =
      this.props;
    // [FS] IRAD-1013 2020-07-09
    const getLabel = () => {
      if (tocItemPos_ && selectionId_) {
        return tocItemPos_.textContent === '' ? 'Reference not found' : tocItemPos_.textContent;
      }else if(!tocItemPos_ && selectionId_){
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
              onClick={!isRemoved ? () =>
                this.jumpLink(editorView, tocItemPos_?.position, href, selectionId_)
                : undefined
              }
              style={{ color: isRemoved ? 'red' : undefined }}
              target="new"
              title={label}
              value={label}
            />
            <CustomButton label="Change" onClick={onEdit} value={editorView} />
            <CustomButton label="Remove" onClick={onRemove} value={editorView} />
          </div>
        </div>
      </div>
    );
  }

  jumpLink = (view: EditorView, tocItemPos, href, selectionId): void => {
    if (selectionId || (selectionId === 0 && tocItemPos)) {
      this.jumpInnerLink(view, tocItemPos);
    } else {
      this._openLink(href);
    }
  };

  jumpInnerLink = (view: EditorView, tocItemPos): void => {
    const transaction = view.state.tr;
    const tr = transaction.setSelection(
      TextSelection.create(transaction.doc, tocItemPos + 1)
    );
    view.dispatch(tr.scrollIntoView(true));
  };

  _openLink = (href: string): void => {
    if (isBookMarkHref(href)) {
      const id = href.substr(1);
      const el = document.getElementById(id);
      if (el) {
        const { onCancel, editorView } = this.props;
        onCancel(editorView);
        (async () => {
          // https://www.npmjs.com/package/smooth-scroll-into-view-if-needed
          await scrollIntoView(el, {
            scrollMode: 'if-needed',
            behavior: 'smooth',
          });
        })();
      }
      return;
    }
    if (href) {
      const url = sanitizeURL(href);
      let popupString;

      if (this.props.editorView.editable) {
        popupString = 'Any unsaved changes will be lost';
      } else {
        popupString = '';
      }

      if (this.props.editorView?.runtime?.openLinkDialog) {
        this.props.editorView.runtime.openLinkDialog(url, popupString);
      } else {
        window.open(url);
      }
    }
  };
}

export default LinkTooltip;
