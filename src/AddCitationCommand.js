// @flow

import CitationDialog from './ui/CitationDialog';
import UICommand from './ui/UICommand';
import createPopUp from './ui/createPopUp';
import isTextStyleMarkCommandEnabled from './isTextStyleMarkCommandEnabled';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {MARK_TEXT_COLOR} from './MarkNames';
import {Transform} from 'prosemirror-transform';
import {CITATIONNOTE} from './NodeNames';
import {Fragment} from 'prosemirror-model';
import {getNode} from './CustomStyleCommand';
import './ui/add-citation.css';

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
  createCitationObject(editorView, mode) {
    return {
      citationUseObject: {
        overallCitationCAPCO: 'TBD',
        pageTitle: '',
        extractedInfoCAPCO: 'TBD',
        descriptionCAPCO: 'TBD',
        description: 'sample description',
        citationObjectRefId: '',
        pageStart: 0,
        pageEnd: 0,
      },
      citationObject: {
        overallDocumentCapco: 'TBD',
        author: '',
        authorTitle: 'Title',
        referenceId: 'ref-1001',
        publishedDate: '',
        publishedDateTitle: '',
        documentTitleCapco: 'TBD',
        documentTitle: 'Document title',
        dateAccessed: '',
        hyperLink: '',
      },
      sourceText: '',
      mode: mode, //0 = new , 1- modify, 2- delete
      editorView: editorView,
      isCitationObject: editorView.state.selection.empty, // if text not selected, then citationObject else citationUseObject
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
        this.createCitationObject(view, '1'),
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
        tr = this.saveCitationUseObject(state, selection, tr, citation);
        if (view.runtime && typeof view.runtime.saveCitation === 'function') {
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

  createFootNoteForCitation(view, state, tr, citation) {
    if (!view.state.selection.empty) {
      // let from = state.tr.selection.from;
      const textNode = state.schema.text(citation.sourceText);
      textNode.content = '';
      const citationNote = state.schema.nodes[CITATIONNOTE];
      const newattrs = Object.assign({}, citationNote.attrs);       
      newattrs['from'] = state.tr.selection.from;
      newattrs['to'] = state.tr.selection.to;
      newattrs['citationObject'] = citation.citationObject;
      newattrs['citationUseObject'] = citation.citationUseObject;

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
  saveCitationUseObject(state, selection, tr, citation) {
    if (!citation.isCitationObject) {
      const from = selection.$from.before(1);
      const to = selection.$to.after(1) - 1;
      const node = getNode(state, from, to, tr);
      const newattrs = Object.assign({}, node.attrs);
      newattrs['citationUseObject'] = citation.citationUseObject;
      tr = tr.setNodeMarkup(from, undefined, newattrs);
    }
    return tr;
  }
}

export default AddCitationCommand;
