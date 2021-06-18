// @flow
import applyDevTools from 'prosemirror-dev-tools';
import { EditorState, TextSelection, Plugin } from 'prosemirror-state';
import { Node } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';

import convertFromJSON from '../convertFromJSON';
import RichTextEditor from '../ui/RichTextEditor';
import uuid from '../uuid';
import SimpleConnector from './SimpleConnector';
import CollabConnector from './CollabConnector';
import { EMPTY_DOC_JSON } from '../createEmptyEditorState';
import type { EditorRuntime } from '../Types';
import createPopUp from '../ui/createPopUp';
import { atViewportCenter } from '../ui/PopUpPosition';
import AlertInfo from '../ui/AlertInfo';
import { SetDocAttrStep } from '@modusoperandi/licit-doc-attrs-step';
import './licit.css';
import DefaultEditorPlugins from '../buildEditorPlugins';
import { Schema } from 'prosemirror-model';
import EditorMarks from '../EditorMarks';
import EditorNodes from '../EditorNodes';

const ATTR_OBJID = 'objectId';
const ATTR_OBJMETADATA = 'objectMetaData';
/**
 * LICIT properties:
 *  docID {number} [0] Collaborative Doument ID
 *  debug {boolean} [false] To enable/disable ProseMirror Debug Tools, available only in development.
 *  width {string} [100%] Width of the editor.
 *  height {height} [100%] Height of the editor.
 *  readOnly {boolean} [false] To enable/disable editing mode.
 *  onChange {@callback} [null] Fires after each significant change.
 *      @param data {JSON} Modified document data.
 *  onReady {@callback} [null] Fires when the editor is fully ready.
 *      @param ref {LICIT} Rerefence of the editor.
 *  data {JSON} [null] Document data to be loaded into the editor.
 *  disabled {boolean} [false] Disable the editor.
 *  embedded {boolean} [false] Disable/Enable inline behaviour.
 *  plugins [plugins] External Plugins into the editor.
 */
class Licit extends React.Component<any, any> {
  _runtime: EditorRuntime;
  _connector: any;
  _clientID: string;
  _editorView: EditorView; // This will be handy in updating document's content.
  _skipSCU: boolean; // Flag to decide whether to skip shouldComponentUpdate
  _defaultEditorSchema: Schema;
  _defaultEditorPlugins: Array<Plugin>;

  _popUp = null;

  /**
   * Provides access to prosemirror view.
   */
  get editorView(): EditorView {
    return this._editorView;
  }

  constructor(props: any, context: any) {
    super(props, context);
    this.state = { loaded: false };
    setTimeout(this.loadStyles.bind(this), 100, props);
  }

  loadStyles(props: any) {
    const runtime = props.runtime || null;
    // ATTN: Custom styles MUST be loaded before rendering Licit
    if (runtime && typeof runtime.getStylesAsync === 'function') {
      runtime.fetchStyles().then(
        (result) => {
          this.initialize(props);
        },
        (error) => {
          // Here Licit is loaded without style list.
          console.log('Failed to load custom styles: ' + error);
          this.initialize(props);
        }
      );
    }
  }

  initialize(props: any) {
    this._clientID = uuid();
    this._editorView = null;
    this._skipSCU = true;

    const noop = function () {};

    // [FS] IRAD-981 2020-06-10
    // Component's configurations.
    const docID = props.docID || 0; // 0 < means collaborative.
    const collaborative = 0 < docID;
    const debug = props.debug || false;
    // Default width and height to undefined
    const width = props.width || undefined;
    const height = props.height || undefined;
    const onChangeCB =
      typeof props.onChange === 'function' ? props.onChange : noop;
    const onReadyCB =
      typeof props.onReady === 'function' ? props.onReady : noop;
    const readOnly = props.readOnly || false;
    const data = props.data || null;
    const disabled = props.disabled || false;
    const embedded = props.embedded || false; // [FS] IRAD-996 2020-06-30
    // [FS] 2020-07-03
    // Handle Image Upload from Angular App
    const runtime = props.runtime || null;
    const plugins = props.plugins || null;

    this._defaultEditorSchema = new Schema({
      nodes: EditorNodes,
      marks: EditorMarks,
    });
    this._defaultEditorPlugins = new DefaultEditorPlugins(
      this._defaultEditorSchema
    ).get();

    let editorState = convertFromJSON(
      data,
      null,
      this._defaultEditorSchema,
      plugins,
      this._defaultEditorPlugins
    );
    // [FS] IRAD-1067 2020-09-19
    // The editorState will return null if the doc Json is mal-formed
    if (null === editorState) {
      editorState = convertFromJSON(
        EMPTY_DOC_JSON,
        null,
        this._defaultEditorSchema,
        plugins,
        this._defaultEditorPlugins
      );
      this.showAlert();
    }

    const setState = this.setState.bind(this);
    this._connector = collaborative
      ? new CollabConnector(
          editorState,
          setState,
          {
            docID,
          },
          this._defaultEditorSchema,
          this._defaultEditorPlugins
        )
      : new SimpleConnector(editorState, setState);

    const loaded = true;

    // FS IRAD-989 2020-18-06
    // updating properties should automatically render the changes
    this.setState({
      docID,
      data,
      editorState,
      width,
      height,
      readOnly,
      onChangeCB,
      onReadyCB,
      debug,
      disabled,
      embedded,
      runtime,
      loaded,
    });
    // FS IRAD-1040 2020-26-08
    // Get the modified schema from editorstate and send it to collab server
    if (this._connector.updateSchema) {
      this._connector.updateSchema(this.state.editorState.schema);
    }
  }

  // [FS] IRAD-1067 2020-09-19
  // Alert funtion to show document is corrupted
  showAlert() {
    const anchor = null;
    this._popUp = createPopUp(AlertInfo, null, {
      anchor,
      position: atViewportCenter,
      onClose: (val) => {
        if (this._popUp) {
          this._popUp = null;
        }
      },
    });
  }

  resetCounters(transaction: Transform) {
    for (let index = 1; index <= 10; index++) {
      const counterVar = 'set-cust-style-counter-' + index;
      const setCounterVal = window[counterVar];
      if (setCounterVal) {
        delete window[counterVar];
      }
    }
    this.setCounterFlags(transaction, true);
  }

  setCounterFlags(transaction: Transform, reset: boolean) {
    let modified = false;
    let counterFlags = null;
    const existingCFlags = transaction.doc.attrs.counterFlags;
    if (reset && !existingCFlags) {
      return;
    }

    for (let index = 1; index <= 10; index++) {
      const counterVar = 'set-cust-style-counter-' + index;

      const setCounterVal = window[counterVar];
      if (setCounterVal) {
        if (!counterFlags) {
          counterFlags = {};
        }
        counterFlags[counterVar] = true;

        if (!existingCFlags) {
          modified = true;
        }
      }
      if (!modified) {
        if (existingCFlags) {
          if (setCounterVal) {
            modified = undefined == existingCFlags[counterVar];
          } else {
            modified = undefined != existingCFlags[counterVar];
          }
        } else {
          modified = setCounterVal;
        }
      }
    }

    if (modified) {
      const tr = this._editorView.state.tr.step(
        new SetDocAttrStep('counterFlags', counterFlags)
      );
      this._editorView.dispatch(tr);
    }
  }

  getDeletedArtifactIds() {
    if (this._connector.getDeletedArtifactIds) {
      this._connector.getDeletedArtifactIds(this.state.editorState.schema);
    }
  }

  isNodeHasAttribute(node: Node, attrName: string) {
    return node.attrs && node.attrs[attrName];
  }

  setContent = (content: any = {}): void => {
    const { doc, schema } = this._connector.getState();
    let { tr } = this._connector.getState();
    const document = content
      ? schema.nodeFromJSON(content)
      : schema.nodeFromJSON(EMPTY_DOC_JSON);

    const selection = TextSelection.create(doc, 0, doc.content.size);

    tr = tr.setSelection(selection).replaceSelectionWith(document, false);
    // [FS] IRAD-1092 2020-12-03
    // set the value for object metadata  and objectId
    tr = this.isNodeHasAttribute(document, ATTR_OBJMETADATA)
      ? tr.step(
          new SetDocAttrStep(ATTR_OBJMETADATA, document.attrs.objectMetaData)
        )
      : tr;
    tr = this.isNodeHasAttribute(document, ATTR_OBJID)
      ? tr.step(new SetDocAttrStep(ATTR_OBJID, document.attrs.objectId))
      : tr;

    this._skipSCU = true;
    this._editorView.dispatch(tr);
  };

  shouldComponentUpdate(nextProps: any, nextState: any) {
    // Only interested if properties are set from outside.
    if (!this._skipSCU) {
      this._skipSCU = false;
      let dataChanged = false;

      // Compare data, if found difference, update editorState
      if (this.state.data !== nextState.data) {
        dataChanged = true;
      } else if (null === nextState.data) {
        if (
          this.state.editorState.doc.textContent &&
          0 < this.state.editorState.doc.textContent.trim().length
        ) {
          dataChanged = true;
        }
      }

      if (dataChanged) {
        // data changed, so update document content
        this.setContent(nextState.data);
      }

      if (this.state.docID !== nextState.docID) {
        // Collaborative mode changed
        const collabEditing = nextState.docID != 0;
        const editorState = this._connector.getState();
        const setState = this.setState.bind(this);
        const docID = nextState.docID || 1;
        // create new connector
        this._connector = collabEditing
          ? new CollabConnector(
              editorState,
              setState,
              {
                docID,
              },
              this._defaultEditorSchema,
              this._defaultEditorPlugins
            )
          : new SimpleConnector(editorState, setState);
      }
    }

    return true;
  }

  render(): React.Element<any> {
    if (this.state.loaded) {
      const {
        editorState,
        width,
        height,
        readOnly,
        disabled,
        embedded,
        runtime,
      } = this.state;
      // [FS] IRAD-978 2020-06-05
      // Using 100vw & 100vh (100% viewport) is not ideal for a component which is expected to be a part of a page,
      // so changing it to 100%  width & height which will occupy the area relative to its parent.
      return (
        <RichTextEditor
          disabled={disabled}
          editorState={editorState}
          embedded={embedded}
          height={height}
          onChange={this._onChange}
          onReady={this._onReady}
          readOnly={readOnly}
          runtime={runtime}
          width={width}
        />
      );
    } else {
      return <div>Loading Styles...</div>;
    }
  }

  _onChange = (data: { state: EditorState, transaction: Transform }): void => {
    const { transaction } = data;

    /*
     ** ProseMirror Debug Tool's Snapshot creates a new state and sets that to editor view's state.
     ** This results in the connector's state as an orphan and thus transaction mismatch error.
     ** To resolve check and update the connector's state to keep in sync.
     */

    if (this._editorView) {
      const isSameState =
        this._connector._editorState == this._editorView.state;
      let invokeOnEdit = false;

      if (!isSameState) {
        this._connector._editorState = this._editorView.state;
        invokeOnEdit = true;
      } else {
        // [FS] IRAD-1264 2021-03-19
        // check if in non-collab mode.
        if (!(this._connector instanceof CollabConnector)) {
          invokeOnEdit = true;
        }
      }
      if (invokeOnEdit) {
        // [FS] IRAD-1236 2020-03-05
        // Only need to call if there is any difference in collab mode OR always in non-collab mode.
        this._connector.onEdit(transaction, this._editorView);
      }

      if (transaction.docChanged) {
        const docJson = transaction.doc.toJSON();
        let isEmpty = false;

        if (docJson.content && docJson.content.length === 1) {
          if (
            !docJson.content[0].content ||
            (docJson.content[0].content &&
              docJson.content[0].content[0].text &&
              '' === docJson.content[0].content[0].text.trim())
          ) {
            isEmpty = true;
          }
        }

        // setCFlags is/was always the opposite of isEmpty.
        if (isEmpty) {
          this.resetCounters(transaction);
        } else {
          this.setCounterFlags(transaction, false);
        }

        // Changing 2nd parameter from boolean to object was not in any way
        // backwards compatible. Any conditional logic placed on isEmpty was
        // broken. Reverting that change, then adding view as a 3rd parameter.
        this.state.onChangeCB(docJson, isEmpty, this._editorView);

        this.closeOpenedPopupModels();
      }
    }
  };
  // [FS] IRAD-1173 2021-02-25
  // Bug fix: Transaction mismatch error when a dialog is opened and keep typing.
  closeOpenedPopupModels() {
    const element = document.getElementsByClassName('czi-pop-up-element')[0];
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  }

  _onReady = (editorView: EditorView): void => {
    // [FS][06-APR-2020][IRAD-922]
    // Showing focus in the editor.
    const { state, dispatch } = editorView;
    this._editorView = editorView;
    const tr = state.tr;
    const doc = state.doc;
    const trx = tr.setSelection(TextSelection.create(doc, 0, doc.content.size));
    dispatch(trx.scrollIntoView());
    editorView.focus();

    if (this.state.onReadyCB) {
      this.state.onReadyCB(this);
    }

    if (this.state.debug) {
      window.debugProseMirror = () => {
        applyDevTools(editorView);
      };
      window.debugProseMirror();
    }
  };

  /**
   * LICIT properties:
   *  docID {number} [0] Collaborative Doument ID
   *  debug {boolean} [false] To enable/disable ProseMirror Debug Tools, available only in development.
   *  width {string} [100%] Width of the editor.
   *  height {height} [100%] Height of the editor.
   *  readOnly {boolean} [false] To enable/disable editing mode.
   *  onChange {@callback} [null] Fires after each significant change.
   *      @param data {JSON} Modified document data.
   *  onReady {@callback} [null] Fires when the editor is fully ready.
   *      @param ref {LICIT} Rerefence of the editor.
   *  data {JSON} [null] Document data to be loaded into the editor.
   *  disabled {boolean} [false] Disable the editor.
   *  embedded {boolean} [false] Disable/Enable inline behaviour.
   */
  setProps = (props: any): void => {
    if (this.state.readOnly) {
      // It should be possible to load content into the editor in readonly as well.
      // It should not be necessary to make the component writable any time during the process
      const propsCopy = {};
      this._skipSCU = true;
      Object.assign(propsCopy, props);
      // make writable without content change
      propsCopy.readOnly = false;
      delete propsCopy.data;
      this.setState(propsCopy);
    }
    // Need to go through shouldComponentUpdate lifecycle here, when updated from outside,
    // so that content is modified gracefully using transaction so that undo/redo works too.
    this._skipSCU = false;
    this.setState(props);
  };
}

export default Licit;
