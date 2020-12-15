// @flow

import './czi-custom-button.css';
import * as React from 'react';
import UICommand from './UICommand';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import './custom-dropdown.css';
import { getCustomStyleByName } from '../customStyle';
import { getCustomStyle } from './findActiveHeading';
class CustomStyleItem extends React.PureComponent<any, any> {
    props: {
        command: UICommand,
        disabled?: ?boolean,
        dispatch: (tr: Transform) => void,
        editorState: EditorState,
        editorView: ?EditorView,
        label: string,
        onMouseDown?: ?(val: any, e: SyntheticEvent<>) => void,
        hasText?: ?Boolean,
        onCommand: ?Function,
    };

    render(): React.Element<any> {

        const { command, label, onClick, hasText } = this.props;
        let text = '';
        let customStyle;
        text = this.sampleText();
        const style = getCustomStyleByName(label);
        if (style) {
            customStyle = getCustomStyle(style);
        }

        return (
            <div id="container1" tag={label}>

                <div onMouseDown={(e) => this._onUIEnter(command, e)} style={{ width: '140px', height: 'auto' }}>{label}</div>
                <div onMouseDown={(e) => this._onUIEnter(command, e)} style={{ width: '100px' }} style={customStyle}> {text}</div>
                {/* <div className="arrow_right" onMouseDown={onMouseDown.bind(this, command)} style={{ width: '50px' }} style={hasText ? { display: 'block' } : { display: 'none' }}>
                    <span className="czi-icon keyboard_arrow_down">keyboard_arrow_down</span>
                </div> */}
            </div>
        );
    }

    _onUIEnter = (command: UICommand, event: SyntheticEvent<*>) => {

        this._execute(command, event);

    };

    _execute = (command: UICommand, e: SyntheticEvent<*>) => {
        const { dispatch, editorState, editorView, onCommand } = this.props;
        command.execute(editorState, dispatch, editorView, e);
        onCommand && onCommand();
    };
    // temp method to clear sample text for new and clear command menu item
    sampleText(): string {

        let text = 'AaBbCcDd';
        if (!this.props.hasText) {
            text = '';

        }
        return text;

    }
}

export default CustomStyleItem;
