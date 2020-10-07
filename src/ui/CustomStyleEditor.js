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

// export type CustomStyleProps = {
//     strike: ?boolean,
//     strong: ?boolean,
//     em: ?boolean,
//     super: ?boolean,
//     underline: ?boolean,
//     color: ?string,
//     fontsize: ?string,
//     fontname: ?string,
//     texthighlight: ?string,
//     align: ?string,
//     lineheight:?string,
// };

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
    {
        label: 'None',
        value: 'None'
    },
    {
        label: '1.',
        value: '1'
    },
    {
        label: '1.1.',
        value: '2'
    },
    {
        label: '1.1.1.',
        value: '3'

    },
    {
        label: '1.1.1.1.',
        value: '4'
    },
    {
        label: '1.1.1.1.1.',
        value: '5'
    },
    {
        label: '1.1.1.1.1.1.',
        value: '6'
    },
    {
        label: '1.1.1.1.1.1.1.',
        value: '7'
    },
    {
        label: '1.1.1.1.1.1.1.1.',
        value: '8'
    }

];

class CustomStyleEditor extends React.PureComponent<any, any> {

    _unmounted = false;
    _popUp = null;

    constructor(props) {
        super(props);
        this.state = {
            ...props
        }
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
                    strong: !this.state.strong
                });
                break;

            case 'em':
                this.setState({
                    em: !this.state.em
                });
                break;

            case 'strike':
                this.setState({
                    strike: !this.state.strike
                });
                break;

            case 'super':
                this.setState({
                    super: !this.state.super
                });
                break;

            case 'underline':
                this.setState({
                    underline: !this.state.underline
                });
                break;
            case 'name':
                if (undefined !== event) {
                    this.setState({
                        name: event.target.value
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

        let style = {}
        if (this.state.fontname) {
            style.fontFamily = this.state.fontname;
        }
        if (this.state.strong) {
            style.fontWeight = 'bold';
        }
        if (this.state.color) {
            style.color = this.state.color;
        }
        if (this.state.underline) {
            style.textDecoration = 'underline';
        }
        if (this.state.em) {
            style.fontStyle = 'italic';
        }
        if (this.state.texthighlight) {
            style.backgroundColor = this.state.texthighlight
        }
        return style;
    }

    // handles font name change
    onFontNameChange(e) {
        this.setState({ fontname: e.target.value });
    }

    // handles font size change
    onFontSizeChange(e) {
        this.setState({ fontsize: e.target.value });
    }

    // shows color dialog based on input text-color/text-heighlight
    showColorDialog(ISTextColor, event) {
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
                        if (ISTextColor) {
                            this.setState({ color: val });
                        }
                        else {
                            this.setState({ texthighlight: val });
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
                                placeholder="Enter style name" type="text" value={this.state.name} onChange={this.onStyleClick.bind(this, 'name')} />
                        </span>
                    </div>
                    <div className="sectiondiv">
                        <select className="fonttype" value={this.state.fontname} onChange={this.onFontNameChange.bind(this)}>
                            {FONT_TYPE_NAMES.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        <select className="fontsize" value={this.state.fontsize} onChange={this.onFontSizeChange.bind(this)}>
                            {FONT_PT_SIZES.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="sectiondiv editorsection">

                        <div class="czi-custom-buttons">
                            <span aria-label=" Bold" class="czi-tooltip-surface" onClick={this.onStyleClick.bind(this, 'strong')} data-tooltip=" Bold" id="86ba3aa0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.strong ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} role="button">
                                <span class="iconspan czi-icon format_bold">format_bold</span></span></span>
                            <span aria-label=" Italic" class="czi-tooltip-surface" onClick={this.onStyleClick.bind(this, 'em')} data-tooltip=" Italic" id="86ba61b0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.em ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} role="button">
                                <span class="iconspan czi-icon format_italic">format_italic</span><span>  </span></span></span>
                            <span aria-label=" Underline" class="czi-tooltip-surface" onClick={this.onStyleClick.bind(this, 'underline')} data-tooltip=" Underline" id="86ba88c0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                <span class="iconspan czi-icon format_underline">format_underline</span><span>  </span></span></span><span aria-label=" Strike through" class="czi-tooltip-surface" data-tooltip=" Strike through" id="86baafd0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" className={this.state.underline ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} role="button">

                                    <span class="iconspan czi-icon format_strikethrough">format_strikethrough</span><span>  </span></span></span><span aria-label=" Superscript" class="czi-tooltip-surface" data-tooltip=" Superscript" id="86bad6e0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button"><span class="czi-icon superscript">
                                        <span class="iconspan superscript-wrap"><span class="superscript-base">x</span><span class="superscript-top">y</span></span></span><span>  </span></span></span>
                            <span aria-label=" Text color" class="czi-tooltip-surface" onClick={this.showColorDialog.bind(this, true)} data-tooltip=" Text color" id="86bad6e1-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                <span class="iconspan czi-icon format_color_text" style={{ color: this.state.color }}>format_color_text</span><span>  </span></span></span>
                            <span aria-label=" Highlight color" class="czi-tooltip-surface" onClick={this.showColorDialog.bind(this, false)} data-tooltip=" Highlight color" id="86bafdf0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                <span class=" iconspan czi-icon border_color" style={{ color: this.state.texthighlight }}>border_color</span><span>  </span></span></span>

                        </div>
                        <div className="sectiondiv">
                            <label for="test">Numbering </label>
                            <span>
                                <select className="numbering">
                                    {NUMBERING_VALUES.map(({ label, value }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </span>
                        </div>
                        <div className="sectiondiv">
                            <label for="test">Indenting </label>
                            <span>
                                <select className="indenting">
                                    {INDENT_VALUES.map(({ label, value }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </span>
                        </div>
                        <div className="textAreadiv" name="body">
                            <div className="sampletext">
                                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                        </div>
                            <div style={this.buildStyle()}>
                                Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample
                                Sample Text Sample Text Sample Text Sample Text Sample Text
                        </div>
                            <div className="sampletext" >
                                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                                Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                        </div>
                        </div>

                    </div>
                    <div className="btns">
                        <button onClick={this._cancel}>Cancel</button>
                        <button>Save</button>
                    </div>
                </div>
            </div >
        );
    }


    _cancel = (): void => {
        this.props.close();
    };

}

export default CustomStyleEditor;
