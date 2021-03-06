// @flow
// [FS] IRAD-1048 2020-09-24
// UI for Custom Style edit
//Need to change the button binding implementation
import * as React from 'react';
import './custom-style-edit.css';
import ColorEditor from './ColorEditor';
import createPopUp from './createPopUp';
import { FONT_PT_SIZES } from './FontSizeCommandMenuButton';
import { FONT_TYPE_NAMES } from '../FontTypeMarkSpec';
import { getLineSpacingValue } from './toCSSLineSpacing';
import { isCustomStyleExists } from '../customStyle';
import { RESERVED_STYLE_NONE } from '../ParagraphNodeSpec';
import { EditorState } from 'prosemirror-state';
import type { EditorRuntime, StyleProps } from '../Types';

let customStyles: StyleProps[] = [];
const otherStyleSelected = false;
const editedStyles = [];

// Values to show in Linespacing drop-down
const LINE_SPACE = ['Single', '1.15', '1.5', 'Double'];
// Values to show in numbering/indent drop-down
const LEVEL_VALUES = [
  'None',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
];

const SAMPLE_TEXT = `Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample.
Sample Text Sample Text Sample Text Sample Text Sample Text`;
class CustomStyleEditor extends React.PureComponent<any, any> {
  _unmounted = false;
  _popUp = null;

  constructor(props: any) {
    super(props);
    this.state = {
      ...props,
      otherStyleSelected,
      customStyles,
    };
    // set default values for text alignment and boldNumbering checkbox.
    if (!this.state.styles.align) {
      this.state.styles.align = 'left';
    }
    if (0 === this.state.mode) {
      this.state.styles.boldNumbering = true;
      this.state.styles.boldSentence = true;
      this.state.styles.nextLineStyleName = RESERVED_STYLE_NONE;
    }
    if (!this.state.styles.fontName) {
      this.state.styles.fontName = 'Arial';
    }
    if (!this.state.styles.fontSize) {
      this.state.styles.fontSize = 11;
    }
    this.getCustomStyles(props.editorView.runtime);
  }

  componentWillUnmount(): void {
    this._unmounted = true;
  }

  // To set the selected style values
  onStyleClick(style: string, event: any) {
    let state = null;
    switch (style) {
      // simple toggles where style matches the key to change.
      case 'strong':

      case 'em':

      case 'strike':

      case 'super':

      case 'underline':
        // copy the current style values, and flip the matching value
        state = { styles: { ...this.state.styles } };
        state.styles[style] = !state.styles[style];
        break;
      case 'name':
        if (event) {
          const oldName = this.state.styleName;
          const newName = event.target.value;
          state = { styleName: newName, styles: null };
          state.styles = { ...this.state.styles };
          if (this.state.styles.nextLineStyleName === oldName) {
            // Update next line style as well.
            state.styles.nextLineStyleName = newName;
          }
        }
        break;

      case 'description':
        if (event) {
          state = { description: event.target.value };
        }
        break;

      case 'before':
        if (event) {
          state = { paragraphSpacingBefore: event.target.value };
        }
        break;

      case 'after':
        if (event) {
          state = { paragraphSpacingAfter: event.target.value };
        }
        break;

      default:
        break;
    }

    // save changes and update
    if (state) {
      this.setState(state, () => this.buildStyle());
    }
  }

  // Build styles to display the example piece
  buildStyle() {
    const style = {};
    if (this.state.styles.fontName) {
      style.fontFamily = this.state.styles.fontName;
    }
    if (this.state.styles.fontSize) {
      style.fontSize = `${this.state.styles.fontSize}px`;
    }
    if (this.state.styles.strong) {
      style.fontWeight = 'bold';
    }
    if (this.state.styles.color) {
      style.color = this.state.styles.color;
    }
    if (this.state.styles.underline) {
      style.textDecoration =
        undefined !== style.textDecoration
          ? `${style.textDecoration}${' underline'}`
          : 'underline';
    }
    if (this.state.styles.strike) {
      style.textDecoration =
        undefined !== style.textDecoration
          ? `${style.textDecoration}${' line-through'}`
          : 'line-through';
    }
    if (this.state.styles.em) {
      style.fontStyle = 'italic';
    }
    if (this.state.styles.textHighlight) {
      style.backgroundColor = this.state.styles.textHighlight;
    }
    if (this.state.styles.align) {
      style.textAlign = this.state.styles.align;
    }
    if (this.state.styles.lineHeight) {
      // [FS] IRAD-1104 2020-11-13
      // Issue fix : Linespacing Double and Single not applied in the sample text paragraph
      style.lineHeight = getLineSpacingValue(this.state.styles.lineHeight);
    }
    // [FS] IRAD-1111 2020-12-10
    // Issue fix : Paragraph space before is not applied in the sample text.
    if (this.state.styles.paragraphSpacingBefore) {
      style.marginTop = `${this.state.styles.paragraphSpacingBefore}px`;
    }
    // [FS] IRAD-1111 2020-12-10
    // Issue fix : Paragraph space after is not applied in the sample text.
    if (this.state.styles.paragraphSpacingAfter) {
      style.marginBottom = `${this.state.styles.paragraphSpacingAfter}px`;
    }
    // [FS] IRAD-1111 2020-12-10
    // Issue fix : Indent is not applied in the sample text.
    if (!this.state.styles.isLevelbased) {
      if (this.state.styles.indent) {
        style.marginLeft = `${this.state.styles.indent * 2}px`;
      }
    } else {
      const levelValue = document && document.getElementById('levelValue');
      if (
        // this covers null & undefined
        levelValue instanceof window.HTMLSelectElement &&
        levelValue.value
      ) {
        style.marginLeft = `${parseInt(levelValue.value) * 2}px`;
      }
    }

    const sampleDiv = document.getElementById('sampletextdiv');
    if (sampleDiv) {
      // [FS] IRAD-1394 2021-06-02
      // Issue: numbering sample not working when select Bold first sentence
      let textSample = SAMPLE_TEXT;
      if (this.state.styles.boldPartial) {
        if (this.state.styles.boldSentence) {
          const content = SAMPLE_TEXT.split('.');
          sampleDiv.innerHTML = `<strong>${content[0]}</strong> ${content[1]}`;
        } else {
          const content = SAMPLE_TEXT.split(' ');
          sampleDiv.innerHTML = `<strong>${content[0]}</strong> ${SAMPLE_TEXT}`;
        }
        textSample = sampleDiv.innerHTML;
      }
      if (this.state.styles.styleLevel && this.state.styles.hasNumbering) {
        // [FS] IRAD-1137 2021-01-11
        // Issue fix : The Preview text is not showing the numbering in bold after Bold Numbering is enabled.
        const sampleDiv = document.getElementById('sampletextdiv');
        if (sampleDiv) {
          if (this.state.styles.boldNumbering) {
            sampleDiv.innerHTML = `<strong>${this.getNumberingLevel(
              this.state.styles.styleLevel
            )}</strong>${textSample}`;
          } else {
            sampleDiv.innerText = `${this.getNumberingLevel(
              this.state.styles.styleLevel
            )}${textSample}`;
          }
        }
      } else {
        sampleDiv.innerText = `${SAMPLE_TEXT}`;
        sampleDiv.innerHTML = textSample;
      }
    }
    return style;
  }
  // [FS] IRAD-1111 2020-12-10
  // get the numbering corresponding to the level
  getNumberingLevel(level: string) {
    let levelStyle = '';
    for (let i = 0; i < parseInt(level); i++) {
      levelStyle = levelStyle + '1.';
    }
    return levelStyle + ' ';
  }

  // handles font name change
  onFontNameChange(e: any) {
    this.setState({
      styles: { ...this.state.styles, fontName: e.target.value },
    });
  }
  // handles indent radio button event
  onIndentRadioChanged(e: any) {
    if ('0' == e.target.value) {
      this.setState({ styles: { ...this.state.styles, isLevelbased: true } });
    } else {
      this.setState({ styles: { ...this.state.styles, isLevelbased: false } });
    }
  }

  // handles scentece bold event
  onScentenceRadioChanged(e: any) {
    if ('0' == e.target.value) {
      this.setState({ styles: { ...this.state.styles, boldSentence: true } });
    } else {
      this.setState({ styles: { ...this.state.styles, boldSentence: false } });
    }
  }

  // handles font size change
  onFontSizeChange(e: any) {
    this.setState({
      styles: { ...this.state.styles, fontSize: e.target.value },
    });
  }

  // handles line space  change
  onLineSpaceChange(e: any) {
    this.setState({
      styles: { ...this.state.styles, lineHeight: e.target.value },
    });
  }
  // handles Level drop down change
  onLevelChange(e: any) {
    const val = RESERVED_STYLE_NONE === e.target.value ? null : e.target.value;
    this.setState({ styles: { ...this.state.styles, styleLevel: val } });
  }

  // handles indent dropdown change
  onIndentChange(e: any) {
    this.setState({
      styles: {
        ...this.state.styles,
        indent: 'None' === e.target.value ? 0 : e.target.value,
      },
    });
  }

  // [FS] IRAD-1201 2021-02-18
  // set the nextLineStyle to JSON on style selection changed
  onOtherStyleSelectionChanged(e: any) {
    if (this.state.otherStyleSelected) {
      this.setState({
        styles: { ...this.state.styles, nextLineStyleName: e.target.value },
      });
    }
  }

  // [FS] IRAD-1201 2021-02-18
  // set the nextLineStyle to JSON according to the selected option
  onNextLineStyleSelected(selectedOption: number) {
    const hiddenDiv = document.getElementById('nextStyle');
    if (hiddenDiv) {
      hiddenDiv.style.display = 'none';
    }
    if (0 === selectedOption) {
      this.setState({
        otherStyleSelected: false,
      });
      this.setState({
        styles: { ...this.state.styles, nextLineStyleName: 'None' },
      });
    } else if (1 === selectedOption) {
      this.setState({
        otherStyleSelected: false,
      });
      this.setState({
        styles: {
          ...this.state.styles,
          nextLineStyleName: this.state.styleName,
        },
      });
    } else {
      if (hiddenDiv) {
        hiddenDiv.style.display = 'block';
      }
      const selectedStyle = document.getElementById('nextStyleValue');
      if (selectedStyle instanceof window.HTMLSelectElement) {
        this.setState({
          otherStyleSelected: true,
          styles: {
            ...this.state.styles,
            nextLineStyleName:
              selectedStyle.options[selectedStyle.selectedIndex].text,
          },
        });
      }
    }
  }

  // [FS] IRAD-1127 2020-12-31
  // to populate the selected custom styles.
  onSelectCustomStyle(e: any) {
    if (null !== customStyles) {
      const value = this.state.customStyles.find(
        (u) => u.styleName === e.target.value
      );
      // FIX: not able to modify and save the populated style
      value.mode = 3;
      this.state = {
        ...value,
      };
      this.setState(this.state);
      this.setNextLineStyle(this.state.styles.nextLineStyleName);
    }
  }

  // shows color dialog based on input text-color/text-heighlight
  showColorDialog(isTextColor: Boolean, event: SyntheticEvent<*>) {
    const anchor = event ? event.currentTarget : null;
    const hex = null;
    this._popUp = createPopUp(
      ColorEditor,
      { hex },
      {
        anchor,
        autoDismiss: true,
        IsChildDialog: true,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            if (undefined !== val) {
              if (isTextColor) {
                this.setState({ styles: { ...this.state.styles, color: val } });
              } else {
                this.setState({
                  styles: { ...this.state.styles, textHighlight: val },
                });
              }
            }
          }
        },
      }
    );
  }

  //handles the option button click, close the popup with selected values
  onAlignButtonClick(val: String) {
    this.setState({ styles: { ...this.state.styles, align: val } });
  }

  handleNumbering(val: any) {
    // if user select numbering, then always set nextLineStyle as continues this style.
    // [FS] IRAD-1221 2021-03-01
    // Issue fix: The next line style not switch back to 'None' when disable the numbering.
    this.setState({
      styles: {
        ...this.state.styles,
        hasNumbering: val.target.checked,
        nextLineStyleName: val.target.checked
          ? this.state.styleName
          : RESERVED_STYLE_NONE,
      },
    });
  }

  // handles the boldNumbering checkbox actions
  handleBoldNumbering(val: any) {
    this.setState({
      styles: { ...this.state.styles, boldNumbering: val.target.checked },
    });
  }

  // handles the boldNumbering checkbox actions
  handleBoldPartial(val: any) {
    this.setState({
      styles: { ...this.state.styles, boldPartial: val.target.checked },
    });
    // this.setState({ styles: { ...this.state.styles, boldSentence: val.target.checked ? true : false } });
  }

  // [FS] IRAD-1201 2021-02-17
  // to check if the "select style" option selected by user
  selectStyleCheckboxState() {
    let chceked = false;
    if (this.state.styles.nextLineStyleName) {
      chceked =
        this.state.styles.nextLineStyleName !== 'None' &&
        this.state.styles.nextLineStyleName !== this.state.styleName;
    }
    return chceked;
  }

  componentDidMount() {
    const acc = document.getElementsByClassName('licit-accordion');
    let i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener('click', function () {
        this.classList.toggle('accactive');
        const panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    }
    const mp = document.getElementsByClassName('panel')[0];
    mp.style.maxHeight = mp.scrollHeight + 'px';
    const mp1 = document.getElementsByClassName('panel1')[0];
    mp1.style.maxHeight = mp1.scrollHeight + 'px';
    const mp2 = document.getElementsByClassName('panel2')[0];
    mp2.style.maxHeight = mp2.scrollHeight + 'px';
    const mp3 = document.getElementsByClassName('panel3')[0];
    mp3.style.maxHeight = mp3.scrollHeight + 'px';

    this.setNextLineStyle(this.state.styles.nextLineStyleName);
    // [FS] IRAD-1153 2021-02-25
    // Numbering level not showing in Preview text when modify style
    if (
      1 == this.props.mode &&
      this.state.styles.styleLevel &&
      this.state.styles.hasNumbering
    ) {
      this.buildStyle();
    }
  }

  render(): React.Element<any> {
    return (
      <div className="customedit-div">
        <div className="customedit-head">
          <span>{this.state.mode == 0 ? 'Create Style' : 'Edit Style'}</span>
        </div>
        <div className="customedit-body">
          <div className="sectiondiv">
            <div
              style={
                3 > this.props.mode ? { display: 'none' } : { display: 'block' }
              }
            >
              <p className="formp">Styles:</p>
              <select
                className="stylenameinput fontstyle"
                defaultValue={'DEFAULT'}
                onChange={this.onSelectCustomStyle.bind(this)}
                style={{ height: '24px' }}
              >
                <option disabled value="DEFAULT">
                  {' '}
                  -- select a style --{' '}
                </option>
                {this.state.customStyles.map((style) => (
                  <option key={style.styleName} value={style.styleName}>
                    {style.styleName}
                  </option>
                ))}
              </select>
            </div>
            <p className="formp">
              Style Name:{' '}
              <span id="errormsg" style={{ display: 'none', color: 'red' }}>
                {isCustomStyleExists(this.state.styleName)
                  ? 'Style name already exists'
                  : ''}
              </span>
            </p>
            <span>
              <input
                autoFocus
                className="stylenameinput fontstyle"
                disabled={
                  this.state.mode == 1 || this.state.mode == 3 ? true : false
                }
                id="txtName"
                key="name"
                onChange={this.onStyleClick.bind(this, 'name')}
                type="text"
                value={this.state.styleName || ''}
              />
            </span>
            <p className="formp">Description:</p>
            <span>
              <input
                className="stylenameinput fontstyle"
                key="description"
                onChange={this.onStyleClick.bind(this, 'description')}
                type="text"
                value={this.state.description || ''}
              />
            </span>

            <p className="formp">Preview:</p>
            <div
              className="textareadiv"
              name="body"
              style={
                3 == this.props.mode ? { height: '164px' } : { height: '215px' }
              }
            >
              <div className="sampletext">
                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                Paragraph Paragraph Paragraph Paragraph
              </div>
              <div
                className={
                  this.state.styles.super
                    ? 'hide-sampletext'
                    : 'visible-sampletext'
                }
                id="sampletextdiv"
                style={this.buildStyle()}
              >
                {SAMPLE_TEXT}
              </div>
              <sup
                className={
                  this.state.styles.super
                    ? 'visible-sampletext'
                    : 'hide-sampletext'
                }
                id="mo-sup"
                style={this.buildStyle()}
              >
                {SAMPLE_TEXT}
              </sup>
              <div className="sampletext">
                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                Paragraph Paragraph
              </div>
            </div>
          </div>

          <div
            className="sectiondiv editorsection"
            style={this.disableRename()}
          >
            <p className="formp">Style Attributes:</p>
            <div
              style={{
                height: '329px',
                overflow: 'hidden auto',
                overflowX: 'hidden',
                border: '1px solid',
              }}
            >
              <button className="licit-accordion accactive" id="accordion1">
                <div className="indentdiv">
                  <span
                    className="iconspan czi-icon text_format"
                    style={{ marginTop: '1px' }}
                  >
                    text_format
                  </span>
                  <label
                    style={{
                      marginLeft: '-10px',
                      marginTop: '2px',
                      color: '#444',
                    }}
                  >
                    Font
                  </label>
                </div>
              </button>
              <div className="panel">
                <div className="sectiondiv">
                  <select
                    className="fonttype fontstyle"
                    onChange={this.onFontNameChange.bind(this)}
                    value={this.state.styles.fontName || 'Arial'}
                  >
                    {FONT_TYPE_NAMES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <select
                    className="fontsize fontstyle"
                    onChange={this.onFontSizeChange.bind(this)}
                    value={this.state.styles.fontSize || 11}
                  >
                    {FONT_PT_SIZES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="font-buttons">
                  <span
                    aria-label=" Bold"
                    className="czi-tooltip-surface markbutton-container"
                    data-tooltip=" Bold"
                    id="86ba3aa0-ff11-11ea-930a-95c69ca4f97f"
                    onClick={this.onStyleClick.bind(this, 'strong')}
                    role="tooltip"
                    style={{ marginLeft: '5px', marginRight: '5px' }}
                  >
                    <span
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.strong
                          ? 'czi-custom-button use-icon active markbuttons'
                          : 'czi-custom-button use-icon markbuttons'
                      }
                      role="button"
                    >
                      <span className="iconspan czi-icon format_bold editor-markbuttons">
                        format_bold
                      </span>
                    </span>
                  </span>
                  <span
                    aria-label=" Italic"
                    className="czi-tooltip-surface fontstyle markbutton-container"
                    data-tooltip=" Italic"
                    id="86ba61b0-ff11-11ea-930a-95c69ca4f97f"
                    onClick={this.onStyleClick.bind(this, 'em')}
                    role="tooltip"
                  >
                    <span
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.em
                          ? 'czi-custom-button use-icon active markbuttons'
                          : 'czi-custom-button use-icon markbuttons'
                      }
                      role="button"
                    >
                      <span className="iconspan czi-icon format_italic editor-markbuttons">
                        format_italic
                      </span>
                      <span> </span>
                    </span>
                  </span>
                  <span
                    aria-label=" Underline"
                    className="czi-tooltip-surface fontstyle markbutton-container"
                    data-tooltip=" Underline"
                    id="86ba88c0-ff11-11ea-930a-95c69ca4f97f"
                    onClick={this.onStyleClick.bind(this, 'underline')}
                    role="tooltip"
                  >
                    <span
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.underline
                          ? 'czi-custom-button use-icon active markbuttons'
                          : 'czi-custom-button use-icon markbuttons'
                      }
                      role="button"
                    >
                      <span className="iconspan czi-icon  format_underline editor-markbuttons">
                        format_underline
                      </span>
                      <span> </span>
                    </span>
                  </span>
                  <span
                    aria-label=" Text color"
                    className="czi-tooltip-surface fontstyle markbutton-container"
                    data-tooltip=" Text color"
                    id="86bad6e1-ff11-11ea-930a-95c69ca4f97f"
                    onClick={this.showColorDialog.bind(this, true)}
                    role="tooltip"
                  >
                    <span
                      aria-disabled="false"
                      aria-pressed="false"
                      className="czi-custom-button use-icon markbuttons"
                      role="button"
                    >
                      <span
                        className="iconspan czi-icon format_color_text editor-markbuttons"
                        style={{
                          color:
                            this.state.styles.color !== 'rgba(0,0,0,0)'
                              ? this.state.styles.color
                              : '#666',
                        }}
                      >
                        format_color_text
                      </span>
                      <span> </span>
                    </span>
                  </span>
                  <span
                    aria-label=" Highlight color"
                    className="czi-tooltip-surface fontstyle markbutton-container"
                    data-tooltip=" Highlight color"
                    id="86bafdf0-ff11-11ea-930a-95c69ca4f97f"
                    onClick={this.showColorDialog.bind(this, false)}
                    role="tooltip"
                  >
                    <span
                      aria-disabled="false"
                      aria-pressed="false"
                      className="czi-custom-button use-icon markbuttons"
                      role="button"
                    >
                      <span
                        className=" iconspan czi-icon border_color editor-markbuttons"
                        style={{
                          color:
                            this.state.styles.textHighlight !== 'rgba(0,0,0,0)'
                              ? this.state.styles.textHighlight
                              : '#666',
                        }}
                      >
                        border_color
                      </span>
                      <span> </span>
                    </span>
                  </span>
                </div>

                <div className="formp hierarchydiv">
                  <span style={{ float: 'left' }}>
                    <label>
                      <input
                        checked={this.state.styles.boldPartial}
                        onChange={this.handleBoldPartial.bind(this)}
                        type="checkbox"
                      />
                      Bold the
                    </label>
                  </span>
                  <span>
                    <input
                      checked={this.state.styles.boldSentence}
                      disabled={this.state.styles.boldPartial ? false : true}
                      name="boldscentence"
                      onChange={this.onScentenceRadioChanged.bind(this)}
                      style={{ marginLeft: '20px' }}
                      type="radio"
                      value="0"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      First Sentence
                    </label>
                    <input
                      checked={!this.state.styles.boldSentence}
                      disabled={this.state.styles.boldPartial ? false : true}
                      name="boldscentence"
                      onChange={this.onScentenceRadioChanged.bind(this)}
                      style={{ marginLeft: '20px' }}
                      type="radio"
                      value="1"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      First Word
                    </label>
                  </span>
                </div>
              </div>
              <button className="licit-accordion accactive">
                <div className="indentdiv">
                  <span
                    className="iconspan czi-icon format_textdirection_l_to_r"
                    style={{ marginTop: '1px' }}
                  >
                    format_textdirection_l_to_r
                  </span>
                  <label
                    style={{
                      marginLeft: '-10px',
                      marginTop: '2px',
                      color: '#444',
                    }}
                  >
                    Paragraph
                  </label>
                </div>
              </button>
              <div className="panel1">
                <p className="formp">Alignment:</p>
                <div className="czi-custom-buttons">
                  <span
                    aria-label=" Align Left"
                    className="czi-tooltip-surface"
                    data-tooltip=" Align Left"
                    id="86ba3aa0-ff11-11ea-930a-95c69ca4f97f"
                    role="tooltip"
                  >
                    <span
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.align == 'left'
                          ? 'czi-custom-button use-icon activealignbuttons'
                          : 'czi-custom-button alignbuttons'
                      }
                      onClick={this.onAlignButtonClick.bind(this, 'left')}
                      role="button"
                    >
                      <span className="iconspan czi-icon format_align_left">
                        format_align_left
                      </span>
                    </span>
                  </span>
                  <span
                    aria-label=" Align Center"
                    className="czi-tooltip-surface alignbuttons"
                    data-tooltip=" Align Center"
                    id="86ba61b0-ff11-11ea-930a-95c69ca4f97f"
                    role="tooltip"
                  >
                    <span
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.align == 'center'
                          ? 'czi-custom-button use-icon activealignbuttons'
                          : 'czi-custom-button  alignbuttons'
                      }
                      onClick={this.onAlignButtonClick.bind(this, 'center')}
                      role="button"
                    >
                      <span className="iconspan czi-icon format_align_center">
                        format_align_center
                      </span>
                    </span>
                  </span>
                  <span
                    aria-label=" Align Right"
                    className="czi-tooltip-surface alignbuttons"
                    data-tooltip=" Align Right"
                    id="86ba88c0-ff11-11ea-930a-95c69ca4f97f"
                    role="tooltip"
                  >
                    <span
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.align == 'right'
                          ? 'czi-custom-button use-icon activealignbuttons'
                          : 'czi-custom-button  alignbuttons'
                      }
                      onClick={this.onAlignButtonClick.bind(this, 'right')}
                      role="button"
                    >
                      <span className="iconspan czi-icon format_align_right">
                        format_align_right
                      </span>
                    </span>
                  </span>
                  <span
                    aria-label=" Justify"
                    className="czi-tooltip-surface alignbuttons"
                    data-tooltip=" Justify"
                    id="86baafd0-ff11-11ea-930a-95c69ca4f97f"
                    role="tooltip"
                  >
                    <span
                      aria-disabled="false"
                      aria-pressed="false"
                      className={
                        this.state.styles.align == 'justify'
                          ? 'czi-custom-button use-icon activealignbuttons'
                          : 'czi-custom-button  alignbuttons'
                      }
                      onClick={this.onAlignButtonClick.bind(this, 'justify')}
                      role="button"
                    >
                      <span className="iconspan czi-icon format_align_justify">
                        format_align_justify
                      </span>
                    </span>
                  </span>
                </div>
                <p className="formp">Line Spacing:</p>
                <select
                  className="linespacing fontstyle"
                  onChange={this.onLineSpaceChange.bind(this)}
                  value={this.state.styles.lineHeight || ''}
                >
                  {LINE_SPACE.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <p className="formp">Paragraph Spacing:</p>

                <div className="spacingdiv">
                  <label>Before: </label>
                  <span>
                    <input
                      className="spacinginput fontstyle"
                      key="before"
                      onChange={this.onStyleClick.bind(this, 'before')}
                      type="text"
                      value={this.state.styles.paragraphSpacingBefore || ''}
                    />
                  </span>
                  <label style={{ marginLeft: '3px' }}> pts</label>

                  <label style={{ marginLeft: '23px' }}>After: </label>
                  <span>
                    <input
                      className="spacinginput fontstyle"
                      key="after"
                      onChange={this.onStyleClick.bind(this, 'after')}
                      type="text"
                      value={this.state.styles.paragraphSpacingAfter || ''}
                    />
                  </span>
                  <label style={{ marginLeft: '3px' }}>pts</label>
                </div>
              </div>
              <button className="licit-accordion accactive">
                <div className="indentdiv">
                  <span className="iconspan czi-icon account_tree">
                    account_tree
                  </span>
                  <label
                    style={{
                      marginLeft: '-7px',
                      marginTop: '2px',
                      color: '#444',
                    }}
                  >
                    Hierarchy
                  </label>
                </div>
              </button>
              <div className="panel2 formp">
                <p className="formp">Level:</p>
                <div className="hierarchydiv">
                  <span style={{ float: 'left', marginTop: '8px' }}>
                    <select
                      className="leveltype fontstyle"
                      id="levelValue"
                      onChange={this.onLevelChange.bind(this)}
                      value={this.state.styles.styleLevel || ''}
                    >
                      {LEVEL_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </span>
                  <span>
                    <label>
                      <input
                        checked={this.state.styles.hasNumbering}
                        className="chknumbering"
                        disabled={this.state.styles.styleLevel ? false : true}
                        onChange={this.handleNumbering.bind(this)}
                        type="checkbox"
                      />
                      Numbering(1.1)
                    </label>
                    <label>
                      <input
                        checked={this.state.styles.boldNumbering}
                        className="chkboldnumbering"
                        disabled={this.state.styles.hasNumbering ? false : true}
                        onChange={this.handleBoldNumbering.bind(this)}
                        type="checkbox"
                      />
                      Bold numbering
                    </label>
                  </span>
                </div>
                <p className="formp">Indenting:</p>
                <div className="hierarchydiv">
                  <div className="indentdiv">
                    <input
                      checked={this.state.styles.isLevelbased}
                      name="indenting"
                      onChange={this.onIndentRadioChanged.bind(this)}
                      type="radio"
                      value="0"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      Based On Level
                    </label>
                  </div>
                  <div className="indentdiv">
                    <input
                      checked={!this.state.styles.isLevelbased}
                      name="indenting"
                      onChange={this.onIndentRadioChanged.bind(this)}
                      type="radio"
                      value="1"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      Specified
                    </label>
                    <span>
                      <select
                        className="leveltype specifiedindent fontstyle"
                        onChange={this.onIndentChange.bind(this)}
                        style={{ width: '99px !important' }}
                        value={this.state.styles.indent || ''}
                      >
                        {LEVEL_VALUES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </span>
                  </div>
                </div>
              </div>

              <button className="licit-accordion accactive">
                <div className="indentdiv">
                  <label
                    style={{
                      marginLeft: '-7px',
                      marginTop: '2px',
                      color: '#444',
                    }}
                  >
                    Style Settings
                  </label>
                </div>
              </button>

              <div className="panel3 formp">
                <p className="formp">Select style for next line:</p>
                <div className="hierarchydiv">
                  <div className="settingsdiv">
                    <input
                      checked={
                        this.state.styles.nextLineStyleName ===
                          this.state.styleName && !this.state.otherStyleSelected
                      }
                      name="nextlinestyle"
                      onChange={this.onNextLineStyleSelected.bind(this, 1)}
                      type="radio"
                      value="1"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      Continue this style
                    </label>
                  </div>
                  <div className="settingsdiv">
                    <input
                      checked={this.state.styles.nextLineStyleName === 'None'}
                      name="nextlinestyle"
                      onChange={this.onNextLineStyleSelected.bind(this, 0)}
                      style={{
                        marginLeft: '20px',
                      }}
                      type="radio"
                      value="2"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                      }}
                    >
                      None
                    </label>
                  </div>
                  <div className="indentdiv">
                    <input
                      checked={this.state.otherStyleSelected}
                      name="nextlinestyle"
                      onChange={this.onNextLineStyleSelected.bind(this, 2)}
                      type="radio"
                      value="0"
                    />
                    <label
                      style={{
                        marginLeft: '4px',
                        marginTop: '3px',
                        marginBottom: '0',
                        width: '62px',
                      }}
                    >
                      Select style
                    </label>
                    <span id="nextStyle" style={{ display: 'none' }}>
                      <select
                        className="fontstyle stylenameinput"
                        // defaultValue={'DEFAULT'}
                        id="nextStyleValue"
                        onChange={this.onOtherStyleSelectionChanged.bind(this)}
                        style={{
                          height: '20px',
                          marginLeft: '7px',
                          width: '97px',
                        }}
                        value={this.state.styles.nextLineStyleName}
                      >
                        {customStyles.map((style) => (
                          <option key={style.styleName}>
                            {style.styleName}
                          </option>
                        ))}
                      </select>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="btns">
          <button className="buttonstyle" onClick={this._cancel}>
            {this.state.mode == 3 ? 'Close' : 'Cancel'}
          </button>
          <button
            className="btnsave buttonstyle"
            onClick={this._save.bind(this)}
            onKeyDown={this.handleKeyDown}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  _cancel = (): void => {
    // [FS] IRAD-1231 2021-03-02
    // FIX: edited custom styles not applied to the document
    if (3 === this.state.mode) {
      delete this.state.customStyles;
      this.props.close(editedStyles);
    } else {
      this.props.close();
    }
  };

  _save = (): void => {
    delete this.state.otherStyleSelected;
    // [FS] IRAD-1137 2021-01-15
    // FIX: able to save a custom style name with already exist style name
    if (0 === this.state.mode && isCustomStyleExists(this.state.styleName)) {
      const errMsg = document.getElementById('errormsg');
      if (errMsg && errMsg.style) {
        errMsg.style.display = '';
      }

      // [FS] IRAD-1176 2021-02-08
      // save the custom styles from Edit all option.
    } else if (3 === this.state.mode) {
      this.modifyCustomStyle(this.state);
      editedStyles.push(this.state.styleName);
    } else {
      if ('' != this.state.styleName) {
        delete this.state.customStyles;
        this.props.close(this.state);
      }
    }
  };

  handleKeyDown = (e: KeyboardEvent): void => {
    const txtName = document.getElementById('txtName');
    if (txtName) {
      txtName.focus();
    }
  };
  // [FS] IRAD-1176 2021-02-08
  // save the custom styles from Edit all option.
  modifyCustomStyle(val: EditorState) {
    const { runtime } = this.props.editorView;
    if (runtime && typeof runtime.saveStyle === 'function') {
      delete val.editorView;
      runtime.saveStyle(val).then((result) => {});
    }
  }

  // To fetch the custom styles from server and set to the state.
  getCustomStyles(runtime: EditorRuntime) {
    if (runtime && typeof runtime.getStylesAsync === 'function') {
      runtime.getStylesAsync().then((result) => {
        customStyles = result;
        // [FS] IRAD-1222 2021-03-01
        // Issue fix: In edit all, the style list not showing the first time.
        this.setState({
          customStyles: result,
        });
      });
    }
  }

  // [FS] IRAD-1231 2021-03-03
  // Issue fix: Selected style for next line not retaining when modify.
  setNextLineStyle(nextLineStyleName: string) {
    // [FS] IRAD-1241 2021-03-05
    // The selcted Style in the Next line setting not retaing in Edit All and modify
    let display = '';

    if (
      0 < this.props.mode &&
      nextLineStyleName &&
      RESERVED_STYLE_NONE !== nextLineStyleName &&
      nextLineStyleName !== this.state.styleName
    ) {
      this.setState({
        otherStyleSelected: true,
      });

      display = 'block';
      const selectedStyle = document.getElementById('nextStyleValue');
      if (selectedStyle instanceof window.HTMLSelectElement) {
        selectedStyle.value = nextLineStyleName;
      }
    } else {
      this.setState({
        otherStyleSelected: false,
      });

      display = 'none';
    }

    const hiddenDiv = document.getElementById('nextStyle');
    if (hiddenDiv && hiddenDiv.style) {
      hiddenDiv.style.display = display;
    }
  }

  // Disable the style attribute div on Rename
  disableRename() {
    const style = {};
    if (2 === this.state.mode) {
      style.opacity = 0.4;
      style.pointerEvents = 'none';
    }

    return style;
  }
}

export default CustomStyleEditor;
