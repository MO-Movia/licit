// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import ReactDOM from 'react-dom';

export type SetStateCall = (
  state: { editorState: EditorState },
  callback: Function
) => void;

class SimpleConnector {
  _setState: SetStateCall;
  _editorState: EditorState;
  // This flag is used to deteremine if data passed in or not
  // If not passed in, use the data from collab server when in collab mode.
  // else use empty content.
  _dataDefined: boolean;

  constructor(editorState: EditorState, setState: SetStateCall) {
    this._editorState = editorState;
    this._setState = setState;
  }

  onEdit = (transaction: Transform, view: EditorView): void => {
    ReactDOM.unstable_batchedUpdates(() => {
      const editorState = this._editorState.apply(transaction);
      // [FS] IRAD-1236 2020-03-05
      // The state property should not be directly mutated. Use the updateState method.
      if (view) {
        view.updateState(editorState);
      }

      const state = {
        editorState,
        data: transaction.doc.toJSON(),
      };
      this._setState(state, () => {
        this._editorState = editorState;
      });
    });
  };

  // FS IRAD-989 2020-18-06
  // updating properties should automatically render the changes
  getState = (): EditorState => {
    return this._editorState;
  };

  // FS IRAD-1040 2020-09-02
  // Send the modified schema to server
  updateSchema = (schema: Schema, data: any) => {};

  updateContent = (data: any) => {};

  cleanUp = () => {};
}

export default SimpleConnector;
