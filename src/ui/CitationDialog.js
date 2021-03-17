// @flow

// [FS] IRAD-1251 2021-03-10
// UI for Citation dialog
import * as React from 'react';
import './add-citation.css';

const AUTHORS = ['Author', 'Publisher', 'Originator'];
const DATES = ['Published', 'Issued', 'Posted'];
const PORTIONS = ['Page', 'Paragraph'];
const CAPCO = ['TBD', 'C', 'U', 'TS'];

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
    this.setState({
      sourceText:
        '(' +
        (this.state.citaionUseObject.overallCitationCAPCO
          ? this.state.citaionUseObject.overallCitationCAPCO
          : 'TBD') +
        ')' +
        ' ' +
        this.state.citationObject.author +
        ' ' +
        this.state.citationObject.referenceId +
        ' Date ' +
        this.state.citationObject.publishedDateTitle +
        ' ' +
        this.state.citationObject.publishedDate +
        ' ' +
        '(' +
        (this.state.citationObject.documentTitleCapco
          ? this.state.citaionUseObject.documentTitleCapco
          : 'TBD') +
        ')' +
        ' ' +
        this.state.citationObject.documentTitle +
        ' pp. ' +
        this.state.citaionUseObject.pageStart +
        '-' +
        this.state.citaionUseObject.pageEnd +
        ' Extracted information is ' +
        '(' +
        (this.state.citaionUseObject.extractedInfoCAPCO
          ? this.state.citaionUseObject.extractedInfoCAPCO
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
                verticalAlign: 'middle',
                margin: '10px 0',
                fontWeight: 'bold',
              }}
            >
              {'(' +
                (this.state.citaionUseObject.overallCitationCAPCO
                  ? this.state.citaionUseObject.overallCitationCAPCO
                  : 'TBD') +
                ')'}
            </label>
            <select
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
                style={{display: 'none', fontSize: '34px', fontWeight: 'bold'}}
                selected
              >
                Source Citation
              </option>
              {CAPCO.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <div style={{float: 'right', marginTop: '-5px'}}>
              <button
                className="btnsave buttonstyle"
                onClick={this._onSearch.bind(this)}
                style={{height: '27px'}}
              >
                Search
              </button>
              <button style={{height: '27px'}} onClick={this._save.bind(this)}>
                Save
              </button>
              <button
                style={{height: '27px'}}
                className="btnsave buttonstyle"
                onClick={this._cancel}
              >
                Cancel
              </button>
            </div>
          </div>
          <hr className="hr-width"></hr>
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
                style={{height: '26px', width: '220px'}}
                type="text"
                value={this.state.citationObject.author}
              />
            </div>
            <div className="div-display">
              <label
                className="citation-label"
                style={{display: 'block', marginLeft: '10px'}}
              >
                Reference ID
              </label>
              <input
                onChange={this.onInputChanged.bind(this, 'referenceId')}
                style={{height: '26px', marginLeft: '10px', width: '220px'}}
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
                style={{height: '21px', marginLeft: '10px', width: '220px'}}
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
                      (this.state.citaionUseObject.documentTitleCapco
                        ? this.state.citaionUseObject.documentTitleCapco
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
                      style={{
                        display: 'none',
                        fontSize: '34px',
                        fontWeight: 'bold',
                      }}
                      selected
                    >
                      Document Title
                    </option>
                    {CAPCO.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  onChange={this.onInputChanged.bind(this, 'documentTitle')}
                  style={{height: '26px', width: '450px'}}
                  type="text"
                  value={this.state.citationObject.documentTitle || ''}
                />
              </div>
              <div className="div-display">
                <div>
                  <select
                    className="citation-label"
                    onChange={this.onPageTitleChanged.bind(this)}
                    style={{border: 'none', marginLeft: '6px'}}
                    value={this.state.citaionUseObject.pageTitle}
                  >
                    {PORTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  onChange={this.onInputChanged.bind(this, 'pagesStart')}
                  style={{height: '26px', marginLeft: '10px', width: '115px'}}
                  type="text"
                />
              </div>
              <div className="div-display">
                <input
                  onChange={this.onInputChanged.bind(this, 'pagesEnd')}
                  style={{height: '26px', marginLeft: '10px', width: '115px'}}
                  type="text"
                />
              </div>
            </div>

            <div>
              <label
                className="citation-label"
                style={{
                  verticalAlign: 'middle',
                  margin: '10px 0',
                }}
              >
                {'(' +
                  (this.state.citaionUseObject.extractedInfoCAPCO
                    ? this.state.citaionUseObject.extractedInfoCAPCO
                    : 'TBD') +
                  ')'}
              </label>
              <select
                onChange={this.onExtractedInfoCAPCOChanged.bind(this)}
                style={{
                  border: 'none',
                  margin: '0 10px 3px 3px',
                }}
                value="Extracted information classification"
              >
                <option
                  style={{
                    display: 'none',
                    fontSize: '34px',
                  }}
                  selected
                >
                  Extracted information classification
                </option>
                {CAPCO.map((value) => (
                  <option key={value} value={value}>
                    {value}
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
                  style={{
                    display: 'none',
                    fontSize: '34px',
                    fontWeight: 'bold',
                  }}
                  selected
                >
                  Overall document classification
                </option>
                {CAPCO.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* Third row */}
            <div>
              <label
                className="citation-label"
                style={{
                  verticalAlign: 'middle',
                  margin: '10px 0',
                }}
              >
                {'(' +
                  (this.state.citaionUseObject.descriptionCAPCO
                    ? this.state.citaionUseObject.descriptionCAPCO
                    : 'N/A') +
                  ')'}
              </label>
              <select
                className="citation-label"
                onChange={this.onDescriptionCAPCOChanged.bind(this)}
                style={{
                  border: 'none',
                  margin: '0 10px 3px 3px',
                }}
                value="Description"
              >
                <option
                  style={{
                    display: 'none',
                    fontSize: '34px',
                  }}
                  selected
                >
                  Description
                </option>
                {CAPCO.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <input
              onChange={this.onInputChanged.bind(this, 'description')}
              style={{height: '80px', width: '706px'}}
              type="text"
            />
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
                style={{height: '26px', width: '450px'}}
                type="text"
              />
            </div>
            <div className="div-display">
              <label
                className="citation-label"
                style={{display: 'block', marginLeft: '10px'}}
              >
                Date Accessed
              </label>
              <input
                onChange={this.onInputChanged.bind(this, 'dateAccessed')}
                style={{height: '21px', marginLeft: '10px', width: '230px'}}
                type="date"
                value={this.state.citationObject.dateAccessed}
              />
            </div>
            <hr style={{width: '100%'}}></hr>
            <textarea
              rows="4"
              cols="50"
              name="sourceText"
              style={{
                border: 'none',
                fontFamily: 'arial sans-serif',
                fontSize: '16px',
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
    this.setState({
      citaionUseObject: {
        ...this.state.citaionUseObject,
        overallCitationCAPCO: e.target.value,
      },
    });
    this.setSourceText();
  }

  // handles doc title capco change
  onDocumentTitleCAPCOChanged(e: any) {
    this.setState({
      citationObject: {
        ...this.state.citationObject,
        documentTitleCapco: e.target.value,
      },
    });
    this.setSourceText();
  }

  // handles author title change
  onAuthorTitleChanged(e: any) {
    this.setState({
      citationObject: {...this.state.citationObject, authorTitle: e.target.value},
    });
    this.setSourceText();
  }

  // handles published title change
  onPublishDateTitleChanged(e: any) {
    this.setState({
      citationObject: {
        ...this.state.citationObject,
        publishedDateTitle: e.target.value,
      },
    });
    this.setSourceText();
  }

  // handles extracted information capco change
  onExtractedInfoCAPCOChanged(e: any) {
    this.setState({
      citaionUseObject: {
        ...this.state.citaionUseObject,
        extractedInfoCAPCO: e.target.value,
      },
    });
    this.setSourceText();
  }

  // handles overall doc capco change
  onOverallDocCAPCOChanged(e: any) {
    this.setState({
      citationObject: {
        ...this.state.citationObject,
        overallDocumentCapco: e.target.value,
      },
    });
    this.setSourceText();
  }

  // handles description capco change
  onDescriptionCAPCOChanged(e: any) {
    this.setState({
      citaionUseObject: {
        ...this.state.citaionUseObject,
        descriptionCAPCO: e.target.value,
      },
    });
    this.setSourceText();
  }

  // handles page title change
  onPageTitleChanged(e: any) {
    this.setState({
      citaionUseObject: {
        ...this.state.citaionUseObject,
        pageTitle: e.target.value,
      },
    });
  }

  // handles all the input controls change
  onInputChanged(fieldName: string, e: any) {
    switch (fieldName) {
      case 'author':
        this.setState({          
          citationObject: {...this.state.citationObject, author: e.target.value},
        });
        break;
      case 'referenceId':
        this.setState({
          citationObject: {
            ...this.state.citationObject,
            referenceId: e.target.value,
          },
        });
        break;
      case 'documentTitle':
        this.setState({
          citationObject: {
            ...this.state.citationObject,
            documentTitle: e.target.value,
          },
        });
        break;
      case 'pagesStart':
        this.setState({
          citaionUseObject: {
            ...this.state.citaionUseObject,
            pageStart: e.target.value,
          },
        });
        break;
      case 'pagesEnd':
        this.setState({
          citaionUseObject: {
            ...this.state.citaionUseObject,
            pageEnd: e.target.value,
          },
        });
        break;
      case 'description':
        this.setState({
          citaionUseObject: {
            ...this.state.citaionUseObject,
            description: e.target.value,
          },
        });
        break;
      case 'hyperLink':
        this.setState({
          citationObject: {
            ...this.state.citationObject,
            hyperLink: e.target.value,
          },
        });
        break;
      case 'dateAccessed':
        this.setState({
          citationObject: {
            ...this.state.citationObject,
            dateAccessed: e.target.value,
          },
        });
        break;
      case 'publishedDate':
        this.setState({
          citationObject: {
            ...this.state.citationObject,
            publishedDate: e.target.value,
          },
        });
        break;
    }
    this.setSourceText();
  }

  _cancel = (): void => {
    this.props.close();
  };

  _save = (): void => {    
    this.props.close(this.state.citationObject);
  };

  _onSearch() {
    this.props.editorView.runtime.getCitationsAsync().then((result) => {
      if (result) {
        let lstcitation = result;
        console.log('The saved citations are:', lstcitation);
      }
    });
  }
}

export default CitationDialog;
