import { DOMParser as PMDOMParser, DOMSerializer } from 'prosemirror-model';
import EditorSchema from './EditorSchema.js';

describe('TableNodesSpecs custom attrs', () => {
  it('parses table, row, and cell custom attributes from DOM', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <table data-no-of-columns="3" style="height: 240px; margin-left: 12px;">
        <tbody>
          <tr style="height: 44px;">
            <td
              data-cell-style="text-align: center"
              style="width: 96px; font-size: 14px; letter-spacing: 1px; margin-top: 2px; margin-bottom: 3px;"
            >
              <p>Cell</p>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const doc = PMDOMParser.fromSchema(EditorSchema).parse(root);
    const tableNode = doc.firstChild;
    const rowNode = tableNode.firstChild;
    const cellNode = rowNode.firstChild;

    expect(tableNode.attrs.noOfColumns).toBe(3);
    expect(tableNode.attrs.tableheight).toBe('240px');
    expect(rowNode.attrs.rowHeight).toBe('44px');
    expect(cellNode.attrs.cellWidth).toBe('96px');
    expect(cellNode.attrs.cellStyle).toBe('text-align: center');
    expect(cellNode.attrs.fontSize).toBe('14px');
    expect(cellNode.attrs.letterSpacing).toBe('1px');
    expect(cellNode.attrs.marginTop).toBe('2px');
    expect(cellNode.attrs.marginBottom).toBe('3px');
  });

  it('serializes table, row, and cell custom attributes to DOM', () => {
    const paragraph = EditorSchema.nodes.paragraph.create(
      null,
      EditorSchema.text('x')
    );
    const cellNode = EditorSchema.nodes.table_cell.create(
      {
        cellWidth: 110,
        cellStyle: 'text-align: center',
        fontSize: 13,
        letterSpacing: '0.8px',
        marginTop: 4,
        marginBottom: '5px',
      },
      paragraph
    );
    const rowNode = EditorSchema.nodes.table_row.create(
      { rowHeight: 52 },
      cellNode
    );
    const tableNode = EditorSchema.nodes.table.create(
      { noOfColumns: 1, tableheight: 300, marginLeft: 20 },
      rowNode
    );

    const tableEl = DOMSerializer.fromSchema(EditorSchema).serializeNode(
      tableNode
    );
    const rowEl = tableEl.querySelector('tr');
    const cellEl = tableEl.querySelector('td');

    expect(tableEl.getAttribute('data-no-of-columns')).toBe('1');
    expect(tableEl.style.height).toBe('300px');
    expect(rowEl.style.height).toBe('52px');
    expect(cellEl.style.width).toBe('110px');
    expect(cellEl.style.fontSize).toBe('13px');
    expect(cellEl.style.letterSpacing).toBe('0.8px');
    expect(cellEl.style.marginTop).toBe('4px');
    expect(cellEl.style.marginBottom).toBe('5px');
    expect(cellEl.getAttribute('data-cell-style')).toBe('text-align: center');
    expect(cellEl.getAttribute('style')).toContain('text-align: center');
  });
});
