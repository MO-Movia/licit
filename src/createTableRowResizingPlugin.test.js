import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import createTableRowResizingPlugin from './createTableRowResizingPlugin.js';
import EditorSchema from './EditorSchema.js';

describe('table row resizing', () => {
  it('commits rowHeight without adding table cells', () => {
    const paragraph = EditorSchema.nodes.paragraph.create(
      null,
      EditorSchema.text('x')
    );
    const cell = EditorSchema.nodes.table_cell.create(null, paragraph);
    const row = EditorSchema.nodes.table_row.create(null, [cell, cell]);
    const table = EditorSchema.nodes.table.create({ noOfColumns: 2 }, row);
    const state = EditorState.create({
      schema: EditorSchema,
      doc: EditorSchema.nodes.doc.create(null, table),
      plugins: [createTableRowResizingPlugin()],
    });
    const host = document.createElement('div');
    document.body.appendChild(host);
    const view = new EditorView(host, {
      state,
      dispatchTransaction(tr) {
        view.updateState(view.state.apply(tr));
      },
    });
    const rowDOM = view.dom.querySelector('tr');
    const cellDOM = view.dom.querySelector('td');
    rowDOM.getBoundingClientRect = () => ({
      bottom: 100,
      height: 40,
      left: 10,
      right: 210,
      top: 60,
      width: 200,
      x: 10,
      y: 60,
    });
    cellDOM.getBoundingClientRect = () => ({
      bottom: 100,
      height: 40,
      left: 10,
      right: 110,
      top: 60,
      width: 100,
      x: 10,
      y: 60,
    });

    cellDOM.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX: 50, clientY: 99 })
    );
    const handle = document.querySelector('.czi-table-row-resize-handle');
    expect(handle.style.visibility).toBe('visible');
    expect(handle.parentElement).toBe(view.dom.parentElement);

    cellDOM.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 50,
        clientY: 99,
      })
    );
    window.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 50, clientY: 119 })
    );
    window.dispatchEvent(
      new MouseEvent('mouseup', { clientX: 50, clientY: 119 })
    );

    const updatedRow = view.state.doc.firstChild.firstChild;
    expect(updatedRow.attrs.rowHeight).toBe('60px');
    expect(updatedRow.childCount).toBe(2);

    view.destroy();
    host.remove();
  });
});
