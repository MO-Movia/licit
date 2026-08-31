import { DOMParser as PMDOMParser } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { CellSelection } from 'prosemirror-tables';
import EditorSchema from './EditorSchema.js';
import TableTextRotationCommand from './TableTextRotationCommand.js';

function createEditorState() {
  const root = document.createElement('div');
  root.innerHTML = `
    <table>
      <tbody>
        <tr><th><p>Header</p></th><td><p>Body</p></td></tr>
      </tbody>
    </table>
    <p>Outside</p>
  `;
  return EditorState.create({
    doc: PMDOMParser.fromSchema(EditorSchema).parse(root),
  });
}

function getCellPositions(state) {
  const positions = [];
  state.doc.descendants((node, pos) => {
    const role = node.type.spec.tableRole;
    if (role === 'cell' || role === 'header_cell') {
      positions.push(pos);
    }
  });
  return positions;
}

describe('TableTextRotationCommand', () => {
  it('toggles clockwise rotation for the current cell', () => {
    const command = new TableTextRotationCommand();
    let state = createEditorState();
    const [cellPos] = getCellPositions(state);
    state = state.apply(
      state.tr.setSelection(TextSelection.create(state.doc, cellPos + 1))
    );
    const dispatch = (tr) => {
      state = state.apply(tr);
    };

    expect(command.isEnabled(state)).toBe(true);
    expect(command.isActive(state)).toBe(false);
    expect(command.execute(state, dispatch)).toBe(true);
    expect(state.doc.nodeAt(cellPos).attrs.textRotation).toBe('clockwise');
    expect(command.isActive(state)).toBe(true);

    expect(command.execute(state, dispatch)).toBe(true);
    expect(state.doc.nodeAt(cellPos).attrs.textRotation).toBeNull();
  });

  it('applies rotation to every selected cell', () => {
    const command = new TableTextRotationCommand();
    let state = createEditorState();
    const [headerPos, cellPos] = getCellPositions(state);
    state = state.apply(
      state.tr.setSelection(
        CellSelection.create(state.doc, headerPos, cellPos)
      )
    );
    const dispatch = (tr) => {
      state = state.apply(tr);
    };

    expect(command.execute(state, dispatch)).toBe(true);
    expect(state.doc.nodeAt(headerPos).attrs.textRotation).toBe('clockwise');
    expect(state.doc.nodeAt(cellPos).attrs.textRotation).toBe('clockwise');
    expect(command.isActive(state)).toBe(true);
  });

  it('is disabled outside a table', () => {
    const command = new TableTextRotationCommand();
    let state = createEditorState();
    let outsidePos = null;
    state.doc.descendants((node, pos, parent) => {
      if (node.type.name === 'paragraph' && parent === state.doc) {
        outsidePos = pos + 1;
      }
    });
    state = state.apply(
      state.tr.setSelection(TextSelection.create(state.doc, outsidePos))
    );

    expect(command.isEnabled(state)).toBe(false);
    expect(command.isActive(state)).toBe(false);
    expect(command.execute(state)).toBe(false);
  });
});
