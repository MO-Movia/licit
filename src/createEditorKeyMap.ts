/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as EditorCommands from './editorCommands';
import * as EditorKeyMap from './editorKeyMap';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function createEditorKeyMap(): any {
  return {
    [EditorKeyMap.KEY_SPLIT_LIST_ITEM.common]:
      EditorCommands.LIST_SPLIT.execute,
  };
}
