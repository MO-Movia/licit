import * as React from 'react';
import UICommand from './UICommand';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import uuid from './uuid';
import './listType.css';
import CustomStyleItem from './CustomStyleItem';

import createPopUp from './createPopUp';
import CustomStyleSubMenu from './CustomStyleSubMenu';
import CustomStyleDropdown from './CustomStyleDropdown';

// [FS] IRAD-1039 2020-09-24
// UI to show the list buttons

class CustomMenuUI extends React.PureComponent<any, any> {

    _activeCommand: ?UICommand = null;
    _popUp = null;
    // _popUpId = uuid();
    props: {
        className?: ?string,
        commandGroups: Array<{ [string]: UICommand }>,
        staticCommand: Array<{ [string]: UICommand }>,
        disabled?: ?boolean,
        dispatch: (tr: Transform) => void,
        editorState: EditorState,
        editorView: ?EditorView,
        icon?: string | React.Element<any> | null,
        label?: string | React.Element<any> | null,
        title?: ?string,
        _style?: ?any

    };

    _menu = null;
    _id = uuid();
    _modalId = null;

    state = {
        expanded: false,
        style: {
            display: 'none',
            top: '',
            left: ''
        }
    };

    render() {
        const { dispatch, editorState, editorView, commandGroups, staticCommand } = this.props;
        const children = [];
        const children1 = [];

        commandGroups.forEach((group, ii) => {
            Object.keys(group).forEach(label => {
                const command = group[label];
                children.push(<CustomStyleItem
                    command={command}
                    disabled={editorView && editorView.disabled ? true : false}
                    dispatch={dispatch}
                    editorState={editorState}
                    editorView={editorView}
                    hasText={true}
                    label={label}
                    onClick={this._onUIEnter}
                ></CustomStyleItem>);
            });
        });
        staticCommand.forEach((group, ii) => {
            Object.keys(group).forEach(label => {
                const command = group[label];
                children1.push(<CustomStyleItem
                    command={command}
                    disabled={editorView && editorView.disabled ? true : false}
                    dispatch={dispatch}
                    editorState={editorState}
                    editorView={editorView}
                    hasText={false}
                    label={command._customStyleName}
                    onClick={this._onUIEnter}
                ></CustomStyleItem>);
            });
        });
        return (
            <div>
                <div className="dropbtn" id={this._id}>
                    {children}
                    <hr></hr>
                    {children1}
                </div>
            </div>


        );
    }

    _onUIEnter = (command: UICommand, event: SyntheticEvent<*>) => {
        this.showSubMenu(command, event);
    };

    //shows the alignment and line spacing option
    showSubMenu(command: UICommand, event: SyntheticEvent<*>) {

        const anchor = event ? event.currentTarget : null;

        // close the popup toggling effect
        if (this._popUp) {
            this._popUp.close();
            this._popUp = null;
            return;
        }
        this._popUp = createPopUp(
            CustomStyleSubMenu,
            {
                command: command
            },
            {
                anchor,
                autoDismiss: false,
                IsChildDialog: true,
                onClose: val => {
                    if (this._popUp) {
                        this._popUp = null;
                        if (undefined !== val) {
                            // do edit,remove,rename code here
                        }
                    }
                },
            }
        );

    }

    _execute = (command, e) => {
        const { dispatch, editorState, editorView, onCommand } = this.props;
        if (command.execute(editorState, dispatch, editorView, e)) {
            onCommand && onCommand();
        }
    };

}

export default CustomMenuUI;


