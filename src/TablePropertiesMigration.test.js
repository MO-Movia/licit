import { DOMParser as PMDOMParser, DOMSerializer } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { addRowAfter } from 'prosemirror-tables';

import EditorSchema from './EditorSchema.js';
import TableCellStyleInheritancePlugin from './TableCellStyleInheritancePlugin.js';
import TableColorCommand from './TableColorCommand.js';
import TableDetailsCommand from './TableDetailsCommand.js';
import preserveTableProperties from './preserveTableProperties.js';

function paragraph(text, marks = [], attrs = null) {
  return EditorSchema.nodes.paragraph.create(
    attrs,
    text ? EditorSchema.text(text, marks) : null
  );
}

function createTable(cellAttrs = {}, text = 'x', marks = []) {
  const cell = EditorSchema.nodes.table_cell.create(
    cellAttrs,
    paragraph(text, marks)
  );
  const row = EditorSchema.nodes.table_row.create(null, [cell, cell]);
  return EditorSchema.nodes.doc.create(
    null,
    EditorSchema.nodes.table.create({ noOfColumns: 2 }, row)
  );
}

function getRoleRefs(doc) {
  const refs = {};
  doc.descendants((node, pos) => {
    const role = node.type.spec.tableRole;
    if (role && !refs[role]) {
      refs[role] = { node, pos, start: pos + 1 };
    }
  });
  return refs;
}

describe('legacy table-properties migration', () => {
  it('serializes modern importer attributes without treating cellStyle metadata as CSS', () => {
    const header = EditorSchema.nodes.table_header.create(
      {
        background: '#000000',
        backgroundColor: '#abdbe3',
        backgroundColorOverridden: true,
        borderTopColor: '#ff0000',
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        cellStyle: 'para',
        fontName: 'Georgia',
        fontWeight: 'bold',
        fontWeightOverridden: true,
        paddingRight: '7px',
        verticalAlign: 'middle',
        vAlign: 'middle',
      },
      paragraph('Header')
    );
    const row = EditorSchema.nodes.table_row.create(
      { rowHeight: '32px' },
      header
    );
    const table = EditorSchema.nodes.table.create(
      { noOfColumns: 1, tableHeight: '120px' },
      row
    );
    const tableDOM =
      DOMSerializer.fromSchema(EditorSchema).serializeNode(table);
    const cellDOM = tableDOM.querySelector('th');

    expect(tableDOM.style.height).toBe('120px');
    expect(cellDOM.dataset.cellStyle).toBe('para');
    expect(cellDOM.style.cssText).not.toContain('para');
    expect(cellDOM.style.backgroundColor).toBe('rgb(171, 219, 227)');
    expect(cellDOM.style.borderTopColor).toBe('rgb(255, 0, 0)');
    expect(cellDOM.style.fontWeight).toBe('bold');
    expect(cellDOM.style.paddingRight).toBe('7px');
  });

  it('parses exact font sizes and table/background aliases', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <table style="height: 90px">
        <tr><th style="background-color: rgb(1, 2, 3)">
          <p><span style="font-size: 10.7pt">Header</span></p>
        </th></tr>
      </table>`;
    const doc = PMDOMParser.fromSchema(EditorSchema).parse(root);
    const table = doc.firstChild;
    const cell = table.firstChild.firstChild;
    const fontSizeMark = cell.firstChild.firstChild.marks.find(
      (mark) => mark.type.name === 'mark-font-size'
    );

    expect(table.attrs.tableHeight).toBe('90px');
    expect(table.attrs.tableheight).toBe('90px');
    expect(cell.attrs.background).toBe('rgb(1, 2, 3)');
    expect(cell.attrs.backgroundColor).toBe('rgb(1, 2, 3)');
    expect(fontSizeMark.attrs.pt).toBe(10.7);
  });

  it('reflects header marks and cell background in Table Settings data', () => {
    const marks = [
      EditorSchema.marks['mark-font-type'].create({
        name: 'Georgia',
        overridden: true,
      }),
      EditorSchema.marks['mark-font-size'].create({
        pt: 10.7,
        overridden: true,
      }),
      EditorSchema.marks.strong.create({ overridden: true }),
    ];
    const header = EditorSchema.nodes.table_header.create(
      { background: '#abdbe3', paddingTop: '6px' },
      paragraph('Header', marks)
    );
    const doc = EditorSchema.nodes.doc.create(
      null,
      EditorSchema.nodes.table.create(
        { noOfColumns: 2 },
        EditorSchema.nodes.table_row.create(null, [header, header])
      )
    );
    const refs = getRoleRefs(doc);
    const command = new TableDetailsCommand();
    const cellDOM = document.createElement('td');
    cellDOM.style.backgroundColor = '#abdbe3';
    const data = command.buildTableEditorDialogData(
      {
        table: refs.table,
        row: refs.row,
        cell: refs.header_cell,
        cells: [refs.header_cell],
      },
      { width: 400, height: 100 },
      { width: 200, height: 100 },
      cellDOM
    );

    expect(data.typography.fontFamily).toBe('Georgia');
    expect(data.typography.fontSize).toBe('10.7pt');
    expect(data.typography.bold).toBe(true);
    expect(data.typography.backgroundColor).toBe('#abdbe3');
    expect(data.layout.paddingTop).toBe('6px');
  });

  it('synchronizes selected borders with the adjacent collapsed edge', () => {
    const doc = createTable({ borderColor: '#111111' });
    const cellPositions = [];
    doc.descendants((node, pos) => {
      if (node.type.spec.tableRole === 'cell') {
        cellPositions.push(pos);
      }
    });
    const state = EditorState.create({
      schema: EditorSchema,
      doc,
      selection: TextSelection.create(doc, cellPositions[0] + 2),
    });
    const command = new TableColorCommand('borderColor');
    let nextState = state;

    expect(
      command.setCellBorders(
        state,
        (tr) => {
          nextState = state.apply(tr);
        },
        ['Top', 'Right'],
        '#ff0000'
      )
    ).toBe(true);

    const first = nextState.doc.nodeAt(cellPositions[0]);
    const right = nextState.doc.nodeAt(cellPositions[1]);
    expect(first.attrs.borderColor).toBeNull();
    expect(first.attrs.borderTopColor).toBe('#ff0000');
    expect(first.attrs.borderRightColor).toBe('#ff0000');
    expect(first.attrs.borderBottomColor).toBe('#111111');
    expect(right.attrs.borderLeftColor).toBe('#ff0000');
  });

  it('inherits explicitly overridden cell styles into paragraph and text', () => {
    const strong = EditorSchema.marks.strong.create({ overridden: true });
    const doc = createTable(
      {
        fontName: 'Georgia',
        fontNameOverridden: true,
        fontSize: '10.7pt',
        fontSizeOverridden: true,
        fontWeight: 'normal',
        fontWeightOverridden: true,
        lineHeight: '1.4',
        lineHeightOverridden: true,
        textAlign: 'center',
        textAlignOverridden: true,
      },
      'x',
      [strong]
    );
    const refs = getRoleRefs(doc);
    const state = EditorState.create({
      schema: EditorSchema,
      doc,
      plugins: [new TableCellStyleInheritancePlugin()],
    });
    const result = state.applyTransaction(
      state.tr.setNodeMarkup(refs.cell.pos, undefined, {
        ...refs.cell.node.attrs,
        cellStyle: 'changed',
      })
    );
    const cell = result.state.doc.nodeAt(refs.cell.pos);
    const updatedParagraph = cell.firstChild;
    const updatedText = updatedParagraph.firstChild;

    expect(updatedParagraph.attrs.align).toBe('center');
    expect(updatedParagraph.attrs.lineSpacing).toBe('1.4');
    expect(
      updatedText.marks.find((mark) => mark.type.name === 'mark-font-type')
        .attrs.name
    ).toBe('Georgia');
    expect(
      updatedText.marks.find((mark) => mark.type.name === 'mark-font-size')
        .attrs.pt
    ).toBe(10.7);
    expect(updatedText.marks.some((mark) => mark.type.name === 'strong')).toBe(
      false
    );
  });

  it('preserves Table Settings values when a row is inserted', () => {
    const strong = EditorSchema.marks.strong.create({ overridden: true });
    const paragraphAttrs = {
      align: 'center',
      overriddenAlign: true,
      overriddenAlignValue: 'center',
    };
    const cell = EditorSchema.nodes.table_cell.create(
      {
        background: '#abdbe3',
        backgroundColor: '#abdbe3',
        fontName: 'Georgia',
        fontNameOverridden: true,
        paddingTop: '6px',
      },
      paragraph('x', [strong], paragraphAttrs)
    );
    const row = EditorSchema.nodes.table_row.create({ rowHeight: '41px' }, [
      cell,
      cell,
    ]);
    const doc = EditorSchema.nodes.doc.create(
      null,
      EditorSchema.nodes.table.create({ noOfColumns: 2 }, row)
    );
    const refs = getRoleRefs(doc);
    const state = EditorState.create({
      schema: EditorSchema,
      doc,
      selection: TextSelection.create(doc, refs.cell.pos + 2),
    });
    const command = preserveTableProperties(addRowAfter, 'addRowAfter');
    let nextState = state;

    expect(
      command(state, (tr) => {
        nextState = state.apply(tr);
      })
    ).toBe(true);

    const insertedRow = nextState.doc.firstChild.lastChild;
    const insertedCell = insertedRow.firstChild;
    expect(insertedRow.attrs.rowHeight).toBe('41px');
    expect(insertedCell.attrs.backgroundColor).toBe('#abdbe3');
    expect(insertedCell.attrs.fontName).toBe('Georgia');
    expect(insertedCell.attrs.paddingTop).toBe('6px');
    expect(insertedCell.firstChild.attrs.align).toBe('center');
    expect(insertedCell.firstChild.attrs.pendingMarks[0].type).toBe('strong');
  });
});
