import type { ToolbarMenuConfig } from '../../src/types';
import * as EditorCommands from '../../src/editorCommands';
import FontSizeCommandMenuButton from '../../src/ui/fontSizeCommandMenuButton';
import FontTypeCommandMenuButton from '../../src/ui/fontTypeCommandMenuButton';
import ListTypeCommandButton from '../../src/ui/listTypeCommandButton';
import { FONT_ACTIONS_MINIMIZED, TEXT_ALIGN_GROUP } from '../../src/ui/editorToolbarConfig'
// import EditorToolbar from '../../src/ui/editorToolbar';
const {
  CLEAR_FORMAT,
  DOC_LAYOUT,
  EM,
  HISTORY_REDO,
  HISTORY_UNDO,
  HR,
  INDENT_LESS,
  INDENT_MORE,
  LINK_SET_URL,
  STRIKE,
  STRONG,
  SUPER,
  SUB,
  TABLE_ADD_COLUMN_AFTER,
  TABLE_ADD_COLUMN_BEFORE,
  TABLE_ADD_ROW_AFTER,
  TABLE_ADD_ROW_BEFORE,
  TABLE_BORDER_COLOR,
  TABLE_BACKGROUND_COLOR,
  TABLE_DELETE_COLUMN,
  TABLE_DELETE_ROW,
  TABLE_DELETE_TABLE,
  TABLE_INSERT_TABLE,
  TABLE_MERGE_CELLS,
  TABLE_SPLIT_ROW,
  TABLE_TOGGLE_HEADER_CELL,
  TABLE_TOGGLE_HEADER_COLUMN,
  TABLE_TOGGLE_HEADER_ROW,
  TEXT_ALIGN_CENTER,
  TEXT_ALIGN_JUSTIFY,
  TEXT_ALIGN_LEFT,
  TEXT_ALIGN_RIGHT,
  TEXT_COLOR,
  TEXT_HIGHLIGHT,
  TEXT_LINE_SPACINGS,
  UL,
  UNDERLINE,
} = EditorCommands;

export const ToolbarOrder: ToolbarMenuConfig[] = [
  {
    menuPosition: 0,
    key: '[undo] Undo',
    menuCommand: HISTORY_UNDO,
    group: 'undo'
  },
  {
    menuPosition: 1,
    key: '[redo] Redo',
    menuCommand: HISTORY_REDO,
    group: 'undo'

  },
  {
    menuPosition: 2,
    key: '[font_download] Font Type',
    menuCommand: FontTypeCommandMenuButton,
    group: 'font'

  },
  {
    menuPosition: 3,
    key: '[format_size] Text Size',
    menuCommand: FontSizeCommandMenuButton,
    group: 'font-size'
  },

  {
    menuPosition: 4,
    key: '[arrow_drop_down] Expand',
    menuCommand: FONT_ACTIONS_MINIMIZED,
    group: 'font-size'
  },

  // {
  //   menuPosition: 4,
  //   key: '[format_bold] Bold',
  //   menuCommand: STRONG,
  //   group: 'Bold'
  // },

  // {
  //   menuPosition: 5,
  //   key: '[format_italic] Italic',
  //   menuCommand: EM,
  //   group: 'Em'
  // },

  // {
  //   menuPosition: 6,
  //   key: '[format_underline] Underline',
  //   menuCommand: UNDERLINE,
  //   group: 'underline'
  // },
  // {
  //   menuPosition: 7,
  //   key: '[format_strikethrough] Strike through',
  //   menuCommand: STRIKE,
  //   group: ''
  // },

  // {
  //   menuPosition: 8,
  //   key: '[arrow_drop_down] Expand',
  //   menuCommand: FONT_ACTIONS_MINIMIZED,
  //   group: ''
  // },
  // {
  //   menuPosition: 9,
  //   key: '[format_align_left] Text align',
  //   menuCommand: TEXT_ALIGN_GROUP,
  //   group: ''
  // },
  // {
  //   menuPosition: 10,
  //   key: '[format_indent_increase] Indent more',
  //   menuCommand: INDENT_MORE,
  //   group: ''
  // },
  // {
  //   menuPosition: 11,
  //   key: '[format_indent_decrease] Indent less',
  //   menuCommand: INDENT_LESS,
  //   group: ''
  // },
  // {
  //   menuPosition: 12,
  //   key: '[format_line_spacing] Line spacing',
  //   menuCommand: TEXT_LINE_SPACINGS,
  //   group: ''
  // },
  // {
  //   menuPosition: 13,
  //   key: '[format_list_numbered] Ordered list',
  //   menuCommand: ListTypeCommandButton,
  //   group: ''
  // },
  // {
  //   menuPosition: 14,
  //   key: '[format_list_bulleted] Bulleted list',
  //   menuCommand: UL,
  //   group: ''
  // },

  {
    menuPosition: 15,
    key: 'CustomstylePlugin$',
    menuCommand: undefined,
    isPlugin: true,
    group: 'plugin'
  },

  {
    menuPosition: 16,
    key: 'ChangeCasePlugin$',
    menuCommand: undefined,
    isPlugin: true,
    group: 'plugin'
  },

  {
    menuPosition: 17,
    key: 'exportPDF$',
    menuCommand: undefined,
    isPlugin: true,
    group: 'plugin'
  },
  //   {
  //     '[link] Apply link': LINK_SET_URL,
  //     '[grid_on] Table...': TABLE_COMMANDS_GROUP,
  //     '[hr] Horizontal line': HR,
  //     // '[functions] Math': MATH_EDIT,

  //     // [FS][07-MAY-2020][IRAD-956]
  //     // '[format_quote] Block quote': BLOCKQUOTE_TOGGLE,
  //   },

  {
    menuPosition: 18,
    key: '[link] Apply link',
    menuCommand: LINK_SET_URL,
    group: ''

  }

];