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
import { getCustomStyles } from '../customStyle';

// Values to show in indent drop-down
const INDENT_VALUES = [
    {
        label: 'None',
        value: 'None'
    },
    {
        label: '- 1',
        value: '1'
    },
    {
        label: '- - 2',
        value: '2'
    },
    {
        label: '- - - 3',
        value: '3'
        ,
    },
    {
        label: '- - - - 4',
        value: '4'
    },
    {
        label: '- - - - - 5',
        value: '5'
    },
    {
        label: '- - - - - - 6',
        value: '6'
    },
    {
        label: '- - - - - - - 7',
        value: '7'
    },
    {
        label: '- - - - - - - - 8',
        value: '8'
    }


];

let customStyles = [];
getCustomStyles().then((result) => { 
    customStyles = result;  
  });


// Values to show in Linespacing drop-down
const LINE_SPACE = [
    'Single',
    '1.15',
    '1.5',
    'Double'
];
// Values to show in numbering drop-down
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
    '10'
];

const SAMPLE_TEXT = `Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample
Sample Text Sample Text Sample Text Sample Text Sample Text`;
class CustomStyleEditor extends React.PureComponent<any, any> {

    _unmounted = false;
    _popUp = null;

    constructor(props: any) {
        super(props);
        this.state = {
            ...props
        };
        // set default values for text alignment and boldNumbering checkbox.
        if (!this.state.styles.align) {
            this.state.styles.align = 'left';
        }
        if (0 === this.state.mode) {
            this.state.styles.boldNumbering = true;
            this.state.styles.boldScentence = true;
        }
    };

    componentWillUnmount(): void {
        this._unmounted = true;
    }

    // To set the selected style values
    onStyleClick(style: string, event: any) {

        switch (style) {
            case 'strong':
                this.setState({
                    styles: { ...this.state.styles, strong: !this.state.styles.strong }
                });
                break;

            case 'em':
                this.setState({
                    styles: { ...this.state.styles, em: !this.state.styles.em }
                });
                break;

            case 'strike':
                this.setState({
                    styles: { ...this.state.styles, strike: !this.state.styles.strike }
                });
                break;

            case 'super':
                this.setState({
                    styles: { ...this.state.styles, super: !this.state.styles.super }
                });
                break;

            case 'underline':
                this.setState({
                    styles: { ...this.state.styles, underline: !this.state.styles.underline }
                });
                break;
            case 'name':
                if (undefined !== event) {
                    this.setState({
                        stylename: event.target.value
                    }
                    );
                }
                break;

            case 'description':
                if (undefined !== event) {
                    this.setState({
                        description: event.target.value
                    }
                    );
                }
                break;
            case 'before':
                if (undefined !== event) {

                    this.setState({
                        styles: { ...this.state.styles, spacebefore: event.target.value }
                    });

                }
                break;
            case 'after':
                if (undefined !== event) {
                    this.setState({
                        styles: { ...this.state.styles, spaceafter: event.target.value }
                    });
                }
                break;
            default:
                break;
        }
        this.buildStyle();
    }

    // Build styles to display the example piece
    buildStyle() {

        const style = {};
        if (this.state.styles.fontname) {
            style.fontFamily = this.state.styles.fontname;
        }
        if (this.state.styles.fontsize) {
            style.fontSize = `${this.state.styles.fontsize}px`;
        }
        if (this.state.styles.strong) {
            style.fontWeight = 'bold';
        }
        if (this.state.styles.color) {
            style.color = this.state.styles.color;
        }
        if (this.state.styles.underline) {
            style.textDecoration = undefined !== style.textDecoration ? `${style.textDecoration}${' underline'}` :
                'underline';
        }
        if (this.state.styles.strike) {
            style.textDecoration = undefined !== style.textDecoration ? `${style.textDecoration}${' line-through'}` :
                'line-through';
        }
        if (this.state.styles.em) {
            style.fontStyle = 'italic';
        }
        if (this.state.styles.texthighlight) {
            style.backgroundColor = this.state.styles.texthighlight;
        }
        if (this.state.styles.align) {
            style.textAlign = this.state.styles.align;
        }
        if (this.state.styles.lineheight) {
            // [FS] IRAD-1104 2020-11-13
            // Issue fix : Linespacing Double and Single not applied in the sample text paragrapgh
            style.lineHeight = getLineSpacingValue(this.state.styles.lineheight);
        }
        // [FS] IRAD-1111 2020-12-10
        // Issue fix : Paragrapgh space before is not applied in the sample text.
        if (this.state.styles.spacebefore) {
            style.marginTop = `${this.state.styles.spacebefore}px`;
        }
        // [FS] IRAD-1111 2020-12-10
        // Issue fix : Paragrapgh space after is not applied in the sample text.
        if (this.state.styles.spaceafter) {
            style.marginBottom = `${this.state.styles.spaceafter}px`;
        }
        // [FS] IRAD-1111 2020-12-10
        // Issue fix : Indent is not applied in the sample text.
        if (!this.state.styles.islevelbased) {
            if (this.state.styles.indent) {
                style.marginLeft = `${this.state.styles.indent * 2}px`;
            }
        }
        else {
            const levelValue = document && document.getElementById('levelValue');
            if (levelValue && levelValue.value) {
                style.marginLeft = `${levelValue.value * 2}px`;
            }
        }

        if (this.state.styles.level && this.state.styles.hasnumbering) {
            if (document.getElementById('sampletextdiv')) {
                document.getElementById('sampletextdiv').innerText = `${this.getNumberingLevel(this.state.styles.level)}${SAMPLE_TEXT}`;
            }
        }
        return style;
    }
    // [FS] IRAD-1111 2020-12-10
    // get the numbering corresponding to the level
    getNumberingLevel(level: string) {
        let levelStyle = '';
        for (let i = 0; i < level; i++) {
            levelStyle = levelStyle + '1.';
        }
        return levelStyle + ' ';
    }

    // handles font name change
    onFontNameChange(e: any) {
        this.setState({ styles: { ...this.state.styles, fontname: e.target.value } });
    }
    // handles indent radio button event
    onIndentRadioChanged(e: any) {
        if ('0' == e.target.value) {
            this.setState({ styles: { ...this.state.styles, islevelbased: true } });
        }
        else {
            this.setState({ styles: { ...this.state.styles, islevelbased: false } });
        }

    }

    // handles scentece bold event
    onScentenceRadioChanged(e: any) {
        if ('0' == e.target.value) {
            this.setState({ styles: { ...this.state.styles, boldScentence: true } });
        }
        else {
            this.setState({ styles: { ...this.state.styles, boldScentence: false } });
        }

    }


    // handles font size change
    onFontSizeChange(e: any) {
        this.setState({ styles: { ...this.state.styles, fontsize: e.target.value } });

    }

    // handles line space  change
    onLineSpaceChange(e: any) {
        this.setState({ styles: { ...this.state.styles, lineheight: e.target.value } });

    }
    // handles Level drop down change
    onLevelChange(e: any) {
        const val = 'None' === e.target.value ? null : e.target.value;
        this.setState({ styles: { ...this.state.styles, level: val } });
    }

    // handles indent dropdown change
    onIndentChange(e: any) {

this.setState({ styles: { ...this.state.styles, indent: 'None' === e.target.value ? 0 : e.target.value } });
    }

    onSelectCustomStyle(e: any) {
        const value = customStyles.find(u => u.stylename === e.target.value);
        this.populateControls(value,e.target.value);
        //  const value = Array.from(e.target.selectedOptions, option => option.value);
         console.log(this.state);
    }

    populateControls(styles,stylename){
        this.setState({ styles:{}});
        this.state.stylename= stylename;
        this.state.description= stylename;
        const appliedStyles = styles.styles;
        // this.state.styles.fontname
        for (const property in appliedStyles) {

            switch (property) {
              case 'align':
                this.setState({ styles: { ...this.state.styles, align: appliedStyles[property] } });
                // this.state.styles.align=appliedStyles[property];
                break;

              case 'color':
                this.setState({ styles: { ...this.state.styles, color: appliedStyles[property] } });
                // this.state.styles.color=appliedStyles[property];
                break;

              case 'em':
                // this.state.styles.em = appliedStyles[property];
                this.setState({ styles: { ...this.state.styles, em: appliedStyles[property] } });
                break;

              case 'fontname'  :
                // this.state.styles.fontname = appliedStyles[property];
                this.setState({ styles: { ...this.state.styles, fontname: appliedStyles[property] } });
                break;

              case 'fontsize':
                this.setState({ styles: { ...this.state.styles, fontsize: appliedStyles[property] } });
                // this.state.styles.fontsize = appliedStyles[property];
                break;

              case 'indent':
                this.setState({ styles: { ...this.state.styles, indent: appliedStyles[property] } });
                // this.state.styles.indent = appliedStyles[property];
                break;

              case 'underline':
                this.setState({ styles: { ...this.state.styles, underline: appliedStyles[property] } });
                    // this.state.styles.underline = appliedStyles[property];
                break;

              case 'level':
                this.setState({ styles: { ...this.state.styles, level: appliedStyles[property] } });
                // this.state.styles.level= appliedStyles[property];
                break;

              case 'lineheight':
                this.setState({ styles: { ...this.state.styles, lineheight: appliedStyles[property] } });
                // this.state.styles.lineheight = appliedStyles[property];
                break;

              case 'spacebefore':
                this.setState({ styles: { ...this.state.styles, spacebefore: appliedStyles[property] } });
                // this.state.styles.spacebefore = appliedStyles[property];
                break;

              case 'spaceafter':
                this.setState({ styles: { ...this.state.styles, spaceafter: appliedStyles[property] } });
                // this.state.styles.spaceafter = appliedStyles[property];
                break;

              case 'strong':
                this.setState({ styles: { ...this.state.styles, strong: appliedStyles[property] } });
                // this.state.styles.strong = appliedStyles[property];
                break;

              case 'texthighlight':
                this.setState({ styles: { ...this.state.styles, texthighlight: appliedStyles[property] } });
                // this.state.styles.texthighlight = appliedStyles[property];
                break;

                case 'strike':
                    this.setState({ styles: { ...this.state.styles, strike: appliedStyles[property] } });
                    // this.state.styles.strike = appliedStyles[property];
                    break;  
                   
              default:
                break;
            }
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
                onClose: val => {
                    if (this._popUp) {
                        this._popUp = null;
                        if (undefined !== val) {
                            if (isTextColor) {
                                this.setState({ styles: { ...this.state.styles, color: val } });
                            }
                            else {
                                this.setState({ styles: { ...this.state.styles, texthighlight: val } });
                            }
                        }
                    }
                },
            }
        );
    }

    //handles the option button click, close the popup with selected values
    onAlignButtonClick(val: String) {
        // this.props.close(val);
        this.setState({ styles: { ...this.state.styles, align: val } });
    }

    handleNumbering(val: any) {
        this.setState({ styles: { ...this.state.styles, hasnumbering: val.target.checked } });
    }

    // handles the boldNumbering checkbox actions
    handleBoldNumbering(val: any) {
        this.setState({ styles: { ...this.state.styles, boldNumbering: val.target.checked } });
    }

    // handles the boldNumbering checkbox actions
    handleBoldPartial(val: any) {
        this.setState({ styles: { ...this.state.styles, boldPartial: val.target.checked } });
        // this.setState({ styles: { ...this.state.styles, boldScentence: val.target.checked ? true : false } });
    }

    componentDidMount() {
        const acc = document.getElementsByClassName('accordion');
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

        // const ac = document.getElementById('accordion1');
        // ac.classList.toggle('accactive');

    }

    render(): React.Element<any> {

        return (
            <div className="customedit-div" >
                <div className="customedit-head">
                    <span>{this.state.mode == 0 ? 'Create Style' : 'Edit Style'}</span>
                </div>
                <div className="customedit-body" >
                    <div className="sectiondiv">
                    <p className="formp">Styles:</p>
                                <select className="stylenameinput fontstyle" onChange={this.onSelectCustomStyle.bind(this)} style={{ height: '24px'}} value={this.state.styles.lineheight}>
                                    {customStyles.map((style) => (
                                        <option key={style.stylename} value={style.style}>
                                            {style.stylename}
                                        </option>
                                    ))}
                                </select>
                        <p className="formp">Style Name:</p>
                        <span>
                            <input className="stylenameinput fontstyle" key="name"
                                onChange={this.onStyleClick.bind(this, 'name')} type="text" value={this.state.stylename} />
                        </span>
                        <p className="formp">Description:</p>
                        <span>
                            <input className="stylenameinput fontstyle" key="description"
                                onChange={this.onStyleClick.bind(this, 'description')} type="text" value={this.state.description} />
                        </span>

                        <p className="formp">Preview:</p>
                        <div className="textareadiv" name="body">
                            <div className="sampletext">
                                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                        </div>
                            <div className={this.state.styles.super ? 'hide-sampletext' : 'visible-sampletext'} id="sampletextdiv" style={this.buildStyle()}>
                                {SAMPLE_TEXT}
                            </div>
                            <sup className={this.state.styles.super ? 'visible-sampletext' : 'hide-sampletext'} id="mo-sup" style={this.buildStyle()}>
                                {SAMPLE_TEXT}
                            </sup>
                            <div className="sampletext">
                                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                                </div>
                        </div>
                    </div>

                    <div className="sectiondiv editorsection">
                        <p className="formp">Style Attributes:</p>
                        <div style={{ height: '329px', overflow: 'hidden auto', overflowX: 'hidden', border: '1px solid' }}>
                            <button className="accordion accactive" id="accordion1">
                                <div className="indentdiv">
                                    <span className="iconspan czi-icon text_format" style={{ marginTop: '1px' }}>text_format</span>
                                    <label style={{ marginLeft: '-10px', marginTop: '2px', color: '#444' }}>Font</label>
                                </div>
                            </button>
                            <div className="panel">
                                <div className="sectiondiv">
                                    <select className="fonttype fontstyle" onChange={this.onFontNameChange.bind(this)} value={this.state.styles.fontname}>
                                        {FONT_TYPE_NAMES.map((value) => (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                    <select className="fontsize fontstyle" onChange={this.onFontSizeChange.bind(this)} value={this.state.styles.fontsize}>
                                        {FONT_PT_SIZES.map((value) => (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="font-buttons">
                                    <span aria-label=" Bold" className="czi-tooltip-surface markbutton-container" data-tooltip=" Bold" id="86ba3aa0-ff11-11ea-930a-95c69ca4f97f" onClick={this.onStyleClick.bind(this, 'strong')} role="tooltip" style={{ marginLeft: '5px', marginRight: '5px' }}><span aria-disabled="false" aria-pressed="false" className={this.state.styles.strong ? 'czi-custom-button use-icon active markbuttons' : 'czi-custom-button use-icon markbuttons'} role="button">
                                        <span className="iconspan czi-icon format_bold editor-markbuttons">format_bold</span></span></span>
                                    <span aria-label=" Italic" className="czi-tooltip-surface fontstyle markbutton-container" data-tooltip=" Italic" id="86ba61b0-ff11-11ea-930a-95c69ca4f97f" onClick={this.onStyleClick.bind(this, 'em')} role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.styles.em ? 'czi-custom-button use-icon active markbuttons' : 'czi-custom-button use-icon markbuttons'} role="button">
                                        <span className="iconspan czi-icon format_italic editor-markbuttons">format_italic</span><span>  </span></span></span>
                                    <span aria-label=" Underline" className="czi-tooltip-surface fontstyle markbutton-container" data-tooltip=" Underline" id="86ba88c0-ff11-11ea-930a-95c69ca4f97f" onClick={this.onStyleClick.bind(this, 'underline')} role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.styles.underline ? 'czi-custom-button use-icon active markbuttons' : 'czi-custom-button use-icon markbuttons'} role="button">
                                        <span  className="iconspan czi-icon  format_underline editor-markbuttons">format_underline</span><span>  </span></span></span>
                                    <span aria-label=" Text color" className="czi-tooltip-surface fontstyle markbutton-container" data-tooltip=" Text color" id="86bad6e1-ff11-11ea-930a-95c69ca4f97f" onClick={this.showColorDialog.bind(this, true)} role="tooltip"><span aria-disabled="false" aria-pressed="false" className="czi-custom-button use-icon markbuttons" role="button">
                                        <span className="iconspan czi-icon format_color_text editor-markbuttons" style={{ color: this.state.styles.color !== 'rgba(0,0,0,0)' ? this.state.styles.color : '#666' }}>format_color_text</span><span>  </span></span></span>
                                    <span aria-label=" Highlight color" className="czi-tooltip-surface fontstyle markbutton-container" data-tooltip=" Highlight color" id="86bafdf0-ff11-11ea-930a-95c69ca4f97f" onClick={this.showColorDialog.bind(this, false)} role="tooltip"><span aria-disabled="false" aria-pressed="false" className="czi-custom-button use-icon markbuttons" role="button">
                                        <span  className=" iconspan czi-icon border_color editor-markbuttons" style={{ color: this.state.styles.texthighlight !== 'rgba(0,0,0,0)' ? this.state.styles.texthighlight : '#666' }}>border_color</span><span>  </span></span></span>

                                </div>

                                <div className="formp hierarchydiv">
                                    <span style={{ float: 'left' }}>
                                        <label >
                                            <input checked={this.state.styles.boldPartial} 
                                                onChange={this.handleBoldPartial.bind(this)} type="checkbox" />
                                            Bold the
                                    </label>
                                    </span>
                                    <span>
                                        <input checked={this.state.styles.boldScentence} disabled={this.state.styles.boldPartial ? false : true} name="boldscentence" onChange={this.onScentenceRadioChanged.bind(this)}
                                            type="radio" value="0" style={{ marginLeft: '20px' }} />
                                        <label style={{ marginLeft: '4px', marginTop: '3px', marginBottom: '0' }}>First Sentence</label>
                                        <input checked={!this.state.styles.boldScentence} disabled={this.state.styles.boldPartial ? false : true} name="boldscentence" onChange={this.onScentenceRadioChanged.bind(this)} 
                                            type="radio" value="1" style={{ marginLeft: '20px' }} />
                                        <label style={{ marginLeft: '4px', marginTop: '3px', marginBottom: '0' }}>First Word</label>
                                    </span>
                                </div>
                            </div>
                            <button className="accordion accactive">
                                <div className="indentdiv">
                                    <span className="iconspan czi-icon format_textdirection_l_to_r" style={{ marginTop: '1px' }}>format_textdirection_l_to_r</span>
                                    <label style={{ marginLeft: '-10px', marginTop: '2px', color: '#444' }}>Paragraph</label>
                                </div>
                            </button>
                            <div className="panel1">
                                <p className="formp">Alignment:</p>
                                <div className="czi-custom-buttons">
                                    <span aria-label=" Align Left" className="czi-tooltip-surface" data-tooltip=" Align Left" id="86ba3aa0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.styles.align == 'left' ? 'czi-custom-button use-icon activealignbuttons' : 'czi-custom-button alignbuttons'} onClick={this.onAlignButtonClick.bind(this, 'left')} role="button">
                                        <span className="iconspan czi-icon format_align_left">format_align_left</span></span></span>
                                    <span aria-label=" Align Center" className="czi-tooltip-surface alignbuttons" data-tooltip=" Align Center" id="86ba61b0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.styles.align == 'center' ? 'czi-custom-button use-icon activealignbuttons' : 'czi-custom-button  alignbuttons'} onClick={this.onAlignButtonClick.bind(this, 'center')} role="button">
                                        <span className="iconspan czi-icon format_align_center">format_align_center</span></span></span>
                                    <span aria-label=" Align Right" className="czi-tooltip-surface alignbuttons" data-tooltip=" Align Right" id="86ba88c0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.styles.align == 'right' ? 'czi-custom-button use-icon activealignbuttons' : 'czi-custom-button  alignbuttons'} onClick={this.onAlignButtonClick.bind(this, 'right')} role="button">
                                        <span className="iconspan czi-icon format_align_right">format_align_right</span></span></span>
                                    <span aria-label=" Justify" className="czi-tooltip-surface alignbuttons" data-tooltip=" Justify" id="86baafd0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.styles.align == 'justify' ? 'czi-custom-button use-icon activealignbuttons' : 'czi-custom-button  alignbuttons'} onClick={this.onAlignButtonClick.bind(this, 'justify')} role="button">
                                        <span className="iconspan czi-icon format_align_justify">format_align_justify</span></span></span>
                                </div>
                                <p className="formp">Line Spacing:</p>
                                <select className="linespacing fontstyle" onChange={this.onLineSpaceChange.bind(this)} value={this.state.styles.lineheight}>
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
                                        <input className="spacinginput fontstyle" key="before"
                                            onChange={this.onStyleClick.bind(this, 'before')} type="text" value={this.state.styles.spacebefore} />
                                    </span>
                                    <label style={{ marginLeft: '0' }}> pts</label>

                                    <label style={{ marginLeft: '23px' }}>After: </label>
                                    <span>
                                        <input className="spacinginput fontstyle" key="after"
                                            onChange={this.onStyleClick.bind(this, 'after')} type="text" value={this.state.styles.spaceafter} />
                                    </span>
                                    <label style={{ marginLeft: '3px' }}>pts</label>
                                </div>

                            </div>
                            <button className="accordion accactive">
                                <div className="indentdiv">
                                    <span className="iconspan czi-icon account_tree">account_tree</span>
                                    <label style={{ marginLeft: '-7px', marginTop: '2px', color: '#444' }}>Hierarchy</label>
                               </div>
                            </button>
                            <div className="panel2 formp">
                                <p className="formp">Level:</p>
                                <div className="hierarchydiv">
                                    <span style={{ float: 'left', marginTop: '8px' }}>
                                        <select className="leveltype fontstyle" id="levelValue" onChange={this.onLevelChange.bind(this)} value={this.state.styles.level}>
                                            {LEVEL_VALUES.map((value) => (
                                                <option key={value} value={value}>
                                                    {value}
                                                </option>
                                            ))}
                                        </select>
                                    </span>
                                    <span>
                                        <label >
                                            <input checked={this.state.styles.hasnumbering} className="chknumbering" disabled={this.state.styles.level ? false : true}
                                                onChange={this.handleNumbering.bind(this)} type="checkbox" />
                                            Numbering(1.1)
                                    </label>
                                        <label >
                                            <input checked={this.state.styles.boldNumbering} className="chkboldnumbering"
                                                onChange={this.handleBoldNumbering.bind(this)} type="checkbox" />
                                            Bold numbering
                                    </label>
                                    </span>

                                </div>
                                <p className="formp">Indenting:</p>
                                <div className="hierarchydiv">
                                    <div className="indentdiv">
                                        <input checked={this.state.styles.islevelbased} name="indenting" onChange={this.onIndentRadioChanged.bind(this)} type="radio"
                                            value="0" />
                                        <label style={{ marginLeft: '4px', marginTop: '3px', marginBottom: '0' }}>Based On Level</label>
                                    </div>
                                    <div className="indentdiv">
                                        <input checked={!this.state.styles.islevelbased} name="indenting" onChange={this.onIndentRadioChanged.bind(this)} type="radio"
                                            value="1" />
                                        <label style={{ marginLeft: '4px', marginTop: '3px', marginBottom: '0' }}>Specified</label>
                                        <span>
                                            <select className="leveltype specifiedindent fontstyle" onChange={this.onIndentChange.bind(this)} style={{ width: '99px !important' }} value={this.state.styles.indent}>
                                                {INDENT_VALUES.map(({ label, value }) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </span>
                                    </div>

                                </div>
                            </div>
                        </div>




                    </div>
                </div >
                <div className="btns">
                    <button className="buttonstyle" onClick={this._cancel}>Cancel</button>
                    <button className="btnsave buttonstyle" onClick={this._save.bind(this)}>Save</button>
                </div>
            </div >
        );

    }


    _cancel = (): void => {
        this.props.close();
    };
    _save = (): void => {
        if ('' != this.state.stylename) {
            this.props.close(this.state);
        }
    };

}

export default CustomStyleEditor;
