/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { MarkToggleCommand } from '@modusoperandi/licit-ui-commands';
import * as EditorCommands from './editorCommands';
import * as EditorKeyMap from './editorKeyMap';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function createEditorKeyMap(): any {
  return {
    [EditorKeyMap.KEY_SPLIT_LIST_ITEM.common]:
      EditorCommands.LIST_SPLIT.execute,
      [EditorKeyMap.KEY_TOGGLE_BOLD.common]: (EditorCommands.STRONG as MarkToggleCommand).execute,
      [EditorKeyMap.KEY_TOGGLE_ITALIC.common]: (EditorCommands.EM as MarkToggleCommand).execute,
      [EditorKeyMap.KEY_TOGGLE_UNDERLINE.common]: (EditorCommands.UNDERLINE as MarkToggleCommand).execute,
      [EditorKeyMap.KEY_TOGGLE_STRIKETHROUGH.common]: (EditorCommands.STRIKE as MarkToggleCommand).execute,
  };
}
