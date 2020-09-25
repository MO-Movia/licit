import * as React from 'react';
import UICommand from './UICommand';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import uuid from './uuid';
import './listType.css';

// [FS] IRAD-1039 2020-09-24
// UI to show the list buttons

class ListTypeMenu extends React.PureComponent<any, any> {

    _activeCommand: ?UICommand = null;
    props: {
        className?: ?string,
        commandGroups: Array<{ [string]: UICommand }>,
        disabled?: ?boolean,
        dispatch: (tr: Transform) => void,
        editorState: EditorState,
        editorView: ?EditorView,
        icon?: string | React.Element<any> | null,
        label?: string | React.Element<any> | null,
        title?: ?string,

    };

    _menu = null;
    _id = uuid();

    state = {
        expanded: false,
    };

    render() {
        const { commandGroups, editorState, editorView } = this.props;
        const children = [];
        const jj = commandGroups.length - 1

        commandGroups.forEach((group, ii) => {
            Object.keys(group).forEach(label => {
                const command = group[label];
                children.push(<button key={label} id={label} value={command} onClick={(e) => this._onUIEnter(command, e)} className="buttonSize" >{command.label}</button>);
            })
        });
        return (
            <div className="container">{children}
            </div>
        );
    }

    _onUIEnter = (command: UICommand, event: SyntheticEvent<*>) => {
        this._activeCommand && this._activeCommand.cancel();
        this._activeCommand = command;
        this._execute(command, event);

    };

    _execute = (command, e) => {
        const { dispatch, editorState, editorView, onCommand } = this.props;
        if (command.execute(editorState, dispatch, editorView, e)) {
            onCommand && onCommand();
        }
    };

}

export default ListTypeMenu;


