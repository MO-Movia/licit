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

  test('should have rowHeight and rowWidth attributes', () => {
    const schema = editor.schema;
    const tableRowNode = schema.nodes.tableRow;

    expect(tableRowNode.spec.attrs).toHaveProperty('rowHeight');
    expect(tableRowNode.spec.attrs).toHaveProperty('rowWidth');
  });

  test('should render rowHeight and rowWidth styles from html', () => {
    editor.commands.setContent(
      '<table><tr style="height: 40px; width: 240px;"><td>Cell</td></tr></table>'
    );

    const html = editor.getHTML();
    expect(html).toContain('height: 40px');
    expect(html).toContain('width: 240px');
  });
});

