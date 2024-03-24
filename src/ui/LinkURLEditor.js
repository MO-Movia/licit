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

const BAD_CHARACTER_PATTER = /\s/;

class LinkURLEditor extends React.PureComponent<any, any> {
  static propTypes = {
    href: PropTypes.string,
    close: PropTypes.func.isRequired,
    selectedTab: this.state.selectedTab,
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
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = 'none';
    }

    tablinks = document.getElementsByClassName('tablinks');
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
    let { url, TOCselectedNode_, view_, selectionId } =
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

          <div id="webpage" className="tabcontent">
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
            <div id="innerlink" className="tabcontent">
              <p>No TOC styles</p>
              <div className="czi-form-buttons">
                <CustomButton label="Cancel" onClick={this._cancel} />
              </div>
            </div>
          ) : (

            <div id="innerlink" className="tabcontent">
              <form action="#">
                <label>Select the Inner Link</label>
                <br></br>
                <select
                  name="toccontents"
                  id="toc"
                  size="3"
                  defaultValue={
                    selectionId ? url : null
                  }
                >
                  {TOCselectedNode_?.map((res, index) => (
                    <option
                      key={index}
                      value={res.node_.textContent}
                      onClick={() => {
                        this.handleOptionChange(
                          res.node_.textContent,
                          res.pos_,
                          view_
                        );
                      }}
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
    const innerString = 'INNER______LINK';
    let tr = view.state.tr;
    const TocNode = view.state.doc.nodeAt(tocNodePosition_);
    if (TocNode && (TocNode.attrs.innerLink == null || TocNode.attrs.innerLink == "" || TocNode.attrs.innerLink == undefined)) {

      const nodeUUID = uuid();
      const texthash = '#';
      let nodeAttrs = TocNode.attrs;
      const nodeconcat_UUID = texthash.concat(nodeUUID);
      nodeAttrs.innerLink = nodeconcat_UUID;
      tr.setNodeMarkup(tocNodePosition_, undefined, nodeAttrs);
      var textContent = nodeconcat_UUID.concat(innerString, textContent_);
    } else {
      var textContent = TocNode.attrs.innerLink.concat(innerString, textContent_);
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

  _apply = (view: EditorView): void => {
    const { url } = this.state;
    if (url && !BAD_CHARACTER_PATTER.test(url)) {
      this.props.close(sanitizeURL(url));
    }
  };
}

export default LinkURLEditor;
