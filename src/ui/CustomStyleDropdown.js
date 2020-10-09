// @flow
// [FS] IRAD-1070 2020-10-08
// UI for displaying text-align option and line-height
import * as React from 'react';
import PropTypes from 'prop-types';
import './custom-style-edit.css';
import { LINE_SPACING_100, LINE_SPACING_115, LINE_SPACING_150, LINE_SPACING_200 } from './toCSSLineSpacing';

class CustomStyleDropdown extends React.PureComponent<any, any> {

    _unmounted = false;

    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    };

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
    //handles the option button click, close the popup with selected values
    onButtonClick(val, event) {
        this.props.close(val);
    }

    render(): React.Element<any> {

        return (
            <div className="dropdown-div">

                <div class="dropdown-buttons" style={this.state.isAlignment ? { display: 'block' } : { display: 'none' }}>
                    <span aria-label=" Left align" class="czi-tooltip-surface" data-tooltip=" Left align" role="tooltip">
                        <span aria-disabled="false" aria-pressed="false" className={this.state.value == 'left' ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} onClick={this.onButtonClick.bind(this, 'left')} role="button">
                            <span class="czi-icon format_align_left">format_align_left</span><span>  </span></span></span>
                    <span aria-label=" Center Align" class="czi-tooltip-surface" data-tooltip=" Center Align" role="tooltip">
                        <span aria-disabled="false" aria-pressed="false" className={this.state.value == 'center' ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} onClick={this.onButtonClick.bind(this, 'center')} role="button">
                            <span class="czi-icon format_align_center">format_align_center</span><span>  </span></span></span>
                    <span aria-label=" Right Align" class="czi-tooltip-surface" data-tooltip=" Right Align" role="tooltip">
                        <span aria-disabled="false" aria-pressed="false" className={this.state.value == 'right' ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} onClick={this.onButtonClick.bind(this, 'right')} role="button">
                            <span class="czi-icon format_align_right">format_align_right</span><span>  </span></span></span>
                    <span aria-label=" Justify" class="czi-tooltip-surface" data-tooltip=" Justify" role="tooltip">
                        <span aria-disabled="false" aria-pressed="false" className={this.state.value == 'justify' ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} onClick={this.onButtonClick.bind(this, 'justify')} role="button">
                            <span class="czi-icon format_align_justify">format_align_justify</span><span>  </span></span></span>
                </div>
                <div class="dropdown-buttons" style={this.state.isAlignment ? { display: 'none' } : { display: 'block' }}>
                    <span aria-label=" 100%" class="czi-tooltip-surface" data-tooltip=" Left align" role="tooltip">
                        <span aria-disabled="false" aria-pressed="false" className={this.state.value == LINE_SPACING_100 ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} onClick={this.onButtonClick.bind(this, LINE_SPACING_100)} role="button" >
                            <span >Single</span><span>  </span></span></span>
                    <span aria-label=" 115%" class="czi-tooltip-surface" data-tooltip=" Center Align" role="tooltip">
                        <span aria-disabled="false" aria-pressed="false" className={this.state.value == LINE_SPACING_115 ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} onClick={this.onButtonClick.bind(this, LINE_SPACING_115)} role="button" >
                            <span >1.15</span><span>  </span></span></span>
                    <span aria-label=" 150%" class="czi-tooltip-surface" data-tooltip=" Right Align" role="tooltip">
                        <span aria-disabled="false" aria-pressed="false" className={this.state.value == LINE_SPACING_150 ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} onClick={this.onButtonClick.bind(this, LINE_SPACING_150)} role="button" >
                            <span >1.5</span><span>  </span></span></span>
                    <span aria-label=" 232%" class="czi-tooltip-surface" data-tooltip=" Justify" onClick={this.onButtonClick.bind(this, LINE_SPACING_200)} role="tooltip" >
                        <span aria-disabled="false" aria-pressed="false" className={this.state.value == LINE_SPACING_200 ? 'czi-custom-button use-icon active' : 'czi-custom-button use-icon'} role="button" >
                            <span >Double</span><span>  </span></span></span>
                </div>

            </div>

        );
    }


}

export default CustomStyleDropdown;
