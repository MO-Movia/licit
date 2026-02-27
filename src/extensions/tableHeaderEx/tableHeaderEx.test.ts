/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Editor} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRowEx from '../tableRowEx';
import TableCellEx from '../tableCellEx';
import {TableHeaderEx} from './tableHeaderEx';

describe('TableHeaderEx Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [StarterKit, Table, TableRowEx, TableHeaderEx, TableCellEx],
      content: '<table><tr><th>Header</th></tr></table>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  test('should expose layout and typography attributes on tableHeader', () => {
    const schema = editor.schema;
    const headerNode = schema.nodes.tableHeader;

    expect(headerNode.spec.attrs).toHaveProperty('cellWidth');
    expect(headerNode.spec.attrs).toHaveProperty('cellStyle');
    expect(headerNode.spec.attrs).toHaveProperty('fontSize');
    expect(headerNode.spec.attrs).toHaveProperty('letterSpacing');
    expect(headerNode.spec.attrs).toHaveProperty('marginTop');
    expect(headerNode.spec.attrs).toHaveProperty('MarginBottom');
  });

  test('should parse custom style attrs from table header HTML', () => {
    editor.commands.setContent(
      '<table><tr><th style="width: 180px; font-size: 20px; letter-spacing: 2px; margin-top: 7px; margin-bottom: 11px;">Header</th></tr></table>'
    );

    let headerAttrs = null;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'tableHeader') {
        headerAttrs = node.attrs;
      }
    });

    expect(headerAttrs?.cellWidth).toBe('180px');
    expect(headerAttrs?.fontSize).toBe('20px');
    expect(headerAttrs?.letterSpacing).toBe('2px');
    expect(headerAttrs?.marginTop).toBe('7px');
    expect(headerAttrs?.MarginBottom).toBe('11px');
  });

  test('should render table header styles and cellStyle', () => {
    let headerPos = 0;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableHeader') {
        headerPos = pos + 1;
      }
    });

    editor.commands.setTextSelection(headerPos);
    editor
      .chain()
      .setCellAttribute('cellStyle', 'line-height: 22px; text-transform: uppercase;')
      .setCellAttribute('fontSize', '19px')
      .run();

    const html = editor.getHTML();
    expect(html).toContain('line-height: 22px');
    expect(html).toContain('text-transform: uppercase');
    expect(html).toContain('font-size: 19px');
  });
});

