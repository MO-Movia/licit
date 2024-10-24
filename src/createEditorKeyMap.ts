import * as EditorCommands from './editorCommands';
import * as EditorKeyMap from './editorKeyMap';
import type { UserKeyMap } from '@modusoperandi/licit-doc-attrs-step';

export default function createEditorKeyMap(): any {
  return {
    [EditorKeyMap.KEY_SPLIT_LIST_ITEM.common]:
      EditorCommands.LIST_SPLIT.execute,
  };
}
