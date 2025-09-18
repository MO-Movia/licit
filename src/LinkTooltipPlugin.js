// @flow

import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { MARK_LINK } from './MarkNames.js';
import {
  atAnchorTopCenter,
  createPopUp,
} from '@modusoperandi/licit-ui-commands';
import LinkTooltip from './ui/LinkTooltip.js';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import sanitizeURL from './sanitizeURL.js';

const SPEC = {
  key: new PluginKey('LinkTooltipPlugin'),
  props: {
    handleDOMEvents: {
      mouseover(view, event) {
        const pluginView = view.dom._linkTooltipView;
        return pluginView?._handleMouseOver(event) ?? false;
      },
      mouseout(view, event) {
        const pluginView = view.dom._linkTooltipView;
        return pluginView?._handleMouseOut.call(view, event);
      },
    },
    // https://prosemirror.net/docs/ref/#view.EditorProps.handleClickOn
    handleClickOn: (view, pos, node, nodePos, event, direct) => {
      if (!direct) {
        return false;
      }

      node = view.state.doc.nodeAt(pos);
      if (!node) {
        return false;
      }
      const linkMark = node.marks?.find((m) => m?.type?.name === MARK_LINK);
      if (!linkMark) {
        return false;
      }

      const pluginView = view.dom._linkTooltipView;
      return pluginView?._handleClick(view, linkMark);
    },
  },
  view(editorView: EditorView) {
    const pluginView = new LinkTooltipView(editorView);
    // Store the instance for use in DOM handlers
    editorView.dom._linkTooltipView = pluginView;
    return pluginView;
  },
};

class LinkTooltipPlugin extends Plugin {
  constructor() {
    super(SPEC);
  }
}
class LinkTooltipView {
  _popup = null;
  _anchorEl = null;
  _view = null;

  constructor(view) {
    this._view = view;
  }

  _handleMouseOver(event) {
    const anchor = event.target?.closest('a');
    if (!anchor || anchor === this._anchorEl) return;

    this._anchorEl = anchor;
    const href = anchor.getAttribute('href');
    this._popup?.close();
    this._popup = createPopUp(
      LinkTooltip,
      {
        href,
        selectionId: null,
        editorView: this._view,
      },
      {
        anchor,
        autoDismiss: true,
        onClose: () => {
          this._popup = null;
          this._anchorEl = null;
        },
        position: atAnchorTopCenter,
      }
    );
  }
  _handleClick(view, mark) {
    const href = mark.attrs['href'];
    const selectionId = mark.attrs['selectionId'];
    let tocItemPos = null;
    if (selectionId) {
      tocItemPos = this.getInnerlinkSelected_position(
        view,
        mark.attrs.selectionId
      );
      if (null === tocItemPos) {
        this.openSelectedSection(selectionId);
        event.preventDefault(); // prevent default browser navigation
        return true;
      }
    }
    this.jumpLink(view, tocItemPos, href, selectionId);
    event.preventDefault(); // prevent default browser navigation
    return true;
  }

  _handleMouseOut(event) {
    if (this._anchorEl && !this._anchorEl.contains(event.relatedTarget)) {
      this._popup?.close();
      this._popup = null;
      this._anchorEl = null;
    }
  }

  destroy() {
    this._popup?.close();
  }

  openSelectedSection = (selectionId): void => {
    if (selectionId) {
      if (this._view?.runtime?.goToInnerLinkSection) {
        this._view.runtime.goToInnerLinkSection(selectionId);
      }
    }
  };
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
      TextSelection.create(transaction.doc, tocItemPos.position + 1)
    );
    view.dispatch(tr.scrollIntoView(true));
    const dom = view.domAtPos(tocItemPos?.position + 1).node;
    if (dom?.scrollIntoView) {
      dom.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  _openLink = (href: string): void => {
    if (this.isBookMarkHref(href)) {
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
    const urlObj = new URL(href);
    if (href) {
      const url = sanitizeURL(href);
      let popupString;

      if (this._view.editable) {
        popupString = 'Any unsaved changes will be lost';
      } else {
        popupString = '';
      }

      if (this._view?.runtime?.openLinkDialog && urlObj.hostname !== window.location.hostname) {
        this._view.runtime.openLinkDialog(url, popupString);
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  isBookMarkHref = (href: string): boolean => {
    return !!href && href.startsWith('#') && href.length >= 2;
  };

  getInnerlinkSelected_position = (view: EditorView, selectionId): void => {
    let tocItemPos = null;
    if (selectionId) {
      view.state.tr.doc.descendants((node, pos) => {
        if (node.attrs.styleName && node.attrs.selectionId === selectionId) {
          tocItemPos = { position: pos, textContent: node.textContent };
        }
      });
    }
    return tocItemPos;
  };
}

export default LinkTooltipPlugin;
