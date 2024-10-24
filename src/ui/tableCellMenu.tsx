import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';

import CommandMenuButton from './commandMenuButton';
import { TABLE_COMMANDS_GROUP } from './editorToolbarConfig';
import Icon from './icon';

import '../styles/czi-table-cell-menu.css';

type TableCellMenuProps = {
  editorState: EditorState;
  editorView: EditorView;
};

class TableCellMenu extends React.PureComponent<TableCellMenuProps> {
  _menu = null;

  props: TableCellMenuProps;

  render(): React.ReactElement<CommandMenuButton> {
    const { editorState, editorView } = this.props;
    return (
      <CommandMenuButton
        className="czi-table-cell-menu"
        commandGroups={TABLE_COMMANDS_GROUP}
        dispatch={editorView.dispatch}
        editorState={editorState}
        editorView={editorView}
        icon={Icon.get('icon_edit')}
        title="Edit"
      />
    );
  }
}

export default TableCellMenu;
