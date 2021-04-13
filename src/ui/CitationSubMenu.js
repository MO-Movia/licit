// @flow

import {EditorView} from 'prosemirror-view';
import * as React from 'react';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import sanitizeURL from '../sanitizeURL';
import CustomButton from './CustomButton';
import Icon from './Icon';
import './citation-note.css';

function isBookMarkHref(href: string): boolean {
  return !!href && href.indexOf('#') === 0 && href.length >= 2;
}

class CitationSubMenu extends React.PureComponent<any, any> {
  props: {
    editorView: EditorView,
    href: string,
    onCancel: (view: EditorView) => void,
    onEdit: (view: EditorView) => void,
    onRemove: (view: EditorView) => void,
  };

  _unmounted = false;

  state = {
    hidden: false,
  };

  render(): React.Element<any> {
    const {href, onEdit, onRemove, editorView} = this.props;
    const disabled = editorView.readOnly;

    return (
      <div className="citation-submenu">
        <div className="citation-submenu-body">
          <div className="citation-submenu-row">
          <CustomButton
              className="citation-submenu-href link"
              icon={Icon.get('link')}
              onClick={this._openLink}
              target="new"
              title={href}
              value={href}
            />
            <CustomButton
              disabled={disabled}
              icon={Icon.get('edit')}
              onClick={onEdit}
              value={editorView}
            />
            <CustomButton
              disabled={disabled}
              icon={Icon.get('delete')}
              onClick={onRemove}
              value={editorView}
            />
          </div>
        </div>
      </div>
    );
  }

  _openLink = (href: string): void => {
    if (isBookMarkHref(href)) {
      const id = href.substr(1);
      const el = document.getElementById(id);
      if (el) {
        const {onCancel, editorView} = this.props;
        onCancel(editorView);
        (async () => {
          // https://www.npmjs.com/package/smooth-scroll-into-view-if-needed
          await scrollIntoView(el, {
            scrollMode: 'if-needed',
            // block: 'nearest',
            // inline: 'nearest',
            behavior: 'smooth',
          });
        })();
      }
      return;
    }
    if (href) {
      window.open(sanitizeURL(href));
    }
  };
}

export default CitationSubMenu;
