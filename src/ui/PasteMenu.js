import * as React from 'react';
import uuid from './uuid';
import './listType.css';

// [FS] IRAD-1076 2020-10-15
// Popup menu UI with paste options.

class PasteMenu extends React.PureComponent<any, any> {
  props: {
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
        className="pastemenu"
        id="paste"
        key="paste"
        onClick={(e) => this._onUIEnter('paste')}
        value="paste"
      >
        Paste
      </button>
    );
    children.push(
      <button
        className="pastemenu"
        id="keepTextOnly"
        key="keepTextOnly"
        onClick={(e) => this._onUIEnter('keepTextOnly')}
        value="keepTextOnly"
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
