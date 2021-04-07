// @flow

import CitationDialog from './ui/CitationDialog';
import UICommand from './ui/UICommand';
import createPopUp from './ui/createPopUp';
import isTextStyleMarkCommandEnabled from './isTextStyleMarkCommandEnabled';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import {MARK_TEXT_COLOR} from './MarkNames';
import {CITATIONNOTE} from './NodeNames';
import {Fragment} from 'prosemirror-model';
import {getNode} from './CustomStyleCommand';
import type {CitationProps} from './Types';
import './ui/citation-note.css';

class AddCitationCommand extends UICommand {
  _popUp = null;
  _color = '';

  constructor(color: ?string) {
    super();
    this._color = color;
  }
  isEnabled = (state: EditorState): boolean => {
    return isTextStyleMarkCommandEnabled(state, MARK_TEXT_COLOR);
  };

  // [FS] IRAD-1251 2021-03-05
  // creates a sample style object
  createCitationObject(editorView: EditorView, mode: number) {
    const citationUseObject = JSON.stringify({
      overallCitationCAPCO: 'TBD',
      pageTitle: '',
      extractedInfoCAPCO: 'TBD',
      descriptionCAPCO: 'N/A',
      description: '',
      citationObjectRefId: '',
      pageStart: 0,
      pageEnd: 0,
    });
    const citationObject = JSON.stringify({
      overallDocumentCapco: 'TBD',
      author: '',
      authorTitle: '',
      referenceId: 'REF-1001',
      publishedDate: '',
      publishedDateTitle: '',
      documentTitleCapco: 'TBD',
      documentTitle: '',
      dateAccessed: '',
      hyperLink: '',
    });
    return {
      citationUseObject: JSON.parse(citationUseObject),
      citationObject: JSON.parse(citationObject),
      sourceText: '',
      mode: mode, //0 = new , 1- modify, 2- delete
      editorView: editorView,
      isCitationObject: editorView ? editorView.state.selection.empty : true, // if text not selected, then citationObject else citationUseObject
    };
  }

  waitForUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    event: ?SyntheticEvent<>
  ): Promise<any> => {
    if (this._popUp) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve) => {
      this._popUp = createPopUp(
        CitationDialog,
        this.createCitationObject(view, 1),
        {
          modal: true,
          autoDismiss: false,
          onClose: (val) => {
            if (this._popUp) {
              this._popUp = null;
              resolve(val);
            }
          },
        }
      );
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    citation
  ): boolean => {
    if (dispatch) {
      const {selection} = state;
      let {tr} = state;
      tr = tr.setSelection(selection);
      if (citation) {
        // save the citation use object to node
        tr = this.saveCitationUseObject(state, tr, citation);
        if (
          view &&
          view.runtime &&
          typeof view.runtime.saveCitation === 'function'
        ) {
          view.runtime.saveCitation(citation.citationObject).then((result) => {
            tr = this.createFootNoteForCitation(view, state, tr, citation);
            dispatch(tr);
          });
        }
      }

      view && view.focus();
    }

    return false;
  };

  createFootNoteForCitation(
    view: EditorView,
    state: EditorState,
    tr: Transform,
    citation: CitationProps
  ) {
    if (!view.state.selection.empty) {
      // let from = state.tr.selection.from;
      const textNode = state.schema.text(citation.sourceText);
      textNode.content = '';
      const citationNote = state.schema.nodes[CITATIONNOTE];
      const newattrs = Object.assign({}, citationNote.attrs);
      newattrs['from'] = state.tr.selection.from;
      newattrs['to'] = state.tr.selection.to;
      newattrs['citationObject'] = JSON.stringify(citation.citationObject);
      newattrs['citationUseObject'] = JSON.stringify(
        citation.citationUseObject
      );

      const citationNoteNode = citationNote.create(null, textNode, null);
      tr = tr.insert(
        state.selection.$to.after(1) - 1,
        Fragment.from(citationNoteNode),
        state.selection
      );
      tr = tr.setNodeMarkup(
        state.selection.$to.after(1) - 1,
        undefined,
        newattrs
      );
    }
    return tr;
  }
  // [FS] IRAD-1251 2021-03-23
  // to save the citation use object in the node attribute
  saveCitationUseObject(
    state: EditorState,
    tr: Transform,
    citation: CitationProps
  ) {
    if (!citation.isCitationObject) {
      const from = state.selection.$from.before(1);
      const to = state.selection.$to.after(1) - 1;
      const node = getNode(state, from, to, tr);
      if (node) {
        const newattrs = Object.assign({}, node.attrs);
        newattrs['citationUseObject'] = JSON.stringify(
          citation.citationUseObject
        );
        tr = tr.setNodeMarkup(from, undefined, newattrs);
      }
    }
    return tr;
  }
}

export default AddCitationCommand;
