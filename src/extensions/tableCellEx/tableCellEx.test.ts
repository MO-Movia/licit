/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Editor} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRowEx from '../tableRowEx';
import TableHeader from '@tiptap/extension-table-header';
import {TableCellEx} from './tableCellEx';

describe('TableCellEx Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [StarterKit, Table, TableRowEx, TableHeader, TableCellEx],
      content: '<table><tr><td>Cell</td></tr></table>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  test('should have backgroundColor attribute', () => {
    const schema = editor.schema;
    const tableCellNode = schema.nodes.tableCell;

    expect(tableCellNode.spec.attrs).toHaveProperty('backgroundColor');
    expect(tableCellNode.spec.attrs?.backgroundColor.default).toBeNull();
  });

  test('should have borderColor & border side attributes', () => {
    const schema = editor.schema;
    const node = schema.nodes.tableCell;

    expect(node.spec.attrs).toHaveProperty('borderColor');
    expect(node.spec.attrs).toHaveProperty('borderLeft');
    expect(node.spec.attrs).toHaveProperty('borderRight');
    expect(node.spec.attrs).toHaveProperty('borderTop');
    expect(node.spec.attrs).toHaveProperty('borderBottom');
  });

  test('should have cell layout and typography attributes', () => {
    const schema = editor.schema;
    const node = schema.nodes.tableCell;

    expect(node.spec.attrs).toHaveProperty('cellWidth');
    expect(node.spec.attrs).toHaveProperty('cellStyle');
    expect(node.spec.attrs).toHaveProperty('fontSize');
    expect(node.spec.attrs).toHaveProperty('letterSpacing');
    expect(node.spec.attrs).toHaveProperty('marginTop');
    expect(node.spec.attrs).toHaveProperty('MarginBottom');
    expect(node.spec.attrs?.cellWidth.default).toBe('25px');
    expect(node.spec.attrs?.cellStyle.default).toBe('');
    expect(node.spec.attrs?.fontSize.default).toBe('16px');
    expect(node.spec.attrs?.letterSpacing.default).toBe('0px');
    expect(node.spec.attrs?.marginTop.default).toBe('0px');
    expect(node.spec.attrs?.MarginBottom.default).toBe('0px');
  });

  test('should render backgroundColor as string when vignette is true', () => {
    editor.commands.setContent('<table><tr><td>Cell</td></tr></table>');

    editor
      .chain()
      .setCellAttribute('backgroundColor', 'red')
      .setCellAttribute('vignette', true)
      .run();

    const html = editor.getHTML();

    expect(html).toContain('background-color: red');
    expect(html).toContain('width: 25px');
    expect(html).toContain('font-size: 16px');
    expect(html).toContain('letter-spacing: 0px');
    expect(html).toContain('margin-top: 0px');
    expect(html).toContain('margin-bottom: 0px');
  });

  test('should parse cellWidth, font and margin attributes from HTML', () => {
    editor.commands.setContent(
      '<table><tr><td style="width: 140px; font-size: 18px; letter-spacing: 1.5px; margin-top: 6px; margin-bottom: 9px;">Cell</td></tr></table>'
    );

    let cellAttrs = null;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'tableCell') {
        cellAttrs = node.attrs;
      }
    });

    expect(cellAttrs?.cellWidth).toBe('140px');
    expect(cellAttrs?.fontSize).toBe('18px');
    expect(cellAttrs?.letterSpacing).toBe('1.5px');
    expect(cellAttrs?.marginTop).toBe('6px');
    expect(cellAttrs?.MarginBottom).toBe('9px');
  });

  test('should render cellStyle inline CSS when provided', () => {
    editor
      .chain()
      .setCellAttribute('cellStyle', 'line-height: 20px; text-align: center;')
      .run();

    const html = editor.getHTML();
    expect(html).toContain('line-height: 20px');
    expect(html).toContain('text-align: center');
  });

  test('should render nested color value when vignette is false', () => {
    // Add backgroundColor as object
    editor.state.doc.descendants((node, _pos) => {
      if (node.type.name === 'tableCell') {
        editor
          .chain()
          .setCellAttribute('backgroundColor', {color: 'blue'})
          .setCellAttribute('vignette', false)
          .run();
      }
    });

    const html = editor.getHTML();
    expect(html).toContain('background-color: blue');
  });

  test('should not render backgroundColor when not provided', () => {
    const html = editor.getHTML();
    expect(html).not.toContain('background-color');
  });

  test('should parse backgroundColor from HTML element', () => {
    const htmlWithBgColor =
      '<table><tr><td style="background-color: blue">Cell</td></tr></table>';
    editor.commands.setContent(htmlWithBgColor);

    let found = false;
    editor.state.doc.descendants((node) => {
      if (
        node.type.name === 'tableCell' &&
        node.attrs.backgroundColor === 'blue'
      ) {
        found = true;
      }
    });

    expect(found).toBe(true);
  });

  test('should handle backgroundColor with quotes', () => {
    editor.commands.setContent(
      '<table><tr><td style="background-color: \'red\'">Cell</td></tr></table>'
    );

    let backgroundColor = '';
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'tableCell') {
        backgroundColor = node.attrs.backgroundColor;
      }
    });

    expect(backgroundColor).toBe('');
  });

  test('should render borderLeft style', () => {
    editor.commands.setContent(
      '<table><tr><td style="border-left: 2px solid red">Cell</td></tr></table>'
    );
    const html = editor.getHTML();
    expect(html).toContain('border-left: 2px solid red');
  });

  test('should render borderRight style', () => {
    editor.commands.setContent(
      '<table><tr><td style="border-right: 3px dashed blue">Cell</td></tr></table>'
    );
    const html = editor.getHTML();
    expect(html).toContain('border-right: 3px dashed blue');
  });

  test('should render borderTop style', () => {
    editor.commands.setContent(
      '<table><tr><td style="border-top: 1px dotted green">Cell</td></tr></table>'
    );
    const html = editor.getHTML();
    expect(html).toContain('border-top: 1px dotted green');
  });

  test('should render borderBottom style', () => {
    editor.commands.setContent(
      '<table><tr><td style="border-bottom: 4px double #000">Cell</td></tr></table>'
    );
    const html = editor.getHTML();
    expect(html).toContain('border-bottom: 4px double rgb(0, 0, 0)');
  });

  test('should parse border side values correctly', () => {
    editor.commands.setContent(
      '<table><tr><td style="border-left: 2px solid red; border-right: 3px dashed blue">Cell</td></tr></table>'
    );

    let left, right;

    editor.state.doc.descendants((node) => {
      if (node.type.name === 'tableCell') {
        left = node.attrs.borderLeft;
        right = node.attrs.borderRight;
      }
    });

    expect(left).toBe('2px solid red');
    expect(right).toBe('3px dashed blue');
  });

  test('should render borderColor style correctly', () => {
    editor.commands.setContent(
      '<table><tr><td style="border-color: green">Cell</td></tr></table>'
    );
    const html = editor.getHTML();
    expect(html).toContain('border-color: green');
  });
});
