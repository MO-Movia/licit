// @flow
// [FS] IRAD-1048 2020-09-24
// UI for Custom Style edit
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
        return (
            <div className="customedit-div">
                <div className="customedit-head">
                    <span className="closebtn" onClick={this._cancel}>×</span><strong>Create Style</strong>
                </div>
            </div >
        );
    }


    _cancel = (): void => {
        this.props.close();
    };

}

export default CustomStyleEditor;
