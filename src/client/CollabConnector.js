// @flow

import { Transform } from 'prosemirror-transform';
import { Schema } from 'prosemirror-model';
import { Plugin, EditorState } from 'prosemirror-state';
import SimpleConnector from './SimpleConnector';
import type { SetStateCall } from './SimpleConnector';
import EditorConnection from './EditorConnection';
import Reporter from './Reporter';
import ReactDOM from 'react-dom';

type IdStrict = string;

class CollabConnector extends SimpleConnector {
  _clientID: string;
  _connected: boolean;
  _connection: EditorConnection;
  _docID: IdStrict;
  _stepKeys: Object;

  constructor(
    editorState: EditorState,
    setState: SetStateCall,
    config: {
      docID: IdStrict,
      collabServiceURL: string,
    },
    schema: Schema,
    plugins: Array<Plugin>,
    onReady: Function
  ) {
    super(editorState, setState);
    const { docID, collabServiceURL } = config;
    this._docID = docID;

    // [FS] IRAD-1553 2021-08-26
    // Configurable Collaboration Service URL.
    const url = collabServiceURL + '/docs/' + docID;
    this._connection = new EditorConnection(
      onReady,
      new Reporter(),
      url,
      plugins,
      schema
    );

    this._connection.view = {
      updateState: (s) => {
        setState({ editorState: s }, () => {});
      },
    };
  }

  cleanUp = () => {
    // remove collab plugin
    if (this._connection) {
      const cpIdx = this._editorState.plugins.findIndex((plugin) => {
        return 'collab$' === plugin.spec.key.key;
      });

      if (-1 != cpIdx) {
        this._editorState.plugins.splice(cpIdx, 1);
      }

      this._connection.close();
    }
  };

  onEdit = (transaction: Transform): void => {
    if (!this._connection.ready) {
      console.warn('not ready');
      return;
    }
    ReactDOM.unstable_batchedUpdates(() => {
      this._connection.dispatch({ type: 'transaction', transaction });
    });
  };

  // FS IRAD-1040 2020-09-02
  // Send the modified schema to server
  updateSchema = (schema: Schema, data: any) => {
    this._connection.updateSchema(schema, data);
  };

  updateContent = (data: any) => {
    this._connection.start(data);
  };
}

export default CollabConnector;
