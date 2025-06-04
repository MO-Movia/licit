// @flow

import * as React from 'react';
import PropTypes from 'prop-types';

import sanitizeURL from '../sanitizeURL.js';
import {
  CustomButton,
  preventEventDefault,
} from '@modusoperandi/licit-ui-commands';
import { ENTER } from './KeyCodes.js';
import { INNER_LINK } from '../Types.js';
import { Tooltip as ReactTooltip } from 'react-tooltip';

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
    selectionId: this.props.selectionId_,
  };

  componentDidMount() {
    const { selectionId } = this.state;
    const defaultTab = selectionId ? 'innerlink' : 'webpage';

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
    const { url, TOCselectedNode_, selectionId } = this.state;

    const isTOCValid = () => {
      if (!TOCselectedNode_ || TOCselectedNode_.length === 0) {
        return false;
      }

      return TOCselectedNode_.some(
        (item) => item.node_?.content[0]?.text?.trim() !== ''
      );
    };
    const isValid = isTOCValid();
    const error = url ? BAD_CHARACTER_PATTER.test(url) : false;

    let label = 'Apply';
    let disabled;
    if (this.props.href) {
      label = url ? 'Apply' : 'Remove';
      disabled = error;
    } else {
      disabled = error || !url;
    }

    return (
      <div className="czi-image-url-editor">
        <div className="czi-form" style={{ padding: '10px', display: 'flex' }}>
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

          <div className="tabcontent" id="webpage">
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
                  value={selectionId ? null : url}
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
          {!isValid ? (
            <div className="tabcontent" id="innerlink">
              <p>No TOC/TOT/TOF styles</p>
              <div className="czi-form-buttons">
                <CustomButton label="Cancel" onClick={this._cancel} />
              </div>
            </div>
          ) : (
            <div className="tabcontent" id="innerlink">
              <form action="#">
                <label>Select the Inner Link</label>
                <br></br>
                <select
                  defaultValue={
                    TOCselectedNode_.some(
                      (res) => res.node_?.content[0]?.text === url
                    )
                      ? url
                      : null
                  }
                  id="toc"
                  name="toccontents"
                  size="3"
                >
                  {TOCselectedNode_?.filter(
                    (res) => res.node_?.content[0]?.text?.trim() !== ''
                  ).map((res, index) => (
                    <option
                      data-tooltip-content={res.node_?.content[0]?.text}
                      data-tooltip-id="select-toc-tooltip"
                      key={index}
                      onClick={() => {
                        this.handleOptionChange(
                          res.node_?.content[0]?.text,
                          res.node_?.attrs.selectionId
                        );
                      }}
                      value={res.node_?.content[0]?.text}
                    >
                      {res.node_?.content[0]?.text}
                    </option>
                  ))}
                </select>
                <ReactTooltip
                  effect="solid"
                  id="select-toc-tooltip"
                  place="bottom"
                />
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

  handleOptionChange = (textContent_, selectionId) => {
    const texthash = '';
    const nodeconcat_UUID = texthash.concat(selectionId);
    const textContent = nodeconcat_UUID.concat(INNER_LINK, textContent_);
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
