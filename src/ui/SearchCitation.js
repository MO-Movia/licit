// @flow

// [FS] IRAD-1251 2021-03-10
// UI for Citation dialog
import * as React from 'react';
import './citation-note.css';

const DATES = ['Published', 'Issued', 'Posted'];
let citations = [];
let citationUseObject = {};
let selectedRefID = '';

export function getCustomCapco() {
  const capcoList = localStorage.getItem('customCapcoList');
  let retList = [];
  if (capcoList) {
    retList = JSON.parse(capcoList);
  }
  return retList;
}

class SearchCitation extends React.PureComponent<any, any> {
  _unmounted = false;
  _popUp = null;

  constructor(props: any) {
    super(props);
    this.state = {
      ...props,
      citationUseObject,
    };
    this.getCitations(props.editorView.runtime);
  }

  // To fetch the custom styles from server and set to the state.
  getCitations(runtime: any) {
    if (runtime && typeof runtime.getCitationsAsync === 'function') {
      runtime.fetchCitations().then((result) => {
        if (result) {
          citations = result;
          this.populateCitations();
        }
      });
    }
  }

  populateCitations() {
    const table = document.getElementById('datas');

    if (table instanceof window.HTMLTableElement) {
      table.innerHTML = '';
      // this.props.editorView.runtime.getCitationsAsync().then((result) => {
      if (citations) {
        let tr = '';
        citations.forEach((obj) => {
          tr += '<tr className="citationrow" >';
          tr +=
            '<td className="citationcolumn">' +
            obj.documentTitle +
            '</td>' +
            '<td className="citationcolumn">' +
            obj.publishedDate +
            '</td>' +
            '<td className="citationcolumn">' +
            obj.referenceId +
            '</td>' +
            '<td className="citationcolumn">' +
            obj.author +
            '</td>';
          tr += '</tr>';
        });
        table.innerHTML += tr;
        this.addRowClickEvent();
      }
    }
  }

  addRowClickEvent() {
    const table = document.getElementById('myTable');
    if (table instanceof window.HTMLTableElement) {
      const rows = table.rows;
      for (let i = 0; i < rows.length; i++) {
        rows[i].onclick = (function (k: number) {
          return function () {
            this.style.backgroundColor = '#eaeaea';
            selectedRefID = this.cells[2].innerHTML;
          };
        })(i);
      }
    }
  }

  onSelectCitation() {
    if (citations && '' !== selectedRefID) {
      citationUseObject = citations.find(
        (u) => u.referenceId === selectedRefID
      );
      this.state = this.createCitationUseObject();
    }
  }

  createCitationUseObject() {
    return {
      citationUseObject: citationUseObject,
      sourceText: '',
      mode: this.state.mode, //0 = new , 1- modify, 2- delete
      editorView: this.state.editorView,
    };
  }

  componentWillUnmount(): void {
    this._unmounted = true;
  }

  componentDidMount() {}

  render(): React.Element<any> {
    return (
      <div
        style={{
          width: '780px',
          border: '1px solid lightgray',
          boxShadow: '1px 1px',
        }}
      >
        <form className="czi-form" style={{height: '224px'}}>
          <div className="searchDiv">
            <div className="div-display" style={{display: 'none'}}>
              <label
                className="citation-label"
                style={{display: 'block', marginLeft: '2px'}}
              >
                Document Title
              </label>
              <input
                className="textborder"
                style={{height: '20px', width: '170px'}}
                type="text"
              />
            </div>

            <div className="div-display" style={{display: 'none'}}>
              <label
                className="citation-label"
                style={{display: 'block', marginLeft: '10px'}}
              >
                Reference ID
              </label>
              <input
                className="textborder"
                style={{height: '20px', width: '170px', marginLeft: '10px'}}
                type="text"
              />
            </div>

            <div className="div-display" style={{display: 'none'}}>
              <label
                className="citation-label"
                style={{
                  display: 'block',
                  marginLeft: '2px',
                  marginLeft: '10px',
                }}
              >
                Author
              </label>
              <input
                className="textborder"
                style={{height: '20px', width: '170px', marginLeft: '10px'}}
                type="text"
              />
            </div>

            <div className="div-display" style={{display: 'none'}}>
              <div className="div-display">
                <div>
                  <select
                    className="citation-label"
                    style={{border: 'none', marginLeft: '10px'}}
                  >
                    {DATES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  style={{height: '21px', marginLeft: '10px', width: '175px'}}
                  type="date"
                />
              </div>
            </div>
            <div>
              <table className="tableCitations" id="myTable">
                <thead style={{backgroundColor: 'lightgray'}}>
                  <tr className="citationrow">
                    <th className="citationsheader">Document Title</th>
                    <th className="citationsheader">Published Date</th>
                    <th className="citationsheader">Reference ID</th>
                    <th className="citationsheader">Author</th>
                  </tr>
                </thead>
                <tbody id="datas" style={{lineHeight: '21px'}}></tbody>
              </table>
            </div>

            <div
              style={{float: 'right', marginRight: '-8px', marginTop: '5px'}}
            >
              <button
                onClick={this._save.bind(this)}
                style={{display: 'none', height: '27px', width: '60px'}}
              >
                OK
              </button>
            </div>
          </div>
          <hr
            className="hr-width"
            style={{marginBottom: '5px', marginTop: '1px'}}
          ></hr>
          <div style={{float: 'right'}}>
            <button
              className="btnsave"
              onClick={this._save.bind(this)}
              style={{height: '27px', width: '60px'}}
            >
              OK
            </button>
          </div>
        </form>
      </div>
    );
  }

  _cancel = (): void => {
    this.props.close();
  };

  _save = (): void => {
    this.onSelectCitation();
    this.props.close(this.state);
  };
}

export default SearchCitation;
