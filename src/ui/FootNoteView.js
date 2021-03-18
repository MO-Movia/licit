// @flow

import {StepMap} from 'prosemirror-transform';
import {keymap} from 'prosemirror-keymap';
import {undo, redo} from 'prosemirror-history';
import {EditorView} from 'prosemirror-view';
import {EditorState} from 'prosemirror-state';
import CitationSubMenu from './CitationSubMenu';
import {atAnchorTopCenter,atViewportCenter, atAnchorBottomLeft, atAnchorTopRight} from './PopUpPosition';
import lookUpElement from '../lookUpElement';
import createPopUp from './createPopUp';
import './add-citation.css';

class FootnoteView {
  constructor(node, view, getPos,nodeSelection) {
    // We'll need these later
    this.node = node;
    this.outerView = view;
    this.getPos = getPos;
    const pos = getPos();
    this.nodeSelection= nodeSelection;

    // The node's representation in the editor (empty, for now)
    this.dom = document.createElement('footnote');
    this.dom.addEventListener("mouseover", this.showSourceText.bind(this,this.outerView));
    this.dom.addEventListener('mouseout', this.hideSourceText.bind(this));
    // These are used when the footnote is selected
    this.innerView = null;
    this._popup = null;
    this._anchorEl = null;
  }

  showSourceText(customEditorView,e) {
    // customEditorView.state.tr.doc.nodesBetween(from, to, (node, startPos) => {
    //   if (node.type.name === 'paragraph') {
    //     // [FS] IRAD-1182 2021-02-11
    //     // Issue fix: When style applied to multiple paragraphs, some of the paragraph's objectId found in deletedObjectId's
    //     tr = applyStyleEx(style, styleName, state, tr, node, startPos, to);
    //     _node = node;
    //   }
    // });

    if (this.dom.classList) {
      this.dom.classList.add('ProseMirror-selectednode');
      if (!this.innerView) this.open();
    }
  }

  hideSourceText(view) {
    this.dom.classList.remove('ProseMirror-selectednode');
    if (this.innerView) this.close();
  }

  selectNode() {
    this.hideSourceText(this.outerView);
    const domFound = this.outerView.domAtPos(this.getPos());
    if (!domFound) {
      this.destroy();
      return;
    }

    const anchorEl = lookUpElement(domFound.node, el => el.nodeName === 'P');
    if (!anchorEl) {
      this.destroy();
      return;
    }

    const popup = this._popup;
    const viewPops = {
      editorState: this.outerView.state,
      editorView: this.outerView,
      // href: result.mark.attrs.href,
      onCancel: this._onCancel,
      // onEdit: this._onEdit,
      // onRemove: this._onRemove,
    };



    if (popup && anchorEl === this._anchorEl) {
      popup.update(viewPops);
    } else {
      popup && popup.close();
      this._anchorEl = anchorEl;
      this._popup = createPopUp(CitationSubMenu, viewPops, {
        anchor: anchorEl,
        autoDismiss: false,
        onClose: this._onClose,
        position: atAnchorTopCenter,
      });
    }



    // this._popup = createPopUp(CitationSubMenu, {
    //   editorState: this.outerView.state,
    //   editorView: this.outerView,
    //   // href: result.mark.attrs.href,
    //   // onCancel: this._onCancel,
    //   // onEdit: this._onEdit,
    //   // onRemove: this._onRemove,
    // }, {
    //   anchor: anchorEl,
    //   autoDismiss: false,
    //   onClose: this._onClose,
    //   position: atViewportCenter,
    // });


    // this.dom.classList.add('ProseMirror-selectednode');
    // if (!this.innerView) this.open();
  }

  _onClose = (): void => {
    this._popup = null;
  };

  destroy() {
    this._popup && this._popup.close();
    // this._editor && this._editor.close();
  }
  

  deselectNode() {
    this.dom.classList.remove('ProseMirror-selectednode');
    if (this.innerView) this.close();
  }
  open() {
    // Append a tooltip to the outer node
    let tooltip = this.dom.appendChild(document.createElement('div'));
    tooltip.className = 'footnote-tooltip';
    tooltip.style.border = '5px solid silver !important';
    tooltip.style.background = 'silver !important';
    // And put a sub-ProseMirror into that
    this.innerView = new EditorView(tooltip, {
      // You can use any node as an editor document
      state: EditorState.create({
        doc: this.node,
        plugins: [
          keymap({
            'Mod-z': () => undo(this.outerView.state, this.outerView.dispatch),
            'Mod-y': () => redo(this.outerView.state, this.outerView.dispatch),
          }),
        ],
      }),
      // This is the magic part
      dispatchTransaction: this.dispatchInner.bind(this),
      handleDOMEvents: {
        mousedown: () => {
          // Kludge to prevent issues due to the fact that the whole
          // footnote is node-selected (and thus DOM-selected) when
          // the parent editor is focused.
          if (this.outerView.hasFocus()) this.innerView.focus();
        },
      },
    });
    this.innerView.dom.contentEditable = false;
    var footNoteDiv = this.innerView.dom.style;
    footNoteDiv.setProperty('--czi-content-body-background-color', 'silver');
  }

  close() {
    this.innerView.destroy();
    this.innerView = null;
    this.dom.textContent = '';
  }
  dispatchInner(tr) {
    let {state, transactions} = this.innerView.state.applyTransaction(tr);
    this.innerView.updateState(state);

    if (!tr.getMeta('fromOutside')) {
      let outerTr = this.outerView.state.tr,
        offsetMap = StepMap.offset(this.getPos() + 1);
      for (let i = 0; i < transactions.length; i++) {
        let steps = transactions[i].steps;
        for (let j = 0; j < steps.length; j++)
          outerTr.step(steps[j].map(offsetMap));
      }
      if (outerTr.docChanged) this.outerView.dispatch(outerTr);
    }
  }
  update(node) {
    if (!node.sameMarkup(this.node)) return false;
    this.node = node;
    if (this.innerView) {
      let state = this.innerView.state;
      let start = node.content.findDiffStart(state.doc.content);
      if (start != null) {
        let {a: endA, b: endB} = node.content.findDiffEnd(state.doc.content);
        let overlap = start - Math.min(endA, endB);
        if (overlap > 0) {
          endA += overlap;
          endB += overlap;
        }
        this.innerView.dispatch(
          state.tr
            .replace(start, endB, node.slice(start, endA))
            .setMeta('fromOutside', true)
        );
      }
    }
    return true;
  }
  destroy() {
    if (this.innerView) this.close();
  }

  stopEvent(event) {
    return this.innerView && this.innerView.dom.contains(event.target);
  }

  ignoreMutation() {
    return true;
  }
}

export default FootnoteView;
