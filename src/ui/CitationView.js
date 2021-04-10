// @flow

import {StepMap, Transform} from 'prosemirror-transform';
import {Node} from 'prosemirror-model';
import {keymap} from 'prosemirror-keymap';
import {undo, redo} from 'prosemirror-history';
import {EditorView} from 'prosemirror-view';
import {EditorState} from 'prosemirror-state';
import CitationSubMenu from './CitationSubMenu';
import {atAnchorTopCenter} from './PopUpPosition';
import createPopUp from './createPopUp';
import type {PopUpHandle} from './createPopUp';
import {DOMSerializer} from 'prosemirror-model';
import {MARK_UNDERLINE, MARK_TEXT_HIGHLIGHT} from '../MarkNames';
import CitationDialog from './CitationDialog';
import {getNode} from '../CustomStyleCommand';
import './citation-note.css';

class CitationView {
  node: Node = null;
  outerView: EditorView = null;
  getPos: any = null;
  _popUp: PopUpHandle = null;
  innerView: EditorView = null;

  constructor(node: Node, view: EditorView, getPos: any) {
    // We'll need these later
    this.node = node;
    this.outerView = view;
    this.getPos = getPos;
    // [FS] IRAD-1251 2021-04-05
    // Use PM DomSerializer to create element so that attributes including dataset are properly created.
    const spec = DOMSerializer.renderSpec(
      document,
      this.node.type.spec.toDOM(this.node)
    );
    this.dom = spec.dom;
    this.dom.className = 'citationnote';
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
    // this.innerView = null;
    // this._popup = null;
    this._anchorEl = null;
  }

  showSourceText(customEditorView: any, e: any) {
    if (this.dom.classList) {
      this.dom.classList.add('ProseMirror-selectednode');
      if (!this.innerView) this.open(e);
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

  hideSourceText(selected: boolean) {
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
            tr = this.removeCitationMark(
              tr,
              this.node.attrs.from,
              this.node.attrs.to
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
  // Removes the text highlight and text underline of citation applied text
  removeCitationMark(tr: Transform, from: number, to: number) {
    const markType = this.outerView.state.schema.marks[MARK_UNDERLINE];
    const highLightMarkType = this.outerView.state.schema.marks[
      MARK_TEXT_HIGHLIGHT
    ];
    tr = tr.removeMark(from, to, markType);
    tr = tr.removeMark(from, to, highLightMarkType);
    return tr;
  }

  selectNode() {
    this.hideSourceText(true);
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
      href: this.node.attrs.citationObject
        ? this.node.attrs.citationObject.hyperLink
        : null,
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

  createCitationObject(editorView: EditorView, mode: string) {
    return {
      citationUseObject: JSON.parse(this.node.attrs.citationUseObject),
      citationObject: JSON.parse(this.node.attrs.citationObject),
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
      tr = this.removeCitationMark(
        tr,
        selection.node.attrs.from,
        selection.node.attrs.to
      );
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
  updateCitation(view: EditorView, citation: any) {
    if (view.dispatch) {
      const {selection} = view.state;
      let {tr} = view.state;
      tr = tr.setSelection(selection);
      if (citation) {
        // save the citation use object to node
        tr = this.updateCitationUseObject(view.state, tr, citation);
        if (view.runtime && typeof view.runtime.saveCitation === 'function') {
          view.runtime.saveCitation(citation.citationObject).then((result) => {
            tr = this.updateCitationObjectInCitationNote(
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
  updateCitationUseObject(state: EditorState, tr: Transform, citation: any) {
    if (!citation.isCitationObject) {
      const {selection} = state;
      const from = selection.$from.before(1);
      const node = getNode(state, this.node.attrs.from, this.node.attrs.to, tr);
      const newattrs = Object.assign({}, node.attrs);
      newattrs['citationUseObject'] = JSON.stringify(
        citation.citationUseObject
      );
      tr = tr.setNodeMarkup(from, undefined, newattrs);
    }
    return tr;
  }

  updateCitationObjectInCitationNote(tr: Transform, citation: any) {
    const newattrs = Object.assign({}, this.node.attrs);
    newattrs['citationObject'] = JSON.stringify(citation.citationObject);
    newattrs['citationUseObject'] = JSON.stringify(citation.citationUseObject);
    newattrs['sourceText'] = citation.sourceText;
    tr = tr.setNodeMarkup(this.getPos(), undefined, newattrs);
    // reset the citation sourceText to the citationnote node.
    this.node.content.content[0].text = citation.sourceText;
    return tr;
  }

  destroy() {
    this._popup && this._popup.close();
  }

  deselectNode() {
    this.dom.classList.remove('ProseMirror-selectednode');
    this._popup && this._popup.close();
    if (this.innerView) this.close();
    this.hideSourceText(false);
  }
  open(e: any) {
    const MAX_CLIENT_WIDTH = 975;
    const RIGHT_MARGIN_ADJ = 50;
    const POSITION_ADJ = -110;
    // Append a tooltip to the outer node
    const parent = document.getElementsByClassName(
      'ProseMirror czi-prosemirror-editor'
    )[0];
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

    const width_diff = e.clientX - parent.clientWidth;
    const counter = e.clientX > MAX_CLIENT_WIDTH ? RIGHT_MARGIN_ADJ : 0;
    if (width_diff > POSITION_ADJ && width_diff < tooltip.clientWidth) {
      footNoteDiv.setProperty('right', parent.offsetLeft + counter + 'px');
    }
    if (window.screen.availHeight - e.clientY < 170) {
      footNoteDiv.setProperty('bottom', '114px');
    }
  }

  close() {
    this.innerView.destroy();
    this.innerView = null;
    this.dom.textContent = '';
  }
  dispatchInner(tr: Transform) {
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
  update(node: Node) {
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

  stopEvent(event: any) {
    return this.innerView && this.innerView.dom.contains(event.target);
  }

  ignoreMutation() {
    return true;
  }
}

export default CitationView;
