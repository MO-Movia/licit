import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import TableColorCommand from './tableColorCommand';

class TableBorderColorCommand extends TableColorCommand {
  executeCustom(state: EditorState, tr: Transform, from: number, to: number): Transform {
    return tr;
  }
  constructor() {
    super('borderColor');
  }
}

export default TableBorderColorCommand;
