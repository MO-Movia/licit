import * as React from 'react';
import UICommand from './UICommand';
import {EditorView} from 'prosemirror-view';
import uuid from './uuid';
import './listType.css';

// [FS] IRAD-1076 2020-10-15
// Popup menu UI with paste options.

class PasteMenu extends React.PureComponent<any, any> {
  _activeCommand: ?UICommand = null;
  props: {
    view: EditorView,
    close: (?string) => void,
  };

  _menu = null;
  _id = uuid();

  state = {
    expanded: false,
  };

  render() {
    const children = [];
    children.push(
      <button
        className="pasteMenu"
        id='paste'
        key='paste'
        onClick={(e) => this._onUIEnter('paste')}
        value='paste'
      >
        Paste
      </button>
    );
    children.push(
      <button
        className="pasteMenu"
        id='keepTextOnly'
        key='keepTextOnly'
        onClick={(e) => this._onUIEnter('keepTextOnly')}
        value='keepTextOnly'
      >
        Keep Text Only
      </button>
    );

    return <div className="container">{children}</div>;
  }

  _onUIEnter = (id: string) => {
    this.props.close(id);
  };
}

export default PasteMenu;
