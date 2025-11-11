import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import { TableCellEx } from './tableCellEx';

describe('TableCellEx Extension', () => {
    let editor: Editor;

    beforeEach(() => {
        editor = new Editor({
            extensions: [StarterKit, Table, TableRow, TableHeader, TableCellEx],
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

    test('should have borderColor attribute', () => {
        const schema = editor.schema;
        const tableCellNode = schema.nodes.tableCell;

        expect(tableCellNode.spec.attrs).toHaveProperty('borderColor');
        expect(tableCellNode.spec.attrs?.borderColor.default).toBeNull();
    });

    test('should render backgroundColor style correctly when provided', () => {
        editor.commands.setContent('<table><tr><td style="background-color: red">Cell</td></tr></table>');
        const html = editor.getHTML();

        expect(html).toContain('background-color: red');
    });

    test('should render borderColor style correctly when provided', () => {
        editor.commands.setContent('<table><tr><td style="border-color: green">Cell</td></tr></table>');
        const html = editor.getHTML();

        expect(html).toContain('border-color: green');
    });

    test('should parse backgroundColor from HTML element', () => {
        const htmlWithBgColor = '<table><tr><td style="background-color: blue">Cell</td></tr></table>';
        editor.commands.setContent(htmlWithBgColor);
        
        const { state } = editor;
        let foundBackgroundColor = false;

        state.doc.descendants((node) => {
            if (node.type.name === 'tableCell' && node.attrs.backgroundColor === 'blue') {
                foundBackgroundColor = true;
            }
        });

        expect(foundBackgroundColor).toBe(true);
    });

    test('should parse borderColor from HTML element', () => {
        const htmlWithBorderColor = '<table><tr><td style="border-color: black">Cell</td></tr></table>';
        editor.commands.setContent(htmlWithBorderColor);
        
        const { state } = editor;
        let foundBorderColor = false;

        state.doc.descendants((node) => {
            if (node.type.name === 'tableCell' && node.attrs.borderColor === 'black') {
                foundBorderColor = true;
            }
        });

        expect(foundBorderColor).toBe(true);
    });

    test('should handle backgroundColor with quotes', () => {
        const htmlWithQuotes = '<table><tr><td style="background-color: \'red\'">Cell</td></tr></table>';
        editor.commands.setContent(htmlWithQuotes);
        
        const { state } = editor;
        let backgroundColor = '';

        state.doc.descendants((node) => {
            if (node.type.name === 'tableCell') {
                backgroundColor = node.attrs.backgroundColor;
            }
        });

        expect(backgroundColor).not.toContain('"');
        expect(backgroundColor).not.toContain("'");
    });

    test('should handle borderColor with quotes', () => {
        const htmlWithQuotes = '<table><tr><td style="border-color: \'green\'">Cell</td></tr></table>';
        editor.commands.setContent(htmlWithQuotes);
        
        const { state } = editor;
        let borderColor = '';

        state.doc.descendants((node) => {
            if (node.type.name === 'tableCell') {
                borderColor = node.attrs.borderColor;
            }
        });

        expect(borderColor).not.toContain('"');
        expect(borderColor).not.toContain("'");
    });
});