// @flow

import {StepMap} from 'prosemirror-transform';
import {keymap} from 'prosemirror-keymap';
import {undo, redo} from 'prosemirror-history';
import {EditorView} from 'prosemirror-view';
import {EditorState} from 'prosemirror-state';
import CitationSubMenu from './CitationSubMenu';
import {atAnchorTopCenter} from './PopUpPosition';
import createPopUp from './createPopUp';
import {MARK_UNDERLINE, MARK_TEXT_HIGHLIGHT} from '../MarkNames';
import CitationDialog from './CitationDialog';
import {getNode} from '../CustomStyleCommand';
import './citation-note.css';

class CitationView {
  constructor(node, view, getPos, nodeSelection) {
    // We'll need these later
    this.node = node;
    this.outerView = view;
    this.getPos = getPos;
    this.nodeSelection = nodeSelection;

    // The node's representation in the editor (empty, for now)
    this.dom = document.createElement('citationnote');
    // [FS] IRAD-1251 2021-03-18
    // show citation source text on hover the citation numbering
    this.dom.addEventListener(
      'mouseover',
      this.showSourceText.bind(this, this.outerView)
    );
    this.dom.addEventListener(
      'mouseout',
      this.hideSourceText.bind(this, false)
    );
    // These are used when the citationnote is selected
    this.innerView = null;
    this._popup = null;
    this._anchorEl = null;
  }

  showSourceText(customEditorView, e) {
    if (this.dom.classList) {
      this.dom.classList.add('ProseMirror-selectednode');
      if (!this.innerView) this.open();
      // [FS] IRAD-1251 2021-03-23
      // to underline and highlight the selected text for citation on hover
      this.outerView.lastKeyCode = null;
      this.outerView.state.tr.doc.nodesBetween(
        this.node.attrs.from,
        this.node.attrs.to,
        (node, pos) => {
          if (node.attrs.citationUseObject) {
            let tr = this.outerView.state.tr;
            const markType = this.outerView.state.schema.marks[MARK_UNDERLINE];
            const highLightMarkType = this.outerView.state.schema.marks[
              MARK_TEXT_HIGHLIGHT
            ];
            const attrs = {highlightColor: '#aed0e6'};
            tr = tr.addMark(
              this.node.attrs.from,
              this.node.attrs.to,
              markType.create(null)
            );
            tr = tr.addMark(
              this.node.attrs.from,
              this.node.attrs.to,
              highLightMarkType.create(attrs)
            );
            this.outerView.dispatch && this.outerView.dispatch(tr);
          }
        }
      );
    }
  }

  hideSourceText(selected, view) {
    this.dom.classList.remove('ProseMirror-selectednode');
    if (this.innerView) this.close();
    // [FS] IRAD-1251 2021-03-23
    // to remove the marks underline and highlight for the selected text when mouse out
    if (!selected) {
      this.outerView.state.tr.doc.nodesBetween(
        this.node.attrs.from,
        this.node.attrs.to,
        (node, pos) => {
          if (node.attrs.citationUseObject) {
            let tr = this.outerView.state.tr;
            const markType = this.outerView.state.schema.marks[MARK_UNDERLINE];
            const highLightMarkType = this.outerView.state.schema.marks[
              MARK_TEXT_HIGHLIGHT
            ];
            tr = tr.removeMark(
              this.node.attrs.from,
              this.node.attrs.to,
              markType
            );
            tr = tr.removeMark(
              this.node.attrs.from,
              this.node.attrs.to,
              highLightMarkType
            );
            // [FS] IRAD-1253 2021-03-24
            // issue fix : citation submenu auto dismiss on mouse out
            (undefined === this._popup || null === this._popup) &&
              this.outerView.dispatch &&
              this.outerView.dispatch(tr);
          }
        }
      );
    }
  }

  selectNode() {
    this.hideSourceText(true, this.outerView);
    // [FS] IRAD-1253 2021-03-24
    // to show the sub menu popup to Edit, delte and go to the link for citation.
    const anchorEl = this.dom;
    if (!anchorEl) {
      this.destroy();
      return;
    }
    const popup = this._popup;
    const viewPops = {
      editorState: this.outerView.state,
      editorView: this.outerView,
      href: this.node.attrs.citationObject ? this.node.attrs.citationObject.hyperLink : null,
      onCancel: this.onCancel,
      onEdit: this.onEditCitation,
      onRemove: this.onRemoveCitation,
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
  }

  _onClose = (): void => {
    this._popup = null;
  };

  onCancel = (view: EditorView): void => {
    this.destroy();
    view.focus();
  };

  createCitationObject(editorView, mode) {
    return {
      citationUseObject: this.node.attrs.citationUseObject,
      citationObject: this.node.attrs.citationObject,
      sourceText: '',
      mode: mode, //0 = new , 1- modify, 2- delete
      editorView: editorView,
      isCitationObject: false, // if text not selected, then citationObject else citationUseObject
    };
  }

  onEditCitation = (view: EditorView): void => {
    this._popUp = createPopUp(
      CitationDialog,
      this.createCitationObject(view, '1'),
      {
        modal: true,
        autoDismiss: false,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            this.updateCitation(view, val);
          }
        },
      }
    );
  };

  // [FS] IRAD-1253 2021-03-25
  // delete citation from a paragraph
  onRemoveCitation = (view: EditorView): void => {
    const {state} = view;
    let {tr} = state;
    const {selection} = tr;

    if ('citationnote' === selection.node.type.name) {
      tr = tr.delete(selection.from, selection.to);
      const parentPos = selection.$head.pos - selection.$head.parentOffset - 1;
      const parentNode = tr.doc.nodeAt(parentPos);
      if (parentNode) {
        const newattrs = Object.assign({}, parentNode.attrs);
        newattrs.citationUseObject = null;
        tr = tr.setNodeMarkup(parentPos, undefined, newattrs);
      }
      view.dispatch(tr);
    }
  };

  // [FS] IRAD-1253 2021-03-25
  // Edit citation from a paragraph
  updateCitation(view, citation) {
    if (view.dispatch) {
      const {selection} = view.state;
      let {tr} = view.state;
      tr = tr.setSelection(selection);
      if (citation) {
        // save the citation use object to node
        tr = this.updateCitationUseObject(view.state, selection, tr, citation);
        if (view.runtime && typeof view.runtime.saveCitation === 'function') {
          view.runtime.saveCitation(citation.citationObject).then((result) => {
            tr = this.updateCitationObjectinCitationNote(
              view,
              view.state,
              tr,
              citation
            );
            view.dispatch(tr);
          });
        }
      }
    }
  }

  // [FS] IRAD-1251 2021-03-23
  // to save the citation use object in the node attribute
  updateCitationUseObject(state, selection, tr, citation) {
    if (!citation.isCitationObject) {
      const from = selection.$from.before(1);
      const to = selection.$to.after(1) - 1;
      const node = getNode(state, this.node.attrs.from, this.node.attrs.to, tr);
      const newattrs = Object.assign({}, node.attrs);
      newattrs['citationUseObject'] = citation.citationUseObject;
      tr = tr.setNodeMarkup(from, undefined, newattrs);
    }
    return tr;
  }

  updateCitationObjectinCitationNote(view, state, tr, citation) {
    const newattrs = Object.assign({}, this.node.attrs);
    newattrs['citationObject'] = citation.citationObject;
    newattrs['citationUseObject'] = citation.citationUseObject;
    tr = tr.setNodeMarkup(this.getPos(), undefined, newattrs);
    return tr;
  }

  destroy() {
    this._popup && this._popup.close();
    // this._editor && this._editor.close();
  }

  deselectNode() {
    this.dom.classList.remove('ProseMirror-selectednode');
    this._popup && this._popup.close();
    if (this.innerView) this.close();
    this.hideSourceText(false, this.outerView);
  }
  open() {
    // Append a tooltip to the outer node
    const tooltip = this.dom.appendChild(document.createElement('div'));
    tooltip.className = 'citationnote-tooltip';
    // [FS] IRAD-1251 2021-03-22
    // the background color and border color changes for citation source text pop up
    tooltip.style.border = '1px solid transparent !important';
    tooltip.style.background = 'transparent !important';
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
          // citationnote is node-selected (and thus DOM-selected) when
          // the parent editor is focused.
          if (this.outerView.hasFocus()) this.innerView.focus();
        },
      },
    });
    this.innerView.dom.contentEditable = false;
    const footNoteDiv = this.innerView.dom.style;
    // [FS] IRAD-1251 2021-03-22
    // style changes for the citation source text
    footNoteDiv.setProperty('font-size', '13px');
    footNoteDiv.setProperty('font-family', 'arial sans-serif');
    footNoteDiv.setProperty('padding-left', '10px');
    footNoteDiv.setProperty('padding-top', '3px');
    footNoteDiv.setProperty('padding-bottom', '3px');
    footNoteDiv.setProperty('right', '250px');
  }

  close() {
    this.innerView.destroy();
    this.innerView = null;
    this.dom.textContent = '';
  }
  dispatchInner(tr) {
    const {state, transactions} = this.innerView.state.applyTransaction(tr);
    this.innerView.updateState(state);

    if (!tr.getMeta('fromOutside')) {
      const outerTr = this.outerView.state.tr,
        offsetMap = StepMap.offset(this.getPos() + 1);
      for (let i = 0; i < transactions.length; i++) {
        const steps = transactions[i].steps;
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
      const state = this.innerView.state;
      const start = node.content.findDiffStart(state.doc.content);
      if (start != null) {
        let {a: endA, b: endB} = node.content.findDiffEnd(state.doc.content);
        const overlap = start - Math.min(endA, endB);
        if (overlap > 0) {
          endA += overlap;
          endB += overlap;
        }
        // this.innerView.dispatch(
        //   state.tr
        //     .replace(start, endB, node.slice(start, endA))
        //     .setMeta('fromOutside', true)
        // );
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

export default CitationView;
