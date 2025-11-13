/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import DocLayoutCommand from './commands/docLayoutCommand';
import {
  HeadingCommand,
  MARK_STRONG,
  MARK_EM,
  MARK_STRIKE,
  MARK_SUPER,
  MARK_SUB,
  MARK_UNDERLINE,
  TextColorCommand,
  TextHighlightCommand,
  TextLineSpacingCommand,
} from '@modusoperandi/licit-ui-commands';
import HistoryRedoCommand from './commands/historyRedoCommand';
import HistoryUndoCommand from './commands/historyUndoCommand';
import HorizontalRuleCommand from './commands/horizontalRuleCommand';
import LinkSetURLCommand from './commands/linkSetURLCommand';
import { ListToggleCommand } from './commands/listToggleCommand';
import MarksClearCommand from './commands/marksClearCommand';
import TableBackgroundColorCommand from './commands/tableBackgroundColorCommand';
import TableBorderColorCommand from './commands/tableBorderColorCommand';
import TableInsertCommand from './commands/tableInsertCommand';
import TableMergeCellsCommand from './commands/tableMergeCellsCommand';
import IndentMoreCommand from './commands/indentMoreCommand';
import IndentLessCommand from './commands/indentLessCommand';
import TableAddColumnAfterCommand from './commands/tableAddColumnAfterCommand';
import TableAddColumnBeforeCommand from './commands/tableAddColumnBeforeCommand';
import TableAddRowAfterCommand from './commands/tableAddRowAfterCommand';
import TableAddRowBeforeCommand from './commands/tableAddRowBeforeCommand';
import TableDeleteColumnCommand from './commands/tableDeleteColumnCommand';
import TableDeleteRowCommand from './commands/tableDeleteRowCommand';
import TableDeleteTableCommand from './commands/tableDeleteTableCommand';
import TableMoveToNextCellCommand from './commands/tableMoveToNextCellCommand';
import TableMoveToPreviousCellCommand from './commands/tableMoveToPreviousCellCommand';
import TableSplitCellCommand from './commands/tableSplitCellCommand';
import TableToggleHeaderCellCommand from './commands/tableToggleHeaderCellCommand';
import TableToggleHeaderRowCommand from './commands/tableToggleHeaderRowCommand';
import TextAlignCommand from './commands/textAlignCommand';
import TableToggleHeaderColumnCommand from './commands/tableToggleHeaderColumnCommand';
import MarkToggleCommandEx from './commands/markToggleCommandEx';
import ListSplitCommand from './commands/listSplitCommand';

// Note that Firefox will, by default, add various kinds of controls to
// editable tables, even though those don't work in ProseMirror. The only way
// to turn these off is globally, which you might want to do with the
// following code:
document.execCommand('enableObjectResizing', false, 'false');
document.execCommand('enableInlineTableEditing', false, 'false');
export const CLEAR_FORMAT = new MarksClearCommand();
export const DOC_LAYOUT = new DocLayoutCommand();
export const EM = new MarkToggleCommandEx(MARK_EM);
export const H1 = new HeadingCommand(1);
export const H2 = new HeadingCommand(2);
export const H3 = new HeadingCommand(3);
export const H4 = new HeadingCommand(4);
export const H5 = new HeadingCommand(5);
export const H6 = new HeadingCommand(6);
export const HISTORY_REDO = new HistoryRedoCommand();
export const HISTORY_UNDO = new HistoryUndoCommand();
export const HR = new HorizontalRuleCommand();
export const INDENT_LESS = new IndentLessCommand();
export const INDENT_MORE = new IndentMoreCommand();
export const LINK_SET_URL = new LinkSetURLCommand();
export const STRIKE = new MarkToggleCommandEx(MARK_STRIKE);
export const STRONG = new MarkToggleCommandEx(MARK_STRONG);
export const SUPER = new MarkToggleCommandEx(MARK_SUPER);
export const SUB = new MarkToggleCommandEx(MARK_SUB);
export const TABLE_ADD_COLUMN_AFTER = new TableAddColumnAfterCommand();
export const TABLE_ADD_COLUMN_BEFORE = new TableAddColumnBeforeCommand();
export const TABLE_ADD_ROW_AFTER = new TableAddRowAfterCommand();
export const TABLE_ADD_ROW_BEFORE = new TableAddRowBeforeCommand();
export const TABLE_BACKGROUND_COLOR = new TableBackgroundColorCommand();
export const TABLE_BORDER_COLOR = new TableBorderColorCommand();
export const TABLE_DELETE_COLUMN = new TableDeleteColumnCommand();
export const TABLE_DELETE_ROW = new TableDeleteRowCommand();
export const TABLE_DELETE_TABLE = new TableDeleteTableCommand();
export const TABLE_INSERT_TABLE = new TableInsertCommand();
export const TABLE_MERGE_CELLS = new TableMergeCellsCommand();
export const TABLE_MOVE_TO_NEXT_CELL = new TableMoveToNextCellCommand();
export const TABLE_MOVE_TO_PREV_CELL = new TableMoveToPreviousCellCommand();
export const TABLE_SPLIT_ROW = new TableSplitCellCommand();
export const TABLE_TOGGLE_HEADER_CELL = new TableToggleHeaderCellCommand();
export const TABLE_TOGGLE_HEADER_COLUMN = new TableToggleHeaderColumnCommand();
export const TABLE_TOGGLE_HEADER_ROW = new TableToggleHeaderRowCommand();
export const TEXT_ALIGN_CENTER = new TextAlignCommand('center');
export const TEXT_ALIGN_JUSTIFY = new TextAlignCommand('justify');
export const TEXT_ALIGN_LEFT = new TextAlignCommand('left');
export const TEXT_ALIGN_RIGHT = new TextAlignCommand('right');
export const TEXT_COLOR = new TextColorCommand(undefined);
export const TEXT_HIGHLIGHT = new TextHighlightCommand(undefined);
export const TEXT_LINE_SPACINGS = TextLineSpacingCommand.createGroup();
export const UL = new ListToggleCommand(false, '');
export const UNDERLINE = new MarkToggleCommandEx(MARK_UNDERLINE);
export const LIST_SPLIT = new ListSplitCommand();