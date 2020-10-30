// @flow

import * as React from 'react';
import PropTypes from 'prop-types';
import './czi-form.css';

class AlertInfo extends React.PureComponent<any, any> {
  _unmounted = false;

  // [FS] IRAD-1005 2020-07-07
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
      return null;
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
      <div className="alert">
        <span className="closebtn" onClick={this._cancel}>&times;</span>
        <strong>Document Error!</strong> Unable to load the document.
        <span> Have issues in Json format, please verify...</span>
      </div>
    );
  }

  _cancel = (): void => {
    this.props.close();
  };

}

export default AlertInfo;
