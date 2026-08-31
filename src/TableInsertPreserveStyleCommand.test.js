import { Fragment } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { addColumnAfter, addRowAfter } from 'prosemirror-tables';

import EditorSchema from './EditorSchema.js';
import TableInsertPreserveStyleCommand from './TableInsertPreserveStyleCommand.js';
import TablePendingStyleMarksPlugin from './TablePendingStyleMarksPlugin.js';

const { doc, paragraph, table, table_row, table_cell } = EditorSchema.nodes;

function p(attrs, content) {
  return paragraph.create(attrs, content);
}

function cell(content) {
  return table_cell.create(null, content);
}

function row(cells) {
  return table_row.create(null, cells);
}

function tableDoc(rows) {
  return doc.create(null, table.create(null, rows));
}

function text(value, marks = []) {
  return EditorSchema.text(value, marks);
}

function textPos(root, value) {
  let found = null;
  root.descendants((node, pos) => {
    if (found === null && node.isText && node.text === value) {
      found = pos;
    }
  });
  return found;
}

function createState(root, cursorText) {
  const pos = textPos(root, cursorText);
  return EditorState.create({
    doc: root,
    selection: TextSelection.create(root, pos),
    plugins: [TablePendingStyleMarksPlugin()],
  });
}

function paragraphPosByPath(root, rowIndex, cellIndex) {
  let found = null;
  const paragraphNode = root.firstChild.child(rowIndex).child(cellIndex)
    .firstChild;
  root.descendants((node, pos) => {
    if (found === null && node === paragraphNode) {
      found = pos;
    }
  });
  return found;
}

describe('TableInsertPreserveStyleCommand', () => {
  it('copies complete paragraph overrides from the previous row', () => {
    const firstAttrs = {
      align: 'center',
      lineSpacing: '150%',
      indent: 2,
      overriddenAlign: 'true',
      overriddenAlignValue: 'center',
      overriddenLineSpacing: 'true',
      overriddenLineSpacingValue: '150%',
      overriddenIndent: 'true',
      overriddenIndentValue: '2',
    };
    const secondAttrs = {
      align: 'right',
      overriddenAlign: 'true',
      overriddenAlignValue: 'right',
    };
    const root = tableDoc([
      row([
        cell(p(firstAttrs, text('a'))),
        cell(p(secondAttrs, text('b'))),
      ]),
    ]);
    const state = createState(root, 'a');
    const command = new TableInsertPreserveStyleCommand(
      addRowAfter,
      'row',
      'after'
    );
    let tr = null;

    expect(command.execute(state, (nextTr) => (tr = nextTr))).toBe(true);

    const insertedRow = tr.doc.firstChild.child(1);
    const firstParagraph = insertedRow.child(0).firstChild;
    const secondParagraph = insertedRow.child(1).firstChild;

    expect(firstParagraph.attrs.align).toBe('center');
    expect(firstParagraph.attrs.lineSpacing).toBe('150%');
    expect(firstParagraph.attrs.indent).toBe(2);
    expect(firstParagraph.attrs.overriddenAlign).toBe('true');
    expect(firstParagraph.attrs.overriddenLineSpacing).toBe('true');
    expect(firstParagraph.attrs.overriddenIndent).toBe('true');
    expect(secondParagraph.attrs.align).toBe('right');
    expect(secondParagraph.attrs.overriddenAlign).toBe('true');
  });

  it('does not copy partial inline mark overrides into a new column', () => {
    const strong = EditorSchema.marks.strong.create();
    const root = tableDoc([
      row([
        cell(p(null, Fragment.fromArray([text('a', [strong]), text('b')]))),
        cell(p(null, text('c'))),
      ]),
    ]);
    const state = createState(root, 'a');
    const command = new TableInsertPreserveStyleCommand(
      addColumnAfter,
      'column',
      'after'
    );
    let tr = null;

    expect(command.execute(state, (nextTr) => (tr = nextTr))).toBe(true);

    const insertedCellParagraph = tr.doc.firstChild.child(0).child(1).firstChild;

    expect(insertedCellParagraph.attrs.align).toBe(null);
    expect(insertedCellParagraph.attrs.overriddenAlign).toBe(null);
    expect(insertedCellParagraph.attrs.tableStyleMarks).toBe(null);
  });

  it('copies complete paragraph overrides from the previous cell into a new column', () => {
    const attrs = {
      lineSpacing: '200%',
      overriddenLineSpacing: 'true',
      overriddenLineSpacingValue: '200%',
    };
    const root = tableDoc([
      row([
        cell(p(attrs, text('a'))),
        cell(p(null, text('b'))),
      ]),
    ]);
    const state = createState(root, 'a');
    const command = new TableInsertPreserveStyleCommand(
      addColumnAfter,
      'column',
      'after'
    );
    let tr = null;

    expect(command.execute(state, (nextTr) => (tr = nextTr))).toBe(true);

    const insertedCellParagraph = tr.doc.firstChild.child(0).child(1).firstChild;

    expect(insertedCellParagraph.attrs.lineSpacing).toBe('200%');
    expect(insertedCellParagraph.attrs.overriddenLineSpacing).toBe('true');
    expect(insertedCellParagraph.attrs.overriddenLineSpacingValue).toBe('200%');
  });

  it('applies whole-paragraph mark overrides when typing in the new cell', () => {
    const marks = [
      EditorSchema.marks.strong.create({ overridden: true }),
      EditorSchema.marks.em.create({ overridden: true }),
      EditorSchema.marks.underline.create({ overridden: true }),
    ];
    const root = tableDoc([
      row([
        cell(p(null, text('a', marks))),
        cell(p(null, text('b'))),
      ]),
    ]);
    const state = createState(root, 'a');
    const command = new TableInsertPreserveStyleCommand(
      addRowAfter,
      'row',
      'after'
    );
    let insertRowTr = null;

    expect(command.execute(state, (nextTr) => (insertRowTr = nextTr))).toBe(
      true
    );

    const insertedState = state.apply(insertRowTr);
    const insertedParagraph = insertedState.doc.firstChild.child(1).child(0)
      .firstChild;
    expect(insertedParagraph.attrs.tableStyleMarks).toHaveLength(3);

    const paragraphPos = paragraphPosByPath(insertedState.doc, 1, 0);
    const typedState = insertedState.apply(
      insertedState.tr.insertText('x', paragraphPos + 1)
    );
    const typedText = typedState.doc.firstChild.child(1).child(0).firstChild
      .firstChild;
    const markNames = typedText.marks.map((mark) => mark.type.name).sort();

    expect(markNames).toEqual(['em', 'strong', 'underline']);
    expect(typedText.marks.every((mark) => mark.attrs.overridden)).toBe(true);
    expect(
      typedState.doc.firstChild.child(1).child(0).firstChild.attrs
        .tableStyleMarks
    ).toBe(null);
  });

  it('preserves Normal style font size and font type marks when typing', () => {
    const normalMarks = [
      EditorSchema.marks['mark-font-size'].create({
        pt: 11,
        overridden: false,
      }),
      EditorSchema.marks['mark-font-type'].create({
        name: 'Arial',
        overridden: false,
      }),
    ];
    const root = tableDoc([
      row([
        cell(p(null, text('a', normalMarks))),
        cell(p(null, text('b'))),
      ]),
    ]);
    const state = createState(root, 'a');
    const command = new TableInsertPreserveStyleCommand(
      addRowAfter,
      'row',
      'after'
    );
    let insertRowTr = null;

    expect(command.execute(state, (nextTr) => (insertRowTr = nextTr))).toBe(
      true
    );

    const insertedState = state.apply(insertRowTr);
    const paragraphPos = paragraphPosByPath(insertedState.doc, 1, 0);
    const typedState = insertedState.apply(
      insertedState.tr.insertText('x', paragraphPos + 1)
    );
    const typedText = typedState.doc.firstChild.child(1).child(0).firstChild
      .firstChild;
    const fontSize = typedText.marks.find(
      (mark) => mark.type.name === 'mark-font-size'
    );
    const fontType = typedText.marks.find(
      (mark) => mark.type.name === 'mark-font-type'
    );

    expect(fontSize?.attrs).toEqual({ pt: 11, overridden: false });
    expect(fontType?.attrs).toEqual({ name: 'Arial', overridden: false });
  });
});
