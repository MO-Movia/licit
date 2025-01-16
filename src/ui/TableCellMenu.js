// @flow
import { EditorState, PluginView } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';
import * as React from 'react';

import CommandMenuButton from './CommandMenuButton.js';
import { TABLE_COMMANDS_GROUP } from './EditorToolbarConfig.js';
import Icon from './Icon.js';

type Props = {
  editorState: EditorState,
  editorView: EditorView,
  pluginView: PluginView,
  actionNode: Node,
};

class TableCellMenu extends React.PureComponent<any, any> {
  _menu = null;

  props: Props;

  render(): React.Element<any> {
    const { editorState, editorView, pluginView, actionNode } = this.props;
    let cmdGrps = null;

    if (pluginView.getMenu) {
      cmdGrps = pluginView.getMenu(editorState, actionNode, TABLE_COMMANDS_GROUP);
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
        icon={Icon.get('edit')}
        title="Edit"
      />
    );
  }
}

export default TableCellMenu;
