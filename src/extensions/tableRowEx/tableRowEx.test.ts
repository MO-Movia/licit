/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Editor} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import {TableRowEx} from './tableRowEx';

describe('TableRowEx Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [StarterKit, Table, TableRowEx, TableHeader, TableCell],
      content: '<table><tr><td>Cell</td></tr></table>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  test('should expose rowHeight and rowWidth attributes', () => {
    const schema = editor.schema;
    const rowNode = schema.nodes.tableRow;

    expect(rowNode.spec.attrs).toHaveProperty('rowHeight');
    expect(rowNode.spec.attrs).toHaveProperty('rowWidth');
    expect(rowNode.spec.attrs?.rowHeight.default).toBe('auto');
    expect(rowNode.spec.attrs?.rowWidth.default).toBe('auto');
  });

  test('should parse rowHeight and rowWidth from HTML', () => {
    editor.commands.setContent(
      '<table><tr rowheight="40px" rowwidth="320px"><td>Cell</td></tr></table>'
    );

    let parsedRowAttrs = null;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'tableRow') {
        parsedRowAttrs = node.attrs;
      }
    });

    expect(parsedRowAttrs?.rowHeight).toBe('40px');
    expect(parsedRowAttrs?.rowWidth).toBe('320px');
  });

  test('should render rowHeight and rowWidth styles', () => {
    editor.commands.setContent(
      '<table><tr rowheight="45px" rowwidth="280px"><td>Cell</td></tr></table>'
    );

    const html = editor.getHTML();
    expect(html).toContain('height: 45px');
    expect(html).toContain('width: 280px');
  });
});

