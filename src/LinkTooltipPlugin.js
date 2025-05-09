// @flow

import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { MARK_LINK } from './MarkNames.js';
import {
  atAnchorTopCenter,
  createPopUp,
  findNodesWithSameMark,
} from '@modusoperandi/licit-ui-commands';
import lookUpElement from './lookUpElement.js';
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
      click(view, event) {
        const pluginView = view.dom._linkTooltipView;
        return pluginView?._handleClick.call(view, event);
      },
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
  _handleClick(event) {
    const { state } = this.dom._linkTooltipView._view;
    const { doc, selection, schema } = state;
    const { from, to } = selection;
    const markType = schema.marks[MARK_LINK];

    const result = findNodesWithSameMark(doc, from, to, markType);
    if (!result) {
      return false;
    }
    const domFound = this.dom._linkTooltipView._view.domAtPos(from);
    if (!domFound) {
      return false;
    }

    const anchor = lookUpElement(domFound.node, (el) => el.nodeName === 'A');
    if (!anchor) {
      return false;
    }

    const href = anchor.getAttribute('href');
    const selectionId = anchor.getAttribute('selectionid');

    const tocItemPos = this.dom._linkTooltipView.getInnerlinkSelected_position(
      this.dom._linkTooltipView._view,
      result.mark.attrs.selectionId
    );

    this.dom._linkTooltipView.jumpLink(
      this.dom._linkTooltipView._view,
      tocItemPos,
      href,
      selectionId
    );
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
        window.open(url);
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
        if (node.attrs.styleName && node.attrs.innerLink === selectionId) {
          tocItemPos = { position: pos, textContent: node.textContent };
        }
      });
    }
    return tocItemPos;
  };
}

export default LinkTooltipPlugin;
