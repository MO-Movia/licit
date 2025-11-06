import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import TableColorCommand from './tableColorCommand';

class TableBorderColorCommand extends TableColorCommand {
  executeCustom(_state: EditorState, tr: Transform, _from: number, _to: number): Transform {
    return tr;
  }
  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
  constructor() {
    super('borderColor');
  }
}

export default TableBorderColorCommand;
