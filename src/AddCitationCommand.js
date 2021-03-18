// @flow

import CitationDialog from './ui/CitationDialog';
import UICommand from './ui/UICommand';
import applyMark from './applyMark';
import createPopUp from './ui/createPopUp';
import {atViewportCenter} from './ui/PopUpPosition';
import isTextStyleMarkCommandEnabled from './isTextStyleMarkCommandEnabled';
import nullthrows from 'nullthrows';
import {EditorState, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {MARK_TEXT_COLOR} from './MarkNames';
import {Transform} from 'prosemirror-transform';
import {FOOTNOTE} from './NodeNames';
import {Node, Fragment, Schema} from 'prosemirror-model';
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

  // creates a sample style object
  createCitationObject(editorView, mode) {
    return {
      citaionUseObject: {
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
        documentTitleCapco: 'TS',
        documentTitle: 'Document title',
        dateAccessed: '',
        hyperLink: '',
      },
      sourceText: '',
      mode: mode, //0 = new , 1- modify, 2- delete
      editorView: editorView,
      isCitationObject: editorView.state.selection.empty, // if text not selected, then citationObject else citaionUseObject
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
        if (view.runtime && typeof view.runtime.saveCitation === 'function') {
          view.runtime.saveCitation(citation.citationObject).then((result) => {

            tr = this.createFootNoteForCitation(view,state,tr,citation);
            // TODO: // save the citation use object to node
            dispatch(tr);
          });
        }
      }

      view && view.focus();
    }

    return false;
  };

  createFootNoteForCitation(view,state,tr,citation){
    if (!view.state.selection.empty) {
      // let from = state.tr.selection.from;               
      const textNode = state.schema.text(citation.sourceText);
      textNode.content ='';
      const footnote = state.schema.nodes[FOOTNOTE];
      const newattrs = Object.assign({}, footnote.attrs);

      newattrs['nodeSelection'] = state.tr.selection;
      newattrs['citation'] = citation;
      
      const footnoteNode = footnote.create(null, textNode, null);
      // tr = tr.setNodeMarkup(state.tr.selection.to, undefined, newattrs);
      // tr = tr.insert(state.selection, Fragment.from(footnoteNode),state.selection);   
      tr = tr.insert(state.selection.$to.after(1) - 1, Fragment.from(footnoteNode),state.selection);   

    }
    return tr;
  }
}

export default AddCitationCommand;
