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
  _connection: any;
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
    plugins: Array<Plugin>
  ) {
    super(editorState, setState);
    const { docID, collabServiceURL } = config;
    this._docID = docID;

    // [FS] IRAD-1553 2021-08-26
    // Configurable Collaboration Service URL.
    const url = collabServiceURL + '/docs/' + docID;
    this._connection = new EditorConnection(
      setState,
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
  updateSchema = (schema: Schema) => {
    this._connection.updateSchema(schema);
  };
}

export default CollabConnector;
