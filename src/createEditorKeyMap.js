// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import * as EditorCommands from './EditorCommands.js';
import * as EditorKeyMap from './EditorKeyMap.js';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import type {
  UserKeyCommand,
  UserKeyMap,
} from '@modusoperandi/licit-doc-attrs-step';

const {
  KEY_BACK_DELETE,
  KEY_FORWARD_DELETE,
  KEY_INSERT_NEW_LINE_IN_BLOCKQUOTE,
  KEY_REDO,
  KEY_SPLIT_LIST_ITEM,
  KEY_TAB_SHIFT,
  KEY_TAB,
  KEY_TOGGLE_BOLD,
  KEY_TOGGLE_ITALIC,
  KEY_TOGGLE_UNDERLINE,
  KEY_UNDO,
} = EditorKeyMap;

const {
  BLOCKQUOTE_INSERT_NEW_LINE,
  EM,
  HISTORY_REDO,
  HISTORY_UNDO,
  INDENT_LESS,
  INDENT_MORE,
  LIST_ITEM_MERGE_DOWN,
  LIST_ITEM_MERGE_UP,
  LIST_SPLIT,
  TABLE_MOVE_TO_NEXT_CELL,
  TABLE_MOVE_TO_PREV_CELL,
  TEXT_INSERT_TAB_SPACE,
  STRONG,
  UNDERLINE,
} = EditorCommands;

function bindCommands(...commands: Array<UICommand>): UserKeyCommand {
  return function (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean {
    return commands.some((cmd) => {
      if (cmd.isEnabled(state, view, '')) {
        cmd.execute(state, dispatch, view);
        return true;
      }
      return false;
    });
  };
}

export default function createEditorKeyMap(): UserKeyMap {
  const result = {
    [KEY_BACK_DELETE.common]: LIST_ITEM_MERGE_UP.execute,
    [KEY_FORWARD_DELETE.common]: LIST_ITEM_MERGE_DOWN.execute,
    [KEY_REDO.common]: HISTORY_REDO.execute,
    [KEY_SPLIT_LIST_ITEM.common]: LIST_SPLIT.execute,
    [KEY_TAB.common]: bindCommands(
      TABLE_MOVE_TO_NEXT_CELL,
      TEXT_INSERT_TAB_SPACE,
      INDENT_MORE
    ),
    [KEY_TAB_SHIFT.common]: bindCommands(
      TABLE_MOVE_TO_PREV_CELL,
      TEXT_INSERT_TAB_SPACE,
      INDENT_LESS
    ),
    [KEY_TOGGLE_BOLD.common]: STRONG.execute,
    [KEY_TOGGLE_ITALIC.common]: EM.execute,
    [KEY_TOGGLE_UNDERLINE.common]: UNDERLINE.execute,
    [KEY_UNDO.common]: HISTORY_UNDO.execute,
    [KEY_INSERT_NEW_LINE_IN_BLOCKQUOTE.common]:
      BLOCKQUOTE_INSERT_NEW_LINE.execute,
  };

  return result;
}
