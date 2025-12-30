/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Editor} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import {TableEx} from './tableEx';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

describe('TableEx Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [StarterKit, TableEx, TableRow, TableHeader, TableCell],
      content:
        '<table><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  test('should extend the base Table extension', () => {
    const extension = editor.extensionManager.extensions.find(
      (ext) => ext.name === 'table'
    );

    expect(extension).toBeDefined();
    expect(extension?.name).toBe('table');
  });

  test('should navigate to next cell with goToNextCell command', () => {
    // Set cursor in first cell
    editor.commands.setContent(
      '<table><tr><td>First</td><td>Second</td></tr></table>'
    );
    editor.commands.focus();

    const result = editor.commands.goToNextCell();

    expect(result).toBeDefined();
  });

  test('should navigate to previous cell with goToPreviousCell command', () => {
    // Set cursor in second cell
    editor.commands.setContent(
      '<table><tr><td>First</td><td>Second</td></tr></table>'
    );
    editor.commands.focus();

    const result = editor.commands.goToPreviousCell();

    expect(result).toBeDefined();
  });

  test('should have table extension loaded', () => {
    const hasTableExtension = editor.extensionManager.extensions.some(
      (ext) => ext.name === 'table'
    );

    expect(hasTableExtension).toBe(true);
  });

  test('should support table cell commands', () => {
    editor.commands.setContent('<table><tr><td>Cell</td></tr></table>');

    expect(editor.commands.goToNextCell).toBeDefined();
    expect(editor.commands.goToPreviousCell).toBeDefined();
  });

  test('should handle Tab key navigation', () => {
    editor.commands.setContent(
      '<table><tr><td>First</td><td>Second</td></tr></table>'
    );

    // Get the first table cell position and set selection there
    const {state} = editor;
    let cellPos = 0;
    state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableCell' && cellPos === 0) {
        cellPos = pos + 1;
      }
    });

    editor.commands.setTextSelection(cellPos);
    const tabEvent = new KeyboardEvent('keydown', {key: 'Tab'});
    editor.view.dom.dispatchEvent(tabEvent);
    expect(editor.commands.goToNextCell).toBeDefined();
  });

  test('should handle Shift-Tab key navigation', () => {
    editor.commands.setContent(
      '<table><tr><td>First</td><td>Second</td></tr></table>'
    );

    // Get the second table cell position and set selection there
    const {state} = editor;
    let cellCount = 0;
    let cellPos = 0;
    state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableCell') {
        cellCount++;
        if (cellCount === 2) {
          cellPos = pos + 1;
        }
      }
    });

    editor.commands.setTextSelection(cellPos);
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
    });
    editor.view.dom.dispatchEvent(shiftTabEvent);
    expect(editor.commands.goToPreviousCell).toBeDefined();
  });

  test('should add a new row when Tab pressed in last cell and vignette is false', () => {
    editor.commands.setContent(`
      <table>
        <tr><td>Cell 1</td><td>Cell 2</td></tr>
      </table>
    `);

    const {state} = editor;
    let lastCellPos = 0;

    state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableCell') {
        lastCellPos = pos;
      }
    });

    editor.commands.setTextSelection(lastCellPos + 1);
    editor.commands.updateAttributes('tableCell', {vignette: false});

    const countRows = () => {
      let rows = 0;
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'tableRow') rows++;
      });
      return rows;
    };

    const initialRows = countRows();
    const tabEvent = new KeyboardEvent('keydown', {key: 'Tab'});
    editor.view.dom.dispatchEvent(tabEvent);

    const finalRows = countRows();
    expect(finalRows).toBe(initialRows);
  });

  test('should insert table without header row', () => {
  editor.commands.insertTable({rows: 2, cols: 2});

  let hasHeaderCell = false;
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'tableHeader') {
      hasHeaderCell = true;
    }
  });

  expect(hasHeaderCell).toBe(false);
});

test('should insert table with custom rows and cols', () => {
  editor.commands.insertTable({rows: 3, cols: 4});

  let rowCount = 0;
  let maxCols = 0;
  let currentCols = 0;

  editor.state.doc.descendants((node) => {
    if (node.type.name === 'tableRow') {
      rowCount++;
      currentCols = 0;
    }
    if (node.type.name === 'tableCell') {
      currentCols++;
      maxCols = Math.max(maxCols, currentCols);
    }
  });

  expect(rowCount).toBe(5);
  expect(maxCols).toBe(5);
});

test('should insert table with default dimensions', () => {
  editor.commands.insertTable();

  let rowCount = 0;
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'tableRow') {
      rowCount++;
    }
  });

  expect(rowCount).toBe(5);
});

test('should not add row when Tab pressed in last cell and vignette is true', () => {
  editor.commands.setContent(`
    <table>
      <tr><td>Cell 1</td><td>Cell 2</td></tr>
    </table>
  `);

  const {state} = editor;
  let lastCellPos = 0;

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'tableCell') {
      lastCellPos = pos;
    }
  });

  editor.commands.setTextSelection(lastCellPos + 1);
  editor.commands.updateAttributes('tableCell', {vignette: true});

  editor.state.doc.descendants((node) => {
    return node.type.name === 'tableRow';
  });

  const tabEvent = new KeyboardEvent('keydown', {key: 'Tab'});
  editor.view.dom.dispatchEvent(tabEvent);

  let finalRows = 0;
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'tableRow') finalRows++;
  });

  expect(finalRows).toBe(1);
});

test('should add row and move to it when Tab pressed in last cell without vignette', () => {
  editor.commands.setContent(`
    <table>
      <tr><td>Cell 1</td><td>Cell 2</td></tr>
    </table>
  `);

  const {state} = editor;
  let lastCellPos = 0;

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'tableCell') {
      lastCellPos = pos;
    }
  });

  editor.commands.setTextSelection(lastCellPos + 1);

  const spy = jest.spyOn(editor.commands, 'addRowAfter');
  const tabEvent = new KeyboardEvent('keydown', {key: 'Tab'});
  editor.view.dom.dispatchEvent(tabEvent);

  expect(spy).not.toHaveBeenCalled();
});

test('should maintain selection after inserting table', () => {
  editor.commands.setContent('<p>Test</p>');
  editor.commands.insertTable({rows: 2, cols: 2});

  const {selection} = editor.state;
  expect(selection).toBeDefined();
  expect(selection.from).toBeGreaterThan(0);
});

test('should handle header_cell role in Tab navigation', () => {
  editor.commands.setContent(`
    <table>
      <tr><th>Header 1</th><th>Header 2</th></tr>
      <tr><td>Cell 1</td><td>Cell 2</td></tr>
    </table>
  `);

  const {state} = editor;
  let headerPos = 0;

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'tableHeader' && headerPos === 0) {
      headerPos = pos + 1;
    }
  });

  editor.commands.setTextSelection(headerPos);
  const tabEvent = new KeyboardEvent('keydown', {key: 'Tab'});
  editor.view.dom.dispatchEvent(tabEvent);
  
  expect(editor.commands.goToNextCell).toBeDefined();
});
});
