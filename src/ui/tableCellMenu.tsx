/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {EditorState, PluginView} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import * as React from 'react';

import CommandMenuButton from './commandMenuButton';
import {TABLE_COMMANDS_GROUP} from './editorToolbarConfig';
import Icon from './icon';

import '../styles/czi-table-cell-menu.css';

type TableCellMenuProps = {
  editorState: EditorState;
  editorView: EditorView;
  pluginView: PluginView;
  actionNode: Node;
};

class TableCellMenu extends React.PureComponent<TableCellMenuProps> {
  _menu = null;

  declare props: TableCellMenuProps;

  render(): React.ReactElement<CommandMenuButton> {
    const {editorState, editorView, pluginView, actionNode} = this.props;
    let cmdGrps = null;

    if (pluginView['_menu']) {
      cmdGrps = pluginView['_menu'](
        editorState,
        actionNode,
        TABLE_COMMANDS_GROUP
      );
    }

    if (!cmdGrps) {
      cmdGrps = TABLE_COMMANDS_GROUP;
    }

    return (
      <CommandMenuButton
        className="czi-table-cell-menu"
        commandGroups={cmdGrps}
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
