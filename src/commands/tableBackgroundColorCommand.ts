/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import TableColorCommand from './tableColorCommand';

class TableBackgroundColorCommand extends TableColorCommand {
  executeCustom(_state: EditorState, tr: Transform, _from: number, _to: number): Transform {
    return tr;
  }
  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
  isActive = (_state: EditorState): boolean => {
    return false;
  };

  constructor() {
    super('backgroundColor');
  }
}

export default TableBackgroundColorCommand;
