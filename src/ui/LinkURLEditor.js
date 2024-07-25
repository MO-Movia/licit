// @flow

import * as React from 'react';
import PropTypes from 'prop-types';

import sanitizeURL from '../sanitizeURL.js';
import {
  CustomButton
} from '@modusoperandi/licit-ui-commands';
import {
  ENTER
} from './KeyCodes.js';
import {
  preventEventDefault
} from '@modusoperandi/licit-ui-commands';
import uuid from '../uuid.js';

import './czi-form.css';
import './czi-image-url-editor.css';
import { EditorView } from 'prosemirror-view';
import { INNER_LINK } from '../Types.js';

const BAD_CHARACTER_PATTER = /\s/;

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
    selectionId: this.props.selectionId_
  };

  componentDidMount() {
    const { selectionId } = this.state;
    let defaultTab = 'webpage';
    if (selectionId) {
      defaultTab = 'innerlink';
    } else {
      defaultTab = 'webpage';
    }

    const selectedTab = this.props.selectedTab || defaultTab;
    this.openForm(selectedTab);
  }

  openForm = (formName) => {
    let i;
    const tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = 'none';
    }

    const tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].classList.remove('active');
    }

    const selectedTab = document.getElementById(formName);
    if (selectedTab) {
      selectedTab.style.display = 'block';
    }

    const clickedButton = document.querySelector(
      `.tablinks[data-form="${formName}"]`
    );
    if (clickedButton) {
      clickedButton.classList.add('active');
    }
  };

  render(): React.Element<any> {
    const { url, TOCselectedNode_, view_, selectionId } =
      this.state;
    const error = url ? BAD_CHARACTER_PATTER.test(url) : false;

    let label = 'Apply';
    let disabled = !!error;
    if (this.props.href) {
      label = url ? 'Apply' : 'Remove';
      disabled = error;
    } else {
      disabled = error || !url;
    }

    return (
      <div className="czi-image-url-editor">
        <div className="czi-form">
          <div className="tab">
            <button
              className="tablinks"
              data-form="webpage"
              onClick={() => this.openForm('webpage')}
            >
              Existing Web Page
            </button>
            <button
              className="tablinks"
              data-form="innerlink"
              onClick={() => this.openForm('innerlink')}
            >
              Place in this Document
            </button>
          </div>

          <div className="tabcontent" id="webpage" >
            <form onSubmit={preventEventDefault}>
              <fieldset>
                <label>Add a Link : </label>
                <input
                  autoFocus={true}
                  onChange={this._onURLChange}
                  onKeyDown={this._onKeyDown}
                  placeholder="Paste a URL"
                  spellCheck={false}
                  type="text"
                  value={selectionId === null ? url || '' : null}
                />
              </fieldset>
              <div className="czi-form-buttons">
                <CustomButton label="Cancel" onClick={this._cancel} />
                <CustomButton
                  active={true}
                  disabled={disabled}
                  label={label}
                  onClick={() => {
                    this._apply();
                  }}
                />
              </div>
            </form>
          </div>
          {TOCselectedNode_.length === 0 ? (
            <div className="tabcontent" id="innerlink" >
              <p>No TOC styles</p>
              <div className="czi-form-buttons">
                <CustomButton label="Cancel" onClick={this._cancel} />
              </div>
            </div>
          ) : (

            <div className="tabcontent" id="innerlink"   >
              <form action="#">
                <label>Select the Inner Link</label>
                <br></br>
                <select
                  defaultValue={
                    selectionId ? url : null
                  }
                  id="toc"
                  name="toccontents"
                  size="3"
                >
                  {TOCselectedNode_?.map((res, index) => (
                    <option
                      key={index}
                      onClick={() => {
                        this.handleOptionChange(
                          res.node_.textContent,
                          res.pos_,
                          view_
                        );
                      }}
                      value={res.node_.textContent}
                    >
                      {res.node_.textContent}
                    </option>
                  ))}
                </select>

                <br></br>
                <div className="czi-form-buttons">
                  <CustomButton label="Cancel" onClick={this._cancel} />
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  handleOptionChange = (
    textContent_,
    tocNodePosition_,
    view: EditorView
  ) => {
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

  _onKeyDown = (e: any) => {
    if (e.keyCode === ENTER) {
      e.preventDefault();
      this._apply();
    }
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

  _apply = (): void => {
    const { url } = this.state;
    if (url && !BAD_CHARACTER_PATTER.test(url)) {
      this.props.close(sanitizeURL(url));
    }
  };
}

export default LinkURLEditor;
