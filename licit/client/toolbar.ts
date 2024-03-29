import type { ToolbarMenuConfig } from '../../src/types';
import * as EditorCommands from '../../src/editorCommands';
import FontSizeCommandMenuButton from '../../src/ui/fontSizeCommandMenuButton';
import FontTypeCommandMenuButton from '../../src/ui/fontTypeCommandMenuButton';
import ListTypeCommandButton from '../../src/ui/listTypeCommandButton';
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
    menuPosition:0,
    key:'[undo] Undo',
    menuCommand: HISTORY_UNDO,
    group:'undo'
  },
  {
    menuPosition:1,
    key:'[redo] Redo',
    menuCommand: HISTORY_REDO,
    group:'undo'
    
  },
  {
    menuPosition:2,
    key:'[font_download] Font Type',
    menuCommand: FontTypeCommandMenuButton,
    group:'font'
    
  },

  {
    menuPosition:3,
    key:'ChangeCasePlugin$',
    menuCommand: undefined,
    isPlugin:true,
    group:''
  },
//   {
//     '[format_size] Text Size': FontSizeCommandMenuButton,
//   },
//   {
//     '[format_bold] Bold': STRONG,
//     '[format_italic] Italic': EM,
//     '[format_underline] Underline': UNDERLINE,
//     '[format_strikethrough] Strike through': STRIKE,
//     '[arrow_drop_down] Expand': FONT_ACTIONS_MINIMIZED,
//   },
//   {
//     '[format_align_left] Text align': TEXT_ALIGN_GROUP,
//   },
//   {
//     '[format_indent_increase] Indent more': INDENT_MORE,
//     '[format_indent_decrease] Indent less': INDENT_LESS,
//     '[format_line_spacing] Line spacing': TEXT_LINE_SPACINGS,
//   },
//   {
//     // [FS] IRAD-1039 2020-09-23
//     // Added new command button that brings a popup
//     '[format_list_numbered] Ordered list': ListTypeCommandButton,
//     '[format_list_bulleted] Bulleted list': UL,
//   },
//   {
//     '[link] Apply link': LINK_SET_URL,
//     '[grid_on] Table...': TABLE_COMMANDS_GROUP,
//     '[hr] Horizontal line': HR,
//     // '[functions] Math': MATH_EDIT,

//     // [FS][07-MAY-2020][IRAD-956]
//     // '[format_quote] Block quote': BLOCKQUOTE_TOGGLE,
//   },

  {
    menuPosition:4,
    key:'[settings_overscan] Page layout',
    menuCommand: DOC_LAYOUT
    
  }

];