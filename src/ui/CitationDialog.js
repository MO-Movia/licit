// @flow

// [FS] IRAD-1251 2021-03-10
// UI for Citation dialog
import * as React from 'react';
import './citation-note.css';

const AUTHORS = ['Author', 'Publisher', 'Originator'];
const DATES = ['Published', 'Issued', 'Posted'];
const PORTIONS = ['Page', 'Paragraph'];
const CAPCO = ['TBD', 'C', 'U', 'TS'];

export function getCustomCapco() {
  return localStorage.getItem('customCapcoList')
    ? JSON.parse(localStorage.getItem('customCapcoList'))
    : [];
}

// [FS] IRAD-1289 2021-03-30
// Show ellipsis on Advanced lengthy Capco
function addElipsesForLongCAPCO(capco) {
  let advancedCapco = capco;
  if (capco.length >= 25) {
    advancedCapco = capco.slice(0, 15) + '...';
  }
  return advancedCapco;
}

// [FS] IRAD-1289 2021-03-30
// to show both static and advanced capco in drop down
export function getCapcoList() {
  const CAPCOlist = [];
  const customCapcoList = getCustomCapco();
  for (let i = 0; i < CAPCO.length; i++) {
    CAPCOlist.push({label: CAPCO[i], value: CAPCO[i]});
  }

  for (let j = 0; j < customCapcoList.length; j++) {
    CAPCOlist.push({
      label: addElipsesForLongCAPCO(customCapcoList[j]),
      value: customCapcoList[j],
    });
  }
  return CAPCOlist;
}

class CitationDialog extends React.PureComponent<any, any> {
  _unmounted = false;
  _popUp = null;

  constructor(props: any) {
    super(props);
    this.state = {
      ...props,
    };
    this.setSourceText();
  }

  setSourceText() {
    if (this.state.citationObject || this.state.citationUseObject) {
      this.setState({
        sourceText:
          '(' +
          (this.state.citationUseObject.overallCitationCAPCO
            ? this.state.citationUseObject.overallCitationCAPCO
            : 'TBD') +
          ')' +
          ' ' +
          this.state.citationObject.author +
          ' ' +
          this.state.citationObject.referenceId +
          ' Date ' +
          this.state.citationObject.publishedDateTitle +
          ' ' +
          (this.state.citationObject.publishedDate
            ? this.state.citationObject.publishedDate
            : '') +
          ' ' +
          '(' +
          (this.state.citationObject.documentTitleCapco
            ? this.state.citationObject.documentTitleCapco
            : 'TBD') +
          ')' +
          ' ' +
          this.state.citationObject.documentTitle +
          ' pp. ' +
          this.state.citationUseObject.pageStart +
          '-' +
          this.state.citationUseObject.pageEnd +
          ' Extracted information is ' +
          '(' +
          (this.state.citationUseObject.extractedInfoCAPCO
            ? this.state.citationUseObject.extractedInfoCAPCO
            : 'TBD') +
          ')' +
          ' Overall document classification is ' +
          '(' +
          (this.state.citationObject.overallDocumentCapco
            ? this.state.citationObject.overallDocumentCapco
            : 'TBD') +
          ')',
      });
    }
  }

  componentWillUnmount(): void {
    this._unmounted = true;
  }

  componentDidMount() {
    this.setSourceText();
  }

  render(): React.Element<any> {
    return (
      <div style={{width: '780px'}}>
        <form className="czi-form">
          <div>
            <label
              className="citation-label"
              style={{
                fontSize: '24px',
                // verticalAlign: 'middle',
                margin: '10px 0',
                fontWeight: 'bold',
              }}
            >
              {'(' +
                (this.state.citationUseObject.overallCitationCAPCO
                  ? this.state.citationUseObject.overallCitationCAPCO
                  : 'TBD') +
                ')'}
            </label>
            <select
              disabled={this.state.isCitationObject}
              onChange={this.onCitationCAPCOChanged.bind(this)}
              style={{
                height: '27px',
                border: 'none',
                fontSize: '22px',
                fontWeight: 'bold',
                margin: '0 10px 3px 3px',
              }}
              value="Source Citation"
            >
              <option
                selected
                style={{fontSize: '34px', fontWeight: 'bold', display: 'none'}}
              >
                Source Citation
              </option>
              {getCapcoList().map(({label, value}) => (
                <option key={value} title={value} value={value}>
                  {label}
                </option>
              ))}             
            </select>
            <div style={{float: 'right', marginTop: '-5px'}}>
              <button
                className="btnsave"
                // onClick={this._onSearch.bind(this)}
                style={{height: '27px'}}
              >
                Search
              </button>
              <button onClick={this._save.bind(this)} style={{height: '27px'}}>
                Save
              </button>
              <button
                className="btnsave"
                onClick={this._cancel}
                style={{height: '27px'}}
              >
                Cancel
              </button>
            </div>
          </div>
          <hr
            className="hr-width"
            style={{marginBottom: '5px', marginTop: '5px'}}
          ></hr>
          {/* First row */}
          <div>
            <div className="div-display">
              <div>
                <select
                  className="citation-label"
                  onChange={this.onAuthorTitleChanged.bind(this)}
                  style={{border: 'none', marginLeft: '-3px'}}
                  value={this.state.citationObject.authorTitle}
                >
                  {AUTHORS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <input
                onChange={this.onInputChanged.bind(this, 'author')}
                style={{
                  borderColor: 'lightgray',
                  height: '26px',
                  width: '220px',
                }}
                type="text"
                value={this.state.citationObject.author}
              />
            </div>
            <div className="div-display">
              <label className="citation-label" style={{marginLeft: '10px'}}>
                Reference ID
              </label>
              <input
                onChange={this.onInputChanged.bind(this, 'referenceId')}
                style={{
                  borderColor: 'lightgray',
                  height: '26px',
                  marginLeft: '10px',
                  width: '220px',
                }}
                type="text"
                value={this.state.citationObject.referenceId}
              />
            </div>
            <div className="div-display">
              <div>
                <select
                  className="citation-label"
                  onChange={this.onPublishDateTitleChanged.bind(this)}
                  style={{border: 'none', marginLeft: '10px'}}
                  value={this.state.citationObject.publishedDateTitle}
                >
                  {DATES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <input
                onChange={this.onInputChanged.bind(this, 'publishedDate')}
                style={{height: '25px', marginLeft: '10px', width: '240px'}}
                type="date"
                value={this.state.citationObject.publishedDate}
              />
            </div>
            {/* second row */}
            <div>
              <div className="div-display">
                <div>
                  <label
                    className="citation-label"
                    style={{
                      verticalAlign: 'middle',
                      margin: '10px 0',
                    }}
                  >
                    {'(' +
                      (this.state.citationObject.documentTitleCapco
                        ? this.state.citationObject.documentTitleCapco
                        : 'TBD') +
                      ')'}
                  </label>
                  <select
                    className="citation-label"
                    onChange={this.onDocumentTitleCAPCOChanged.bind(this)}
                    style={{
                      border: 'none',
                      margin: '0 10px 3px 3px',
                    }}
                    value="Source Citation"
                  >
                    <option
                      selected
                      style={{
                        display: 'none',
                        fontSize: '34px',
                        fontWeight: 'bold',
                      }}
                    >
                      Document Title
                    </option>
                    {getCapcoList().map(({label, value}) => (
                      <option key={value} title={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  onChange={this.onInputChanged.bind(this, 'documentTitle')}
                  style={{
                    borderColor: 'lightgray',
                    height: '26px',
                    width: '450px',
                  }}
                  type="text"
                  value={this.state.citationObject.documentTitle || ''}
                />
              </div>
              <div className="div-display">
                <div>
                  <select
                    className="citation-label"
                    disabled={this.state.isCitationObject}
                    onChange={this.onPageTitleChanged.bind(this)}
                    style={{border: 'none', marginLeft: '6px'}}
                    value={this.state.citationUseObject.pageTitle}
                  >
                    {PORTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  disabled={this.state.isCitationObject}
                  onChange={this.onInputChanged.bind(this, 'pagesStart')}
                  style={{
                    borderColor: 'lightgray',
                    height: '26px',
                    marginLeft: '10px',
                    width: '115px',
                  }}
                  type="text"
                  value={this.state.citationUseObject.pageStart || ''}
                />
              </div>
              <div className="div-display">
                <input
                  disabled={this.state.isCitationObject}
                  onChange={this.onInputChanged.bind(this, 'pagesEnd')}
                  style={{
                    borderColor: 'lightgray',
                    height: '26px',
                    marginLeft: '10px',
                    width: '115px',
                  }}
                  type="text"
                  value={this.state.citationUseObject.pageEnd || ''}
                />
              </div>
            </div>

            <div>
              <label
                className="citation-label"
                disabled={this.state.isCitationObject}
                style={{
                  verticalAlign: 'middle',
                  margin: '10px 0',
                }}
              >
                {'(' +
                  (this.state.citationUseObject.extractedInfoCAPCO
                    ? this.state.citationUseObject.extractedInfoCAPCO
                    : 'TBD') +
                  ')'}
              </label>
              <select
                disabled={this.state.isCitationObject}
                onChange={this.onExtractedInfoCAPCOChanged.bind(this)}
                style={{
                  border: 'none',
                  margin: '0 10px 3px 3px',
                }}
                value="Extracted information classification"
              >
                <option
                  selected
                  style={{
                    display: 'none',
                    fontSize: '34px',
                  }}
                >
                  Extracted information classification
                </option>
                {getCapcoList().map(({label, value}) => (
                  <option key={value} title={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <label
                className="citation-label"
                style={{
                  verticalAlign: 'middle',
                  margin: '10px 0',
                }}
              >
                {'(' +
                  (this.state.citationObject.overallDocumentCapco
                    ? this.state.citationObject.overallDocumentCapco
                    : 'TBD') +
                  ')'}
              </label>
              <select
                onChange={this.onOverallDocCAPCOChanged.bind(this)}
                style={{
                  border: 'none',
                  margin: '0 10px 3px 3px',
                }}
                value="Overall document classification"
              >
                <option
                  selected
                  style={{
                    display: 'none',
                    fontSize: '34px',
                    fontWeight: 'bold',
                  }}
                >
                  Overall document classification
                </option>
                {getCapcoList().map(({label, value}) => (
                  <option key={value} title={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Third row */}
            <div>
              <label
                className="citation-label"
                disabled={this.state.isCitationObject}
                style={{
                  verticalAlign: 'middle',
                  margin: '10px 0',
                }}
              >
                {'(' +
                  (this.state.citationUseObject.descriptionCAPCO
                    ? this.state.citationUseObject.descriptionCAPCO
                    : 'N/A') +
                  ')'}
              </label>
              <select
                className="citation-label"
                disabled={this.state.isCitationObject}
                onChange={this.onDescriptionCAPCOChanged.bind(this)}
                style={{
                  border: 'none',
                  margin: '0 10px 3px 3px',
                }}
                value="Description"
              >
                <option
                  selected
                  style={{
                    display: 'none',
                    fontSize: '34px',
                  }}
                >
                  Description
                </option>
                {getCapcoList().map(({label, value}) => (
                  <option key={value} title={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              cols="50"
              disabled={this.state.isCitationObject}
              name="description"
              onChange={this.onInputChanged.bind(this, 'description')}
              rows="4"
              style={{
                border: '1px solid lightgrey',
                fontFamily: 'helvetica',
                fontSize: '13px',
                height: '68px',
                width: '700px',
              }}
              value={this.state.citationUseObject.description || ''}
            >
              {this.state.citationUseObject.description || ''}
            </textarea>
          </div>
          {/* fOURTH ROW */}
          <div>
            <div className="div-display">
              <div>
                <label
                  className="citation-label"
                  style={{
                    verticalAlign: 'middle',
                    margin: '10px 0',
                  }}
                >
                  {' '}
                  Web-accessible hyperlink
                </label>
              </div>
              <input
                onChange={this.onInputChanged.bind(this, 'hyperLink')}
                style={{
                  borderColor: 'lightgray',
                  height: '26px',
                  width: '450px',
                }}
                type="text"
                value={this.state.citationObject.hyperLink || ''}
              />
            </div>
            <div className="div-dateaccessed">
              <div>
                <label className="citation-label" style={{marginLeft: '10px'}}>
                  Date Accessed
                </label>
              </div>
              <input
                onChange={this.onInputChanged.bind(this, 'dateAccessed')}
                style={{height: '25px', marginLeft: '10px', width: '240px'}}
                type="date"
                value={this.state.citationObject.dateAccessed}
              />
            </div>

            <hr
              style={{width: '100%'}}
              style={{marginBottom: '5px', marginTop: '5px'}}
            ></hr>
            <textarea
              cols="50"
              name="sourceText"
              rows="4"
              style={{
                border: 'none',
                fontFamily: 'arial sans-serif',
                fontSize: '14px',
                height: '68px',
                width: '700px',
              }}
              value={this.state.sourceText}
            >
              {this.state.sourceText}
            </textarea>
          </div>
        </form>
      </div>
    );
  }

  // handles Citation capco change
  onCitationCAPCOChanged(e: any) {
    this.setState(
      {
        citationUseObject: {
          ...this.state.citationUseObject,
          overallCitationCAPCO: e.target.value,
        },
      },
      () => {
        this.setSourceText();
      }
    );
  }

  // handles doc title capco change
  onDocumentTitleCAPCOChanged(e: any) {
    this.setState(
      {
        citationObject: {
          ...this.state.citationObject,
          documentTitleCapco: e.target.value,
        },
      },
      () => {
        this.setSourceText();
      }
    );
  }

  // handles author title change
  onAuthorTitleChanged(e: any) {
    this.setState(
      {
        citationObject: {
          ...this.state.citationObject,
          authorTitle: e.target.value,
        },
      },
      () => {
        this.setSourceText();
      }
    );
  }

  // handles published title change
  onPublishDateTitleChanged(e: any) {
    this.setState(
      {
        citationObject: {
          ...this.state.citationObject,
          publishedDateTitle: e.target.value,
        },
      },
      () => {
        this.setSourceText();
      }
    );
  }

  // handles extracted information capco change
  onExtractedInfoCAPCOChanged(e: any) {
    this.setState(
      {
        citationUseObject: {
          ...this.state.citationUseObject,
          extractedInfoCAPCO: e.target.value,
        },
      },
      () => {
        this.setSourceText();
      }
    );
  }

  // handles overall doc capco change
  onOverallDocCAPCOChanged(e: any) {
    this.setState(
      {
        citationObject: {
          ...this.state.citationObject,
          overallDocumentCapco: e.target.value,
        },
      },
      () => {
        this.setSourceText();
      }
    );
  }

  // handles description capco change
  onDescriptionCAPCOChanged(e: any) {
    this.setState(
      {
        citationUseObject: {
          ...this.state.citationUseObject,
          descriptionCAPCO: e.target.value,
        },
      },
      () => {
        this.setSourceText();
      }
    );
  }

  // handles page title change
  onPageTitleChanged(e: any) {
    this.setState({
      citationUseObject: {
        ...this.state.citationUseObject,
        pageTitle: e.target.value,
      },
    });
  }

  // handles all the input controls change
  onInputChanged(fieldName: string, e: any) {
    switch (fieldName) {
      case 'author':
        this.setState(
          {
            citationObject: {
              ...this.state.citationObject,
              author: e.target.value,
            },
          },
          () => {
            this.setSourceText();
          }
        );
        break;
      case 'referenceId':
        this.setState(
          {
            citationObject: {
              ...this.state.citationObject,
              referenceId: e.target.value,
            },
            // to keep the referenceId as citation object's reference id in citation use object
            citationUseObject: {
              ...this.state.citationUseObject,
              citationObjectRefId: e.target.value,
            },
          },
          () => {
            this.setSourceText();
          }
        );
        break;
      case 'documentTitle':
        this.setState(
          {
            citationObject: {
              ...this.state.citationObject,
              documentTitle: e.target.value,
            },
          },
          () => {
            this.setSourceText();
          }
        );
        break;
      case 'pagesStart':
        this.setState(
          {
            citationUseObject: {
              ...this.state.citationUseObject,
              pageStart: e.target.value,
            },
          },
          () => {
            this.setSourceText();
          }
        );
        break;
      case 'pagesEnd':
        this.setState(
          {
            citationUseObject: {
              ...this.state.citationUseObject,
              pageEnd: e.target.value,
            },
          },
          () => {
            this.setSourceText();
          }
        );
        break;
      case 'description':
        this.setState({
          citationUseObject: {
            ...this.state.citationUseObject,
            description: e.target.value,
          },
        });
        break;
      case 'hyperLink':
        this.setState(
          {
            citationObject: {
              ...this.state.citationObject,
              hyperLink: e.target.value,
            },
          },
          () => {
            this.setSourceText();
          }
        );
        break;
      case 'dateAccessed':
        this.setState(
          {
            citationObject: {
              ...this.state.citationObject,
              dateAccessed: e.target.value,
            },
          },
          () => {
            this.setSourceText();
          }
        );
        break;
      case 'publishedDate':
        this.setState(
          {
            citationObject: {
              ...this.state.citationObject,
              publishedDate: e.target.value,
            },
          },
          () => {
            this.setSourceText();
          }
        );
        break;
    }
  }

  _cancel = (): void => {
    this.props.close();
  };

  _save = (): void => {
    this.props.close(this.state);
  };

  _onSearch() {
    this.props.editorView.runtime.getCitationsAsync().then((result) => {
      if (result) {
        const lstcitation = result;
        console.log('The saved citations are:', lstcitation);
      }
    });
  }
}

export default CitationDialog;
