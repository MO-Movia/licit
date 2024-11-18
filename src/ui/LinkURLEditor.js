// @flow

import * as React from 'react';
import PropTypes from 'prop-types';

import {
  CustomButton,
} from '@modusoperandi/licit-ui-commands';
import uuid from '../uuid.js';

import './czi-form.css';
import './czi-image-url-editor.css';
import { EditorView } from 'prosemirror-view';
import { INNER_LINK } from '../Types.js';

class LinkURLEditor extends React.PureComponent<any, any> {
  static propTypes = {
    href: PropTypes.string,
    close: PropTypes.func.isRequired,
    selectedTab: this.state?.selectedTab,
  };

  state = {
    url: this.props.href_,
    TOCselectedNode_: this.props.TOCselectedNode_,
    view_: this.props.view_,
    selectionId: this.props.selectionId_,
  };

  componentDidMount() {
    const { selectionId } = this.state;
    const defaultTab = selectionId ? 'innerlink' : 'webpage';

    const selectedTab = this.props.selectedTab || defaultTab;
    this.setState((state) => ({
      ...state,
      isWebLink: selectedTab !== 'innerlink',
    }));
  }

  render(): React.Element<any> {
    const { url, TOCselectedNode_, view_, isWebLink } = this.state;

    const label = !this.props.href || url ? 'Apply' : 'Remove';
    const disabled = !url || url.length === 0;
    const formValue = url ?? '';

    return (
      <div className="czi-image-url-editor">
        <div className="czi-form">
          <div className="tab">
            <button
              className="tablinks active"
              onClick={() => this.toggleForm()}
            >
              {isWebLink ? 'Place in this Document' : 'Existing Web Page'}
            </button>
          </div>

          <div className="tabcontent">
            <form onSubmit={this._apply}>
              {isWebLink
                ? this.weblinkForm(formValue)
                : this.innerLinkForm(formValue, TOCselectedNode_, view_)}
              <div className="czi-form-buttons">
                <CustomButton label="Cancel" onClick={this._cancel} />
                <CustomButton
                  style={{
                    display:
                      isWebLink || TOCselectedNode_.length > 0
                        ? 'block'
                        : 'none',
                  }}
                  active={true}
                  disabled={disabled}
                  label={label}
                  onClick={() => this._apply()}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  toggleForm = () => {
    this.setState((state) => ({
      isWebLink: !state.isWebLink,
    }));
  };

  weblinkForm(value) {
    return (
      <fieldset>
        <label>Add a Link :</label>
        <br />
        <input
          autoFocus={true}
          onChange={this._onURLChange}
          onKeyDown={this._onKeyDown}
          placeholder="Paste a URL"
          spellCheck={false}
          type="text"
          value={value}
        />
      </fieldset>
    );
  }

  innerLinkForm(value, TOCselectedNode_, view_) {
    return TOCselectedNode_.length === 0 ? (
      <p>No TOC styles</p>
    ) : (
      <>
        <label>Select the Inner Link</label>
        <br />
        <select defaultValue={value} id="toc" name="toccontents" size="3">
          {TOCselectedNode_?.map((res) => (
            <option
              key={res.node_.textContent}
              onClick={() => {
                this.handleOptionChange(res.node_.textContent, res.pos_, view_);
              }}
              value={res.node_.textContent}
            >
              {res.node_.textContent}
            </option>
          ))}
        </select>
      </>
    );
  }

  handleOptionChange = (textContent_, tocNodePosition_, view: EditorView) => {
    const tr = view.state.tr;
    const TocNode = view.state.doc.nodeAt(tocNodePosition_);
    let textContent;
    if (!TocNode?.attrs?.innerLink) {
      const nodeUUID = uuid();
      const texthash = '#';
      const nodeAttrs = TocNode.attrs;
      const nodeconcat_UUID = texthash.concat(nodeUUID);
      nodeAttrs.innerLink = nodeconcat_UUID;
      tr.setNodeMarkup(tocNodePosition_, undefined, nodeAttrs);
      textContent = nodeconcat_UUID.concat(INNER_LINK, textContent_);
    } else {
      textContent = TocNode.attrs.innerLink.concat(INNER_LINK, textContent_);
    }
    this.props.close(textContent);
  };

  _onURLChange = (e: SyntheticInputEvent<>) => {
    const url = e.target.value;
    this.setState({
      url,
    });
  };

  _cancel = (): void => {
    this.props.close();
  };

  _apply = (event): void => {
    const { url } = this.state;
    if (url) {
      this.props.close(url);
    }
    event?.preventDefault();
  };
}

export default LinkURLEditor;
