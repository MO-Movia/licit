// @flow
// [FS] IRAD-1048 2020-09-24
// UI for Custom Style edit
//Need to change the button binding implementation
import * as React from 'react';
import PropTypes from 'prop-types';
import './custom-style-edit.css';
import ColorEditor from './ColorEditor';
import createPopUp from './createPopUp';
import { FONT_PT_SIZES } from './FontSizeCommandMenuButton';
import { FONT_TYPE_NAMES } from '../FontTypeMarkSpec';
import CustomStyleDropdown from './CustomStyleDropdown';



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
// Values to show in numbering drop-down
const NUMBERING_VALUES = [
    'None',
    '1.',
    '1.1.',
    '1.1.1.',
    '1.1.1.1.',
    '1.1.1.1.1.',
    '1.1.1.1.1.1.',
    '1.1.1.1.1.1.1.',
    '1.1.1.1.1.1.1.1.',
];

class CustomStyleEditor extends React.PureComponent<any, any> {

    _unmounted = false;
    _popUp = null;

    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    };

    // [FS] IRAD-1005 2020-09-24
    // Upgrade outdated packages.
    // To take care of the property type declaration.
    static propsTypes = {
        initialValue: PropTypes.object,
        close: function (props: any, propName: string) {
            const fn = props[propName];
            if (!fn.prototype ||
                (typeof fn.prototype.constructor !== 'function' &&
                    fn.prototype.constructor.length !== 1)) {
                return new Error(propName + 'must be a function with 1 arg of type ImageLike');
            }
        }
    }

    componentWillUnmount(): void {
        this._unmounted = true;
    }

    // To set the selected style values
    onStyleClick(style: string, event) {

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
        if (this.state.styles.strong) {
            style.fontWeight = 'bold';
        }
        if (this.state.styles.color) {
            style.color = this.state.styles.color;
        }
        if (this.state.styles.underline) {
            style.textDecoration = 'underline';
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
            style.lineHeight = this.state.styles.lineheight;
        }
        if (this.state.styles.indent) {
            style.marginLeft = `${this.state.styles.indent * 2}px`;
        }
        if (this.state.styles.numbering) {
            // if (document.getElementById('sampletextdiv')) {
            //     document.getElementById('sampletextdiv').innerText = `${this.state.styles.numbering}'  '${document.getElementById('sampletextdiv').innerText}`;
            // }
        }
        return style;
    }

    // handles font name change
    onFontNameChange(e) {
        this.setState({ styles: { ...this.state.styles, fontname: e.target.value } });

    }

    // handles font size change
    onFontSizeChange(e) {
        this.setState({ styles: { ...this.state.styles, fontsize: e.target.value } });

    }

    // handles numbering drop down change
    onNumberingChange(e) {

        this.setState({ styles: { ...this.state.styles, numbering: e.target.value } });
    }

    // handles indentt dropdown change
    onIndentChange(e) {

        this.setState({ styles: { ...this.state.styles, indent: e.target.value } });
    }

    // shows color dialog based on input text-color/text-heighlight
    showColorDialog(isTextColor, event) {
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
    //shows the alignment and line spacing option
    showAlignmentDialog(isAlignment, event) {
        const anchor = event ? event.currentTarget : null;
        // close the popup toggling effect
        if (this._popUp) {
            this._popUp.close();
            this._popUp = null;
            return;
        }
        this._popUp = createPopUp(
            CustomStyleDropdown,
            {
                isAlignment: isAlignment,
                value: isAlignment ? this.state.styles.align : this.state.styles.lineheight
            },
            {
                anchor,
                IsChildDialog: true,
                onClose: val => {
                    if (this._popUp) {
                        this._popUp = null;
                        if (undefined !== val) {
                            if (isAlignment) {
                                this.setState({ styles: { ...this.state.styles, align: val } });
                            }
                            else {
                                this.setState({ styles: { ...this.state.styles, lineheight: val } });
                            }
                        }
                    }
                },
            }
        );
    }

    render(): React.Element<any> {


        return (
            <div className="customedit-div" >
                <div className="customedit-head">
                    <span className="closebtn" onClick={this._cancel}>×</span><strong>Create Style</strong>
                </div>
                <div className="customedit-body" >
                    <div className="sectiondiv">
                        <label>Name</label>
                        <span>
                            <input className="stylenameinput" key="name"
                                onChange={this.onStyleClick.bind(this, 'name')} placeholder="Enter style name" type="text" value={this.state.styles.stylename} />
                        </span>
                    </div>
                    <div className="sectiondiv">
                        <select className="fonttype" onChange={this.onFontNameChange.bind(this)} value={this.state.styles.fontname}>
                            {FONT_TYPE_NAMES.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        <select className="fontsize" onChange={this.onFontSizeChange.bind(this)} value={this.state.styles.fontsize}>
                            {FONT_PT_SIZES.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="sectiondiv editorsection">

                        <div class="czi-custom-buttons">
                            <span aria-label=" Bold" class="czi-tooltip-surface" data-tooltip=" Bold" id="86ba3aa0-ff11-11ea-930a-95c69ca4f97f" onClick={this.onStyleClick.bind(this, 'strong')} role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.styles.strong ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} role="button">
                                <span class="iconspan czi-icon format_bold">format_bold</span></span></span>
                            <span aria-label=" Italic" class="czi-tooltip-surface" data-tooltip=" Italic" id="86ba61b0-ff11-11ea-930a-95c69ca4f97f" onClick={this.onStyleClick.bind(this, 'em')} role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.styles.em ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} role="button">
                                <span class="iconspan czi-icon format_italic">format_italic</span><span>  </span></span></span>
                            <span aria-label=" Underline" class="czi-tooltip-surface" data-tooltip=" Underline" id="86ba88c0-ff11-11ea-930a-95c69ca4f97f" onClick={this.onStyleClick.bind(this, 'underline')} role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                <span class="iconspan czi-icon format_underline">format_underline</span><span>  </span></span></span><span aria-label=" Strike through" class="czi-tooltip-surface" data-tooltip=" Strike through" id="86baafd0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.styles.underline ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} role="button">

                                    <span class="iconspan czi-icon format_strikethrough">format_strikethrough</span><span>  </span></span></span><span aria-label=" Superscript" class="czi-tooltip-surface" data-tooltip=" Superscript" id="86bad6e0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                        <span class="czi-icon superscript" style={{ width: '32px' }}>
                                            <span class="iconspan superscript-wrap"><span class="superscript-base">x</span><span class="superscript-top">y</span></span></span><span>  </span></span></span>
                            <span aria-label=" Text color" class="czi-tooltip-surface" data-tooltip=" Text color" id="86bad6e1-ff11-11ea-930a-95c69ca4f97f" onClick={this.showColorDialog.bind(this, true)} role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                <span class="iconspan czi-icon format_color_text" style={{ color: this.state.styles.color }}>format_color_text</span><span>  </span></span></span>
                            <span aria-label=" Highlight color" class="czi-tooltip-surface" data-tooltip=" Highlight color" id="86bafdf0-ff11-11ea-930a-95c69ca4f97f" onClick={this.showColorDialog.bind(this, false)} role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                <span class=" iconspan czi-icon border_color" style={{ color: this.state.styles.texthighlight }}>border_color</span><span>  </span></span></span>

                        </div>
                        <hr></hr>
                        <div className="sectiondiv">
                            <label for="test">Numbering </label>
                            <span>
                                <select className="numbering" onChange={this.onNumberingChange.bind(this)} value={this.state.styles.numbering}>
                                    {NUMBERING_VALUES.map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                            </span>
                            <button className="align-menu-button" onClick={this.showAlignmentDialog.bind(this, true)}>
                                <span class="czi-icon format_align_left">format_align_left</span>
                                <span class="czi-icon expand_more align-menu-dropdown-icon">expand_more</span>
                            </button>
                        </div>
                        <div className="sectiondiv">
                            <label for="test">Indenting </label>
                            <span>
                                <select className="indenting" onChange={this.onIndentChange.bind(this)} value={this.state.styles.indent}>
                                    {INDENT_VALUES.map(({ label, value }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </span>
                            <button className="align-menu-button" onClick={this.showAlignmentDialog.bind(this, false)}>
                                <span class="czi-icon format_line_spacing align-menu-button-icon">format_line_spacing</span>

                            </button>
                        </div>
                        <div className="textAreadiv" name="body">
                            <div className="sampletext">
                                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                        </div>
                            <div id="sampletextdiv" style={this.buildStyle()}>
                                Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample
                                Sample Text Sample Text Sample Text Sample Text Sample Text
                        </div>
                            <div className="sampletext">
                                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                        </div>
                        </div>

                    </div>
                    <div className="btns">
                        <button onClick={this._cancel}>Cancel</button>
                        <button onClick={this._save.bind(this)}>Save</button>
                    </div>
                </div>
            </div >
        );
    }


    _cancel = (): void => {
        this.props.close();
    };
    _save = (): void => {
        this.props.close(this.state);
    };

}

export default CustomStyleEditor;
