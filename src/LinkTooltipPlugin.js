// @flow

import {
  EditorState,
  Plugin,
  PluginKey,
  TextSelection,
} from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { MARK_LINK } from './MarkNames.js';
import { hideSelectionPlaceholder } from './SelectionPlaceholderPlugin.js';
import {
  applyMark,
  findNodesWithSameMark,
  atAnchorTopCenter,
  createPopUp,
} from '@modusoperandi/licit-ui-commands';
import lookUpElement from './lookUpElement.js';
import LinkTooltip from './ui/LinkTooltip.js';
import LinkURLEditor from './ui/LinkURLEditor.js';
import { INNER_LINK } from './Types.js';

// https://prosemirror.net/examples/tooltip/
const SPEC = {
  // [FS] IRAD-1005 2020-07-07
  // Upgrade outdated packages.
  key: new PluginKey('LinkTooltipPlugin'),
  view(editorView: EditorView) {
    return new LinkTooltipView(editorView);
  },
};

class LinkTooltipPlugin extends Plugin {
  constructor() {
    super(SPEC);
  }
}

class LinkTooltipView {
  _anchorEl = null;
  _popup = null;
  _editor = null;

  constructor(editorView: EditorView) {
    this.update(editorView, null);
  }

  getInnerlinkSelected_position(view: EditorView, selectionId): void {
    let tocItemPos = null;
    if (selectionId) {
      view.state.tr.doc.descendants((node, pos) => {
        if (node.attrs.styleName && node.attrs.innerLink === selectionId) {
          tocItemPos = { position: pos, textContent: node.textContent };
        }
      });
    }
    return tocItemPos;
  }

  update(view: EditorView, lastState: EditorState): void {
    const { state } = view;
    const { doc, selection, schema } = state;
    const markType = schema.marks[MARK_LINK];
    if (!markType) {
      return;
    }
    const { from, to } = selection;
    const result = findNodesWithSameMark(doc, from, to, markType);

    if (!result) {
      this.destroy();
      return;
    }
    const domFound = view.domAtPos(from);
    if (!domFound) {
      this.destroy();
      return;
    }
    const anchorEl = lookUpElement(domFound.node, (el) => el.nodeName === 'A');
    if (!anchorEl) {
      this.destroy();
      return;
    }
    const tocItemPos = this.getInnerlinkSelected_position(
      view,
      result.mark.attrs.selectionId
    );
    const popup = this._popup;
    const viewPops = {
      editorState: state,
      editorView: view,
      href: result.mark.attrs.href,
      selectionId_: result.mark.attrs.selectionId,
      onCancel: this._onCancel,
      onEdit: this._onEdit,
      onRemove: this._onRemove,
      tocItemPos_: tocItemPos,
    };

    if (popup && anchorEl === this._anchorEl) {
      popup.update(viewPops);
    } else {
      popup?.close();
      this._anchorEl = anchorEl;
      this._popup = createPopUp(LinkTooltip, viewPops, {
        anchor: anchorEl,
        autoDismiss: false,
        onClose: this._onClose,
        position: atAnchorTopCenter,
      });
    }
  }

  destroy() {
    this._popup?.close();
    this._editor?.close();
  }

  _onCancel = (view: EditorView): void => {
    this.destroy();
    view.focus();
  };

  _onClose = (): void => {
    this._anchorEl = null;
    this._editor = null;
    this._popup = null;
  };

  showTocList = async (view) => {
    let storeTOCvalue = [];
    const TOCselectedNode = [];

    const stylePromise = view.runtime;
    if (stylePromise === null || undefined) {
      return TOCselectedNode;
    } else {
      const styles = await stylePromise.fetchStyles();

      storeTOCvalue = styles
        .filter((style) => style?.styles?.toc === true)
        .map((style) => style?.styleName);
      view.state.tr.doc.descendants((node, pos) => {
        if (node.attrs.styleName) {
          for (let i = 0; i <= storeTOCvalue.length; i++) {
            if (storeTOCvalue[i] === node.attrs.styleName) {
              TOCselectedNode.push({ node_: node, pos_: pos });
            }
          }
        }
      });
      return TOCselectedNode;
    }
  };

  _onEdit = (view: EditorView): void => {
    this._popup.close();
    if (this._editor) {
      return;
    }

    const { state } = view;
    const { schema, doc, selection } = state;
    const { from, to } = selection;
    const markType = schema.marks[MARK_LINK];
    const result = findNodesWithSameMark(doc, from, to, markType);
    if (!result) {
      return;
    }

    this.showTocList(view).then((data) => {
      const tocItemsNode = data;
      const href = result.mark.attrs.href;
      const viewPops = {
        selectionId_: result.mark.attrs.selectionId,
        href_: href,
        TOCselectedNode_: tocItemsNode,
        view_: view,
      };

      this._editor = createPopUp(LinkURLEditor, viewPops, {
        onClose: (value) => {
          this._editor = null;
          this._onEditEnd(view, selection, value);
        },
      });
    });
  };

  _onRemove = (view: EditorView): void => {
    this._popup.close();
    this._onEditEnd(view, view.state.selection, null);
  };

  _onEditEnd = (
    view: EditorView,
    initialSelection: TextSelection,
    url: ?string
  ): void => {
    const { state, dispatch } = view;
    let tr = hideSelectionPlaceholder(state);

    if (url !== undefined) {
      const { schema } = state;
      const markType = schema.marks[MARK_LINK];
      if (markType) {
        const result = findNodesWithSameMark(
          tr.doc,
          initialSelection.from,
          initialSelection.to,
          markType
        );
        if (result) {
          const linkSelection = TextSelection.create(
            tr.doc,
            result.from.pos,
            result.to.pos + 1
          );
          tr = tr.setSelection(linkSelection);
          let selectionId;
          let href;
          if (url === null) {
            selectionId = null;
            href = null;
          } else if (url.includes(INNER_LINK)) {
            selectionId = url.split(INNER_LINK)[0];
            href = url.split(INNER_LINK)[1];
          } else {
            selectionId = null;
            href = url;
          }

          const attrs = href ? { href, selectionId } : null;
          tr = applyMark(tr, schema, markType, attrs);

          // [FS] IRAD-1005 2020-07-09
          // Upgrade outdated packages.
          // reset selection to original using the latest doc.
          const origSelection = TextSelection.create(
            tr.doc,
            initialSelection.from,
            initialSelection.to
          );
          tr = tr.setSelection(origSelection);
        }
      }
    }
    dispatch(tr);
    view.focus();
  };
}

export default LinkTooltipPlugin;
