// @flow
import { EditorState, TextSelection, Plugin } from 'prosemirror-state';
import { Node, Schema } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { stringify } from 'flatted';

import convertFromJSON from '../convertFromJSON.js';
import RichTextEditor from '../ui/RichTextEditor.js';
import uuid from '../uuid.js';
import SimpleConnector from './SimpleConnector.js';
import CollabConnector from './CollabConnector.js';
import {
  EMPTY_DOC_JSON
} from '../createEmptyEditorState.js';
import type {
  EditorRuntime
} from '../Types.js';
import {
  createPopUp,
  atViewportCenter,
} from '@modusoperandi/licit-ui-commands';
import AlertInfo from '../ui/AlertInfo.js';
import { SetDocAttrStep } from '@modusoperandi/licit-doc-attrs-step';
import './licit.css';
import DefaultEditorPlugins from '../buildEditorPlugins.js';
import EditorMarks from '../EditorMarks.js';
import EditorNodes from '../EditorNodes.js';
import convertFromHTML from '../convertFromHTML.js';

export const DataType = Object.freeze({
  JSON: Symbol('json'),
  HTML: Symbol('html'),
});

/**
 * LICIT properties:
 *  docID {string} [] Collaborative Doument ID
 *  collabServiceURL {string} [/collaboration-service] Collaboration Service URL
 *  debug {boolean} [false] To enable/disable ProseMirror Debug Tools, available only in development.
 *  width {string} [100%] Width of the editor.
 *  height {string} [100%] Height of the editor.
 *  readOnly {boolean} [false] To enable/disable editing mode.
 *  onChange {@callback} [null] Fires after each significant change.
 *      @param data {JSON} Modified document data.
 *  onReady {@callback} [null] Fires when the editor is fully ready.
 *      @param ref {LICIT} Rerefence of the editor.
 *  data {JSON|HTML} [null] Document data to be loaded into the editor.
 *  dataType {JSON|HTML} [JSON] Document data to be loaded into the editor.
 *  disabled {boolean} [false] Disable the editor.
 *  embedded {boolean} [false] Disable/Enable inline behaviour.
 *  plugins [plugins] External Plugins into the editor.
 */
class Licit extends React.Component<any, any> {
  _runtime: EditorRuntime;
  _connector: SimpleConnector;
  _clientID: string;
  _editorView: EditorView; // This will be handy in updating document's content.
  _skipSCU: boolean; // Flag to decide whether to skip shouldComponentUpdate
  _defaultEditorSchema: Schema;
  _defaultEditorPlugins: Array<Plugin>;
  _pasteJSONPlugin: Plugin;

  _popUp = null;

  /**
   * Provides access to prosemirror view.
   */
  get editorView(): EditorView {
    return this._editorView;
  }

  constructor(props: any, context: any) {
    super(props, context);
    this.initialize(props);
  }

  initialize(props: any) {
    this._clientID = uuid();
    this._editorView = null;
    this._skipSCU = true;

    const noop = function () {};

    // [FS] IRAD-981 2020-06-10
    // Component's configurations.
    // [FS] IRAD-1552 2021-08-26
    // Collaboration server / client should allow string values for document identifiers.
    const docID = props.docID || ''; // Empty means collaborative.
    const collaborative = docID !== '';
    // [FS] IRAD-1553 2021-08-26
    // Configurable Collaboration Service URL.
    const collabServiceURL = props.collabServiceURL || '/collaboration-service';
    const debug = props.debug || false;
    // Default width and height to undefined
    const width = props.width || undefined;
    const height = props.height || undefined;
    const onChangeCB =
      typeof props.onChange === 'function' ? props.onChange : noop;
    const onReadyCB =
      typeof props.onReady === 'function' ? props.onReady : noop;
    const readOnly = props.readOnly || false;
    let data = props.data || null;
    const dataType = props.dataType || DataType.JSON;
    const disabled = props.disabled || false;
    const embedded = props.embedded || false; // [FS] IRAD-996 2020-06-30
    // [FS] 2020-07-03
    // Handle Image Upload from Angular App
    const runtime = props.runtime || null;
    const styleRuntime = props.styleRuntime || null;
    const plugins = props.plugins || null;
    // This flag decides whether DataType.HTML check is needed when
    // changing document. If it forcefully done, it is not needed, otherwise needed.
    this.skipDataTypeCheck = false;

    this._defaultEditorSchema = new Schema({
      nodes: EditorNodes,
      marks: EditorMarks,
    });
    this._defaultEditorPlugins = new DefaultEditorPlugins(
      this._defaultEditorSchema
    ).get();
    this._pasteJSONPlugin = null;

    const editorState = this.initEditorState(plugins, dataType, data);
    data = editorState.doc;

    const setState = this.setState.bind(this);
    this._connector = collaborative
      ? new CollabConnector(
          editorState,
          setState,
          {
            docID,
            collabServiceURL,
          },
          this._defaultEditorSchema,
          this._defaultEditorPlugins,
          // [FS] IRAD-1578 2021-09-27
          this.onReady.bind(this)
        )
      : new SimpleConnector(editorState, setState);

    this._connector._dataDefined = !!props.data;

    // FS IRAD-989 2020-18-06
    // updating properties should automatically render the changes

    this.state = {
      docID,
      collabServiceURL,
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
      styleRuntime,
      dataType,
    };

    // FS IRAD-1040 2020-26-08
    // Get the modified schema from editorstate and send it to collab server
    if (this._connector.updateSchema) {
      // Use known editorState to update schema.
      this._connector.updateSchema(editorState.schema, data);
    }
  }

  initEditorState(plugins: Array<Plugin>, dataType: DataType, data: any) {
    let editorState = null;
    const effectivePlugins = this.getEffectivePlugins(
      this._defaultEditorSchema,
      this._defaultEditorPlugins,
      plugins
    );
    this._pasteJSONPlugin = effectivePlugins.pasteJSONPlugin;
    if (DataType.JSON === dataType) {
      editorState = convertFromJSON(
        data,
        null,
        effectivePlugins.schema,
        effectivePlugins.plugins
      );
      // [FS] IRAD-1067 2020-09-19
      // The editorState will return null if the doc Json is mal-formed
      if (null === editorState) {
        editorState = convertFromJSON(
          EMPTY_DOC_JSON,
          null,
          effectivePlugins.schema,
          effectivePlugins.plugins
        );
        this.showAlert();
      }
    } else {
      editorState = convertFromHTML(
        data,
        effectivePlugins.schema,
        effectivePlugins.plugins
      );
    }

    return editorState;
  }

  getEffectivePlugins(
    schema: Schema,
    defaultPlugins: Array<Plugin>,
    plugins: Array<Plugin>
  ): { plugins: Array<Plugin>, schema: Schema, pasteJSONPlugin: Plugin } {
    const effectivePlugins = defaultPlugins;
    let pasteJSONPlugin = null;

    if (plugins) {
      for (const p of plugins) {
        if (!effectivePlugins.includes(p)) {
          effectivePlugins.push(p);
          if (p.getEffectiveSchema) {
            schema = p.getEffectiveSchema(schema);
          }

          if (p.initKeyCommands) {
            effectivePlugins.push(p.initKeyCommands());
          }

          if (p.insert) {
            pasteJSONPlugin = p;
          }
        }
      }
    }
    return { plugins: effectivePlugins, schema, pasteJSONPlugin };
  }

  // [FS] IRAD-1578 2021-09-27
  onReady(state: EditorState) {
    const collabEditing = this.state.docID !== '';

    if (collabEditing) {
      this._editorView && this._editorView.focus();
      if (this.state.onReadyCB) {
        this.state.onReadyCB(this);
      }
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

  getDocument(content: any, editorState: EditorState, dataType: DataType) {
    let document = null;
    const { schema } = editorState;

    if (DataType.JSON === dataType || this.skipDataTypeCheck) {
      document = schema.nodeFromJSON(content ? content : EMPTY_DOC_JSON);
    } else {
      const tempEState = convertFromHTML(
        content ? content : '',
        schema,
        editorState.plugins
      );
      document = tempEState.doc;
    }

    return document;
  }

  insertJSON = (json: { [key: string]: any }): void => {
    if (this._pasteJSONPlugin && this._pasteJSONPlugin.insert) {
      this._pasteJSONPlugin.insert(json, this._editorView);
    }
  };

  setContent = (content: any = {}, dataType: DataType): void => {
    this.skipDataTypeCheck = false;
    // [FS] IRAD-1571 2021-09-27
    // dispatch a transaction that MUST start from the views current state;
    const editorState = this._editorView.state;
    const { doc } = editorState;
    let { tr } = editorState;
    const document = this.getDocument(content, editorState, dataType);
    this.skipDataTypeCheck = true;

    // [FS] IRAD-1593 2021-10-12
    // Reset lastKeyCode since the content is set dynamically and so lastKeyCode is invalid now.
    this._editorView.lastKeyCode = null;

    const selection = TextSelection.create(doc, 0, doc.content.size);

    tr = tr.setSelection(selection).replaceSelectionWith(document, false);
    // [FS] IRAD-1092 2020-12-03
    // set the value for object metadata  and objectId
    // Should update all document attributes.
    Object.keys(document.attrs).forEach((attr) => {
      tr = tr.step(new SetDocAttrStep(attr, document.attrs[attr]));
    });

    this._skipSCU = true;
    this._editorView.dispatch(tr);
  };

  hasDataChanged(nextData: any, nextDataType: DataType) {
    let dataChanged = false;

    // [FS] IRAD-1571 2021-09-27
    // dispatch a transaction that MUST start from the views current state;
    // [FS] IRAD-1589 2021-10-04
    // Do a proper circular JSON comparison.
    if (stringify(this.state.data) !== stringify(nextData)) {
      const editorState = this._editorView.state;
      const nextDoc = this.getDocument(nextData, editorState, nextDataType);
      dataChanged = !nextDoc.eq(editorState.doc);
    }

    return dataChanged;
  }

  changeContent(data: any, dataType: DataType) {
    if (this.hasDataChanged(data, dataType)) {
      // FS IRAD-1592 2021-11-10
      // Release here quickly, so that update doesn't care about at this point.
      // data changed, so update document content
      setTimeout(this.setContent.bind(this, data, dataType), 1);
    }
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    // Only interested if properties are set from outside.
    if (!this._skipSCU) {
      this._skipSCU = false;

      this.changeContent(nextState.data, nextState.dataType);

      if (this.state.docID !== nextState.docID) {
        setTimeout(this.setDocID.bind(this, nextState), 1);
      }
    }

    this.skipDataTypeCheck = true;

    return true;
  }

  setDocID(nextState: any) {
    // Collaborative mode changed
    const collabEditing = nextState.docID !== '';
    const editorState = this._editorView.state;
    const setState = this.setState.bind(this);
    const docID = nextState.docID || '';
    const collabServiceURL =
      nextState.collabServiceURL || '/collaboration-service';

    if (this._connector) {
      this._connector.cleanUp();
    }
    // create new connector
    this._connector = collabEditing
      ? new CollabConnector(
          editorState,
          setState,
          {
            docID,
            collabServiceURL,
          },
          this._defaultEditorSchema,
          this._defaultEditorPlugins,
          // [FS] IRAD-1578 2021-09-27
          this.onReady.bind(this)
        )
      : new SimpleConnector(editorState, setState);

    // FS IRAD-1592 2021-11-10
    // Notify collab server
    if (this._connector.updateSchema) {
      // Use known editorState to update schema.
      this._connector.updateSchema(editorState.schema);
    }
  }

  render(): React.Element<any> {
    const {
      editorState,
      width,
      height,
      readOnly,
      disabled,
      embedded,
      runtime,
      styleRuntime,
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
        styleRuntime={styleRuntime}
        runtime={runtime}
        width={width}
      />
    );
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
    dispatch(tr.scrollIntoView());

    // [FS] IRAD-1578 2021-09-27
    // In collab mode, fire onRead only after getting the response from collab server.
    if (this.state.onReadyCB && this.state.docID === '') {
      editorView.focus();
      this.state.onReadyCB(this);
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
    this.skipDataTypeCheck = false;
    // Need to go through shouldComponentUpdate lifecycle here, when updated from outside,
    // so that content is modified gracefully using transaction so that undo/redo works too.
    this._skipSCU = false;
    this.setState(props);
  };

  exportPDF = () => {
    new Promise(async (resolve, reject) => {
      try {
        //
        if (Array.isArray(this.props.plugins)) {
          this.props.plugins.forEach((plugin) => {
            if (plugin['key'].startsWith('exportPDF$')) {
              // got the exportPDF instance.
              resolve(plugin);
            }
          });
        }
      } catch (error) {
        reject();
      }
    }).then((exportPDF) => {
      if (exportPDF.perform) {
        exportPDF.perform(this._editorView);
      }
    });
  };

  goToEnd = (): void => {
    // Return focus to the editor with cursor at end of document.
    const view: EditorView = this.editorView;
    const tr = view.state.tr;
    view.dispatch(tr.setSelection(TextSelection.atEnd(view.state.doc)).scrollIntoView());
    view.focus();
  };

}

export default Licit;
