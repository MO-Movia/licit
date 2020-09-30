// @flow
// [FS] IRAD-1048 2020-09-24
// UI for Custom Style edit
//Need to change the button binding implementation
import * as React from 'react';
import PropTypes from 'prop-types';
import './custom-style-edit.css';

type Props = {
    close: (href: ?ImageLike) => void,
};

class CustomStyleEditor extends React.PureComponent<any, any> {
    _unmounted = false;

    // [FS] IRAD-1005 2020-09-24
    // Upgrade outdated packages.
    // To take care of the property type declaration.
    static propsTypes = {
        initialValue: PropTypes.object,
        close: function (props: any, propName: string) {
            var fn = props[propName];
            if (!fn.prototype ||
                (typeof fn.prototype.constructor !== 'function' &&
                    fn.prototype.constructor.length !== 1)) {
                return new Error(propName + 'must be a function with 1 arg of type ImageLike');
            }
        }
    }

    state = {
        ...(this.props.initialValue || {}),
        validValue: null,
    };

    componentWillUnmount(): void {
        this._unmounted = true;
    }

    render(): React.Element<any> {
        const font = [
            {
                label: "Arial",
                value: "Arial"
            },
            { label: "Acme", value: "Acme" },
            { label: "Tahoma", value: "Tahoma" }
        ];

        const fontSize = [
            {
                label: "11",
                value: "11"
            },
            { label: "12", value: "12" },
            { label: "12", value: "12" }
        ];

        const indenting = [
            {
                label: "None",
                value: "None"
            }

        ];
        const numbering = [
            {
                label: "None",
                value: "None"
            }
        ];
        return (
            <div className="customedit-div">
                <div className="customedit-head">
                    <span className="closebtn" onClick={this._cancel}>×</span><strong>Create Style</strong>
                </div>
                <div className="customedit-body" >
                    <div className="sectiondiv">
                        <label for="test">Name</label>
                        <span>
                            <input className="stylenameinput" id="test"
                                type="text" placeholder="Enter style name" />
                        </span>
                    </div>
                    <div className="sectiondiv">
                        <select className="fontsize">
                            {font.map(({ label, value }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <select className="fonttype">
                            {fontSize.map(({ label, value }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="sectiondiv editorsection">

                        <div class="czi-custom-buttons">
                            <span aria-label=" Bold" class="czi-tooltip-surface" data-tooltip=" Bold" id="86ba3aa0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                <span class="iconspan czi-icon format_bold">format_bold</span><span>  </span></span></span><span aria-label=" Italic" class="czi-tooltip-surface" data-tooltip=" Italic" id="86ba61b0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                    <span class="iconspan czi-icon format_italic">format_italic</span><span>  </span></span></span><span aria-label=" Underline" class="czi-tooltip-surface" data-tooltip=" Underline" id="86ba88c0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                        <span class="iconspan czi-icon format_underline">format_underline</span><span>  </span></span></span><span aria-label=" Strike through" class="czi-tooltip-surface" data-tooltip=" Strike through" id="86baafd0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">

                                            <span class="iconspan czi-icon format_strikethrough">format_strikethrough</span><span>  </span></span></span><span aria-label=" Superscript" class="czi-tooltip-surface" data-tooltip=" Superscript" id="86bad6e0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button"><span class="czi-icon superscript">
                                                <span class="iconspan superscript-wrap"><span class="superscript-base">x</span><span class="superscript-top">y</span></span></span><span>  </span></span></span><span aria-label=" Text color" class="czi-tooltip-surface" data-tooltip=" Text color" id="86bad6e1-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                                    <span class="iconspan czi-icon format_color_text">format_color_text</span><span>  </span></span></span><span aria-label=" Highlight color" class="czi-tooltip-surface" data-tooltip=" Highlight color" id="86bafdf0-ff11-11ea-930a-95c69ca4f97f" role="tooltip"><span aria-disabled="false" aria-pressed="false" class="czi-custom-button use-icon" role="button">
                                                        <span class=" iconspan czi-icon border_color">border_color</span><span>  </span></span></span>

                        </div>
                        <div className="sectiondiv">
                            <label for="test">Numbering </label>
                            <span>
                                <select className="numbering">
                                    {numbering.map(({ label, value }) => (
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
                                    {indenting.map(({ label, value }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </span>
                        </div>
                        <div name="body" className="textAreadiv">
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
