import * as EditorCommands from './editorCommands';
import * as EditorKeyMap from './editorKeyMap';

export default function createEditorKeyMap(): any {
  return {
    [EditorKeyMap.KEY_SPLIT_LIST_ITEM.common]:
      EditorCommands.LIST_SPLIT.execute,
  };
}
