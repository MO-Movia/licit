import { EditorState } from 'prosemirror-state';

import { MarkToggleCommand } from '@modusoperandi/licit-ui-commands';

class MarkToggleCommandEx extends MarkToggleCommand {
  constructor(markName: string) {
    super(markName);
  }

  isEnabled = (_state: EditorState): boolean => {
    return true;
  };
}

export default MarkToggleCommandEx;
