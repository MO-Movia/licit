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
import CustomStyleEditor from './CustomStyleEditor';
import { applyStyle } from '../CustomStyleCommand';
import {
    atViewportCenter
} from './PopUpPosition';
import { saveStyle, removeStyle } from '../customStyle';

// [FS] IRAD-1039 2020-09-24
// UI to show the list buttons

class CustomMenuUI extends React.PureComponent<any, any> {

    _activeCommand: ?UICommand = null;
    _popUp = null;
    _stylePopup = null;
    _styleName = null;
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
        const { dispatch, editorState, editorView, commandGroups, staticCommand, onCommand } = this.props;
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
                    key={label}
                    label={label}
                    onClick={this._onUIEnter}
                    onCommand={onCommand}
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
                    key={label}
                    label={command._customStyleName}
                    onClick={this._onUIEnter}
                    onCommand={onCommand}
                ></CustomStyleItem>);
            });
        });
        return (
            <div>
                <div className="dropbtn" id={this._id} >
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
        if (this._stylePopup) {
            this._stylePopup.close();
            this._stylePopup = null;
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
                        if (undefined !== val && val.command._customStyle) {
                            // do edit,remove,rename code here
                            if ('remove' === val.type) {
                                removeStyle(val.command._customStyleName, val.command._customStyle);
                            } else if ('rename' === val.type) {
                                window.alert('Rename Style...');
                            }
                            else {
                                this.showStyleWindow(command, event);
                            }
                        }
                    }
                },
            }
        );
    }
    //shows the alignment and line spacing option
    showStyleWindow(command: UICommand, event: SyntheticEvent<*>) {
        // const anchor = event ? event.currentTarget : null;
        // close the popup toggling effect
        if (this._stylePopup) {
            this._stylePopup.close();
            this._stylePopup = null;
            // return;
        }
        this._styleName = command._customStyleName;
        this._stylePopup = createPopUp(
            CustomStyleEditor,
            {
                stylename: command._customStyleName,
                mode: 1,//edit
                description: command._customStyle.description,
                styles: command._customStyle.styles
            },
            {
                position: atViewportCenter,
                autoDismiss: false,
                IsChildDialog: false,
                onClose: val => {
                    if (this._stylePopup) {
                        //handle save style object part here
                        if (undefined !== val) {
                            const { dispatch } = this.props.editorView;
                            let tr = this.props.editorState.tr;
                            // const doc = this.props.editorState.doc;
                            saveStyle(val);
                            // tr = tr.setSelection(TextSelection.create(doc, 0, 0));
                            // Apply created styles to document
                            tr = applyStyle(val.styles, val.stylename, this.props.editorState, tr);
                            dispatch(tr);
                            this.props.editorView.focus();
                            this._stylePopup.close();
                            this._stylePopup = null;
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


