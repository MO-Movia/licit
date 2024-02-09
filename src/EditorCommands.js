// @flow

import * as ProsemirrorTables from 'prosemirror-tables';
// [FS][07-MAY-2020][IRAD-956]
// import BlockquoteInsertNewLineCommand from './BlockquoteInsertNewLineCommand';
// import BlockquoteToggleCommand from './BlockquoteToggleCommand';
import DocLayoutCommand from './DocLayoutCommand.js';
import {
  HeadingCommand
} from '@modusoperandi/licit-ui-commands';
import HistoryRedoCommand from './HistoryRedoCommand.js';
import HistoryUndoCommand from './HistoryUndoCommand.js';
import HorizontalRuleCommand from './HorizontalRuleCommand.js';
import {
  IndentCommand
} from '@modusoperandi/licit-ui-commands';
import LinkSetURLCommand from './LinkSetURLCommand.js';
import ListItemInsertNewLineCommand from './ListItemInsertNewLineCommand.js';
import ListItemMergeCommand from './ListItemMergeCommand.js';
import ListSplitCommand from './ListSplitCommand.js';
import {
  ListToggleCommand
} from './ListToggleCommand.js';
import * as MarkNames from './MarkNames.js';
import {
  MarkToggleCommand
} from '@modusoperandi/licit-ui-commands';
import MarksClearCommand from './MarksClearCommand.js';
import MathEditCommand from './MathEditCommand.js';
import PrintCommand from './PrintCommand.js';
import TableBackgroundColorCommand from './TableBackgroundColorCommand.js';
import TableBorderColorCommand from './TableBorderColorCommand.js';
import TableInsertCommand from './TableInsertCommand.js';
import TableMergeCellsCommand from './TableMergeCellsCommand.js';
import {
  TextAlignCommand
} from '@modusoperandi/licit-ui-commands';
import {
  TextColorCommand
} from '@modusoperandi/licit-ui-commands';
import {
  TextHighlightCommand
} from '@modusoperandi/licit-ui-commands';
import TextInsertTabSpaceCommand from './TextInsertTabSpaceCommand.js';
import {
  TextLineSpacingCommand
} from '@modusoperandi/licit-ui-commands';
import {
  createGroup
} from '@modusoperandi/licit-ui-commands';
import createCommand from './createCommand.js';

const {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  // columnResizing,
  deleteColumn,
  deleteRow,
  deleteTable,
  // fixTables,
  goToNextCell,
  // mergeCells,
  // setCellAttr,
  splitCell,
  // tableEditing,
  // tableNodes,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} = ProsemirrorTables;

const {
  MARK_STRONG,
  MARK_EM,
  MARK_STRIKE,
  MARK_SUPER,
  MARK_SUB,
  MARK_UNDERLINE,
} = MarkNames;

// Note that Firefox will, by default, add various kinds of controls to
// editable tables, even though those don't work in ProseMirror. The only way
// to turn these off is globally, which you might want to do with the
// following code:
document.execCommand('enableObjectResizing', false, 'false');
document.execCommand('enableInlineTableEditing', false, 'false');
// [FS][07-MAY-2020][IRAD-956]
//  export const BLOCKQUOTE_TOGGLE = new BlockquoteToggleCommand();
//  export const BLOCKQUOTE_INSERT_NEW_LINE = new BlockquoteInsertNewLineCommand();
export const CLEAR_FORMAT = new MarksClearCommand();
export const DOC_LAYOUT = new DocLayoutCommand();
export const EM = new MarkToggleCommand(MARK_EM);
export const H1 = new HeadingCommand(1);
export const H2 = new HeadingCommand(2);
export const H3 = new HeadingCommand(3);
export const H4 = new HeadingCommand(4);
export const H5 = new HeadingCommand(5);
export const H6 = new HeadingCommand(6);
export const HISTORY_REDO = new HistoryRedoCommand();
export const HISTORY_UNDO = new HistoryUndoCommand();
export const HR = new HorizontalRuleCommand();
export const INDENT_LESS = new IndentCommand(-1);
export const INDENT_MORE = new IndentCommand(1);
export const LINK_SET_URL = new LinkSetURLCommand();
export const LIST_ITEM_INSERT_NEW_LINE = new ListItemInsertNewLineCommand();
export const LIST_ITEM_MERGE_DOWN = new ListItemMergeCommand('down');
export const LIST_ITEM_MERGE_UP = new ListItemMergeCommand('up');
export const LIST_SPLIT = new ListSplitCommand();
export const MATH_EDIT = new MathEditCommand();
export const PRINT = new PrintCommand();
export const STRIKE = new MarkToggleCommand(MARK_STRIKE);
export const STRONG = new MarkToggleCommand(MARK_STRONG);
export const SUPER = new MarkToggleCommand(MARK_SUPER);
export const SUB = new MarkToggleCommand(MARK_SUB);
export const TABLE_ADD_COLUMN_AFTER = createCommand(addColumnAfter);
export const TABLE_ADD_COLUMN_BEFORE = createCommand(addColumnBefore);
export const TABLE_ADD_ROW_AFTER = createCommand(addRowAfter);
export const TABLE_ADD_ROW_BEFORE = createCommand(addRowBefore);
export const TABLE_BACKGROUND_COLOR = new TableBackgroundColorCommand();
export const TABLE_BORDER_COLOR = new TableBorderColorCommand();
export const TABLE_DELETE_COLUMN = createCommand(deleteColumn);
export const TABLE_DELETE_ROW = createCommand(deleteRow);
export const TABLE_DELETE_TABLE = createCommand(deleteTable);
export const TABLE_INSERT_TABLE = new TableInsertCommand();
export const TABLE_MERGE_CELLS = new TableMergeCellsCommand();
export const TABLE_MOVE_TO_NEXT_CELL = createCommand(goToNextCell(1));
export const TABLE_MOVE_TO_PREV_CELL = createCommand(goToNextCell(-1));
export const TABLE_SPLIT_ROW = createCommand(splitCell);
export const TABLE_TOGGLE_HEADER_CELL = createCommand(toggleHeaderCell);
export const TABLE_TOGGLE_HEADER_COLUMN = createCommand(toggleHeaderColumn);
export const TABLE_TOGGLE_HEADER_ROW = createCommand(toggleHeaderRow);
export const TEXT_ALIGN_CENTER = new TextAlignCommand('center');
export const TEXT_ALIGN_JUSTIFY = new TextAlignCommand('justify');
export const TEXT_ALIGN_LEFT = new TextAlignCommand('left');
export const TEXT_ALIGN_RIGHT = new TextAlignCommand('right');
export const TEXT_COLOR = new TextColorCommand();
export const TEXT_HIGHLIGHT = new TextHighlightCommand();
export const TEXT_INSERT_TAB_SPACE = new TextInsertTabSpaceCommand();
export const TEXT_LINE_SPACINGS = TextLineSpacingCommand.createGroup();
export const UL = new ListToggleCommand(false, '');
export const UNDERLINE = new MarkToggleCommand(MARK_UNDERLINE);
