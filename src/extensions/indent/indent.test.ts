import { CanCommands, ChainedCommands, Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Indent } from './indent';
import { Transaction } from 'prosemirror-state';
import { EditorViewEx } from '@src/constants';

describe('Indent Extension', () => {
    let editor;

    beforeEach(() => {
        editor = new Editor({
            extensions: [StarterKit, Indent],
            content: '<p>Hello World</p>',
        });
    });

    afterEach(() => {
        editor.destroy();
    });

    test('should increase indent level on indent command', () => {
        editor.commands.focus();
        const initialIndent = editor.getAttributes('paragraph').indent || 0;
        editor.commands.indent();
        const newIndent = editor.getAttributes('paragraph').indent;
        expect(newIndent).toBeGreaterThan(initialIndent);
    });

    test('should decrease indent level on outdent command', () => {
        editor.commands.focus();
        editor.commands.indent(); // First, indent once
        const indentedLevel = editor.getAttributes('paragraph').indent;
        editor.commands.outdent();
        const outdentedLevel = editor.getAttributes('paragraph').indent;
        expect(outdentedLevel).toBeLessThan(indentedLevel);
    });

    test('should not decrease indent below minimum', () => {
        editor.commands.focus();
        const initialIndent = editor.getAttributes('paragraph').indent || 0;
        editor.commands.outdent();
        const newIndent = editor.getAttributes('paragraph').indent;
        expect(newIndent).toBe(initialIndent);
    });

    test('should not exceed maximum indent level', () => {
        editor.commands.focus();
        const maxIndent = editor.extensionManager.extensions.find(
            (ext) => ext.name === 'indent'
        ).options.maxIndentLevel;
        for (let i = 0; i < 20; i++) {
            editor.commands.indent();
        }
        const finalIndent = editor.getAttributes('paragraph').indent;
        expect(finalIndent).toBeLessThanOrEqual(maxIndent);
    });
});


describe('Indent extension commands', () => {
    let editor: Editor;

    beforeEach(() => {
        editor = new Editor({
            extensions: [StarterKit, Indent],
            content: '<p>Hello World</p>',
        });
    });

    afterEach(() => {
        editor.destroy();
    });

    test('indent command should return same transaction if doc is empty', () => {
        const dispatchMock = jest.fn();
        const command = editor.extensionManager.commands.indent;
        const mockSelection = jest.fn().mockReturnValue({ test: 'test' });
        const mockTransaction = {
            selection: null,
            doc: {},
            setSelection: mockSelection,
            setNodeMarkup: jest.fn(),
            docChanged: false,
        } as unknown as Transaction;
        const reult = command()({
            tr: mockTransaction, state: editor.state, dispatch: dispatchMock, editor,
            commands: undefined,
            can: function (): CanCommands {
                throw new Error('Function not implemented.');
            },
            chain: function (): ChainedCommands {
                throw new Error('Function not implemented.');
            },
            view: {} as EditorViewEx
        });

        expect(reult).toBe(false);
    });

    test('indent command should return same transaction if selection is not instance of TextSelection', () => {
        const dispatchMock = jest.fn();
        const command = editor.extensionManager.commands.indent;
        const mockSelection = jest.fn().mockReturnValue({ selection: { test: '' }, doc: { test: "'" } });
        const mockTransaction = {
            selection: { test: '' },
            doc: { test: "'" },
            setSelection: mockSelection,
            setNodeMarkup: jest.fn(),
            docChanged: false,
        } as unknown as Transaction;
        const reult = command()({
            tr: mockTransaction, state: editor.state, dispatch: dispatchMock, editor,
            commands: undefined,
            can: function (): CanCommands {
                throw new Error('Function not implemented.');
            },
            chain: function (): ChainedCommands {
                throw new Error('Function not implemented.');
            },
            view: {} as EditorViewEx
        });

        expect(reult).toBe(false);
    });
});

describe('Indent Extension - Keyboard Shortcuts', () => {
    let editor: any;
    let shortcuts;

    beforeEach(() => {
        editor = new Editor({
            extensions: [StarterKit, Indent],
            content: '<p>Hello World</p>',
        });

        shortcuts = editor.extensionManager.extensions.find(
            (ext) => ext.name === 'indent'
        ).config.addKeyboardShortcuts();
    });

    afterEach(() => {
        editor.destroy();
    });

    test.each([
        ['Mod-[', 'outdent', false],
    ])('should call %s shortcut to execute %s command', (key, command, outdentOnlyAtHead) => {

        // Ensure function exists
        expect(shortcuts[key]).toBeDefined();

        // Execute shortcut
        const result = shortcuts[key]({ editor });

        if (command === 'indent') {
            if (key === 'Tab') {
                expect(result).toBe(true);
            }
            if (key === 'Mod-]') {
                expect(result).toBe(true);
            }
        } else {
            if (key === 'Shift-Tab') {
                expect(result).toBe(false);
            }
            if (key === 'Mod-[') {
                expect(result).toBe(false);
            }
            if (key === 'Backspace') {
                expect(result).toBe(false);
            }
        }


    });
    test.each([
        ['Mod-]', 'indent', true]
    ])('should call %s shortcut to execute %s command', (key, command, outdentOnlyAtHead) => {

        // Ensure function exists
        expect(shortcuts[key]).toBeDefined();

        // Execute shortcut
        const result = shortcuts[key]({ editor });

        if (command === 'indent') {
            if (key === 'Tab') {
                expect(result).toBe(true);
            }
            if (key === 'Mod-]') {
                expect(result).toBe(true);
            }
        } else {
            if (key === 'Shift-Tab') {
                expect(result).toBe(false);
            }
            if (key === 'Mod-[') {
                expect(result).toBe(false);
            }
            if (key === 'Backspace') {
                expect(result).toBe(false);
            }
        }


    });
    test.each([
        ['Tab', 'indent', false]
    ])('should call %s shortcut to execute %s command', (key, command, outdentOnlyAtHead) => {

        // Ensure function exists
        expect(shortcuts[key]).toBeDefined();

        // Execute shortcut
        const result = shortcuts[key]({ editor });

        if (command === 'indent') {
            if (key === 'Tab') {
                expect(result).toBe(true);
            }
            if (key === 'Mod-]') {
                expect(result).toBe(true);
            }
        } else {
            if (key === 'Shift-Tab') {
                expect(result).toBe(false);
            }
            if (key === 'Mod-[') {
                expect(result).toBe(false);
            }
            if (key === 'Backspace') {
                expect(result).toBe(false);
            }
        }


    });
    test.each([
        ['Shift-Tab', 'outdent', false]
    ])('should call %s shortcut to execute %s command', (key, command, outdentOnlyAtHead) => {

        // Ensure function exists
        expect(shortcuts[key]).toBeDefined();

        // Execute shortcut
        const result = shortcuts[key]({ editor });

        if (command === 'indent') {
            if (key === 'Tab') {
                expect(result).toBe(true);
            }
            if (key === 'Mod-]') {
                expect(result).toBe(true);
            }
        } else {
            if (key === 'Shift-Tab') {
                expect(result).toBe(false);
            }
            if (key === 'Mod-[') {
                expect(result).toBe(false);
            }
            if (key === 'Backspace') {
                expect(result).toBe(false);
            }
        }


    });
    test.each([
        ['Backspace', 'outdent', true]
    ])('should call %s shortcut to execute %s command', (key, command, outdentOnlyAtHead) => {

        // Ensure function exists
        expect(shortcuts[key]).toBeDefined();

        // Execute shortcut
        const result = shortcuts[key]({ editor });

        if (command === 'indent') {
            if (key === 'Tab') {
                expect(result).toBe(true);
            }
            if (key === 'Mod-]') {
                expect(result).toBe(true);
            }
        } else {
            if (key === 'Shift-Tab') {
                expect(result).toBe(false);
            }
            if (key === 'Mod-[') {
                expect(result).toBe(false);
            }
            if (key === 'Backspace') {
                expect(result).toBe(false);
            }
        }


    });
});








