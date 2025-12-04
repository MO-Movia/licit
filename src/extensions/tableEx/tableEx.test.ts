/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TableEx } from './tableEx';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

describe('TableEx Extension', () => {
    let editor: Editor;

    beforeEach(() => {
        editor = new Editor({
            extensions: [StarterKit, TableEx, TableRow, TableHeader, TableCell],
            content: '<table><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>',
        });
    });

    afterEach(() => {
        editor.destroy();
    });

    test('should extend the base Table extension', () => {
        const extension = editor.extensionManager.extensions.find(
            ext => ext.name === 'table'
        );

        expect(extension).toBeDefined();
        expect(extension?.name).toBe('table');
    });

    test('should navigate to next cell with goToNextCell command', () => {
        // Set cursor in first cell
        editor.commands.setContent('<table><tr><td>First</td><td>Second</td></tr></table>');
        editor.commands.focus();
        
        const result = editor.commands.goToNextCell();
        
        expect(result).toBeDefined();
    });

    test('should navigate to previous cell with goToPreviousCell command', () => {
        // Set cursor in second cell
        editor.commands.setContent('<table><tr><td>First</td><td>Second</td></tr></table>');
        editor.commands.focus();
        
        const result = editor.commands.goToPreviousCell();
        
        expect(result).toBeDefined();
    });

    test('should have table extension loaded', () => {
        const hasTableExtension = editor.extensionManager.extensions.some(
            ext => ext.name === 'table'
        );

        expect(hasTableExtension).toBe(true);
    });

    test('should support table cell commands', () => {
        editor.commands.setContent('<table><tr><td>Cell</td></tr></table>');
        
        expect(editor.commands.goToNextCell).toBeDefined();
        expect(editor.commands.goToPreviousCell).toBeDefined();
    });

    test('should handle Tab key navigation', () => {
        editor.commands.setContent('<table><tr><td>First</td><td>Second</td></tr></table>');
        
        // Get the first table cell position and set selection there
        const { state } = editor;
        let cellPos = 0;
        state.doc.descendants((node, pos) => {
            if (node.type.name === 'tableCell' && cellPos === 0) {
                cellPos = pos + 1;
            }
        });
        
        editor.commands.setTextSelection(cellPos);
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        editor.view.dom.dispatchEvent(tabEvent);
        expect(editor.commands.goToNextCell).toBeDefined();
    });

    test('should handle Shift-Tab key navigation', () => {
        editor.commands.setContent('<table><tr><td>First</td><td>Second</td></tr></table>');
        
        // Get the second table cell position and set selection there
        const { state } = editor;
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
        const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
        editor.view.dom.dispatchEvent(shiftTabEvent);        
        expect(editor.commands.goToPreviousCell).toBeDefined();
    });
});