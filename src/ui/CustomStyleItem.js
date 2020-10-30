// @flow

import './czi-custom-button.css';
import * as React from 'react';
import UICommand from './UICommand';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import './custom-dropdown.css';
import { getCustomStylesByName } from '../customStyle';
import { getTheCustomStyles } from './findActiveHeading';
class CustomStyleItem extends React.PureComponent<any, any> {
    props: {
        command: UICommand,
        disabled?: ?boolean,
        dispatch: (tr: Transform) => void,
        editorState: EditorState,
        editorView: ?EditorView,
        label?: string,
        onClick?: ?(val: any, e: SyntheticEvent<>) => void,
        hasText?: ?Boolean
    };

    render(): React.Element<any> {

        const { command, label, onClick, hasText } = this.props;
        let text = '';
        let styles;
        text = this.sampleText();
        const style = getCustomStylesByName(label);
        if (style) {
            styles = getTheCustomStyles(style);
        }

        return (
            <div id="container1" tag={label}>

                <div onClick={(e) => this._onUIEnter(command, e)}>{label}</div>
                <div onClick={(e) => this._onUIEnter(command, e)} style={styles}> {text}</div>
                <div class="arrow_right" onClick={onClick.bind(this, command)} style={hasText ? { display: 'block' } : { display: 'none' }}>
                    <span class="czi-icon keyboard_arrow_down">keyboard_arrow_down</span>
                </div>
            </div>
        );
    }

    _onUIEnter = (command: UICommand, event: SyntheticEvent<*>) => {

        this._execute(command, event);

    };

    _execute = (command, e) => {
        const { dispatch, editorState, editorView, onCommand } = this.props;
        if (command.execute(editorState, dispatch, editorView, e)) {
            onCommand && onCommand();
        }
    };
    // temp method to clear sample text for new and clear command menu item
    sampleText(): String {

        let text = 'AaBbCcDd';
        if (!this.props.hasText) {
            text = '';

        }
        return text;

    }
}

export default CustomStyleItem;
