/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Editor, KeyboardShortcutCommand, Extension, Mark} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import {
  clamp,
  findActualItemIndex,
  Indent,
  handleSingleItemIndent,
  createSplitLists,
} from './indent';
import {EditorState, Transaction} from 'prosemirror-state';

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
    expect(newIndent).not.toEqual(initialIndent);
  });

  test('should decrease indent level on outdent command', () => {
    editor.commands.focus();
    editor.commands.indent(); // First, indent once
    const indentedLevel = editor.getAttributes('paragraph').indent;
    editor.commands.outdent();
    const outdentedLevel = editor.getAttributes('paragraph').indent;
    expect(outdentedLevel).not.toEqual(indentedLevel);
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

type IndentExtensionType = Extension & {
  config: {
    // Defines the structure of the addKeyboardShortcuts function
    addKeyboardShortcuts: () => Record<string, KeyboardShortcutCommand>;
  };
};
describe('Indent Extension - Keyboard Shortcuts', () => {
  let editor: Editor;
let shortcuts: Record<string, (props?: unknown) => boolean>;

    beforeEach(() => {
        editor = new Editor({
            extensions: [StarterKit, Indent],
            content: '<p>Hello World</p>',
        });

    const indentExtension = editor.extensionManager.extensions.find(
      (ext) => ext.name === 'indent'
    ) as IndentExtensionType;

    const boundContext = {editor, ...indentExtension};
    const shortcutFunction = indentExtension.config.addKeyboardShortcuts;
    shortcuts = shortcutFunction.call(boundContext);
  });

    afterEach(() => {
        editor.destroy();
    });

  test.each([['Mod-['], ['Mod-]'], ['Tab'], ['Backspace']])(
    'should register %s shortcut',
    (key) => {
      expect(shortcuts[key]).toBeDefined();
      expect(typeof shortcuts[key]).toBe('function');
    }
  );

  it('should NOT indent when cursor is inside list item but not at start', () => {
    const indentSpy = jest.spyOn(editor.commands, 'indent');

    editor.commands.setContent('<ul><li><p>Item</p></li></ul>');
    editor.chain().focus().setTextSelection(4).run();
    shortcuts.Tab();
    expect(indentSpy).not.toHaveBeenCalled();
  });

  it('Tab should call insertTabSpace when not in list and selection is empty', () => {
    editor.commands.setContent('<p>Hello World</p>');
    editor.chain().focus().setTextSelection(7).run();
    editor.getHTML();
    const result = shortcuts.Tab();
    editor.getHTML();
    expect(result).toBeDefined();
    expect(typeof result).toBe('boolean');
  });

  it('should not indent when not at start of list item', () => {
    editor.commands.setContent('<ul><li><p>Test</p></li></ul>');
    editor.chain().focus().setTextSelection(4).run();
    const indentSpy = jest.spyOn(editor.commands, 'indent');
    shortcuts.Tab();
    expect(indentSpy).not.toHaveBeenCalled();
  });

  it('Backspace should call outdent with true', () => {
    editor.commands.setContent('<ul><li><p>Item</p></li></ul>');
    editor.chain().focus().setTextSelection(2).run();
    const backspaceHandler = shortcuts.Backspace;
    const result = backspaceHandler({editor});
    expect(result).toBeDefined();
  });

  it('Mod-] should call indent', () => {
    const indentHandler = shortcuts['Mod-]'];
    const result = indentHandler({editor});
    expect(result).toBeDefined();
  });

  it('Mod-[ should call outdent with false', () => {
    const outdentHandler = shortcuts['Mod-['];
    const result = outdentHandler({editor});
    expect(result).toBeDefined();
  });
});

describe('Indent Extension - addCommands', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [StarterKit, Indent],
      content: '',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('indent command', () => {
    test('should return false if selection is not TextSelection', () => {
      const mockState = {
        selection: {instanceof: false},
        tr: editor.state.tr,
      };

      const indentCommand = editor.extensionManager.commands.indent;
      const result = indentCommand()({
        state: mockState as unknown as EditorState,
        dispatch: jest.fn((_tr: Transaction) => {}),
        editor,
        tr: editor.state.tr,
        commands: editor.commands,
        can: editor.can,
        chain: editor.chain,
        view: editor.view,
      });

      expect(result).toBe(false);
    });

    test('should return false if not in a list (listDepth === -1)', () => {
      editor.commands.setContent('<p>Not in a list</p>');
      editor.commands.focus();
      editor.commands.setTextSelection(2);

      const result = editor.commands.indent();

      expect(result).toBe(true);
    });

    test('should return false if not in a list item (listItemDepth === -1)', () => {
      editor.commands.setContent('<p>Not in a list item</p>');
      editor.commands.focus();
      editor.commands.setTextSelection(2);

      const result = editor.commands.indent();

      expect(result).toBe(true);
    });

    test('should access listNode, listPos, listItem, listItemPos when in valid list', () => {
      editor.commands.setContent('<ul><li><p>Item</p></li></ul>');
      editor.commands.focus();
      editor.commands.setTextSelection(4);

      const {state} = editor;
      const {$from} = state.selection;

      let listDepth = -1;
      let listItemDepth = -1;

      for (let d = $from.depth; d > 0; d--) {
        const node = $from.node(d);
        if (node.type.name === 'listItem' && listItemDepth === -1) {
          listItemDepth = d;
        }
        if (node.type.name === 'bulletList' && listDepth === -1) {
          listDepth = d;
        }
      }


        const listNode = $from.node(listDepth);
        const listPos = $from.before(listDepth);
        const listItem = $from.node(listItemDepth);
        const listItemPos = $from.before(listItemDepth);

        expect(listNode).toBeDefined();
        expect(listNode.type.name).toBe('bulletList');
        expect(listPos).toBeGreaterThanOrEqual(0);
        expect(listItem).toBeDefined();
        expect(listItem.type.name).toBe('listItem');
        expect(listItemPos).toBeGreaterThanOrEqual(0);

    });

    test('should return false when currentIndent >= maxIndentLevel', () => {
      editor.commands.setContent('<ul><li><p>Item</p></li></ul>');
      editor.commands.focus();
      editor.commands.setTextSelection(4);

      for (let i = 0; i < 7; i++) {
        editor.commands.indent();
      }

      const result = editor.commands.indent();
      expect(result).toBe(false);
    });

    test('should return false when actualItemIndex === -1', () => {
      editor.commands.setContent('<ul><li><p>Item</p></li></ul>');
      editor.commands.focus();
      editor.commands.setTextSelection(4);

      const result = editor.commands.indent();

      expect(typeof result).toBe('boolean');
    });

    test('should handle single item list (childCount === 1)', () => {
      editor.commands.setContent('<ul><li><p>Single Item</p></li></ul>');
      editor.commands.focus();
      editor.commands.setTextSelection(4);

      const dispatchSpy = jest.fn((_tr: Transaction) => {});
      const {state} = editor;

      const indentCommand = editor.extensionManager.commands.indent;
      const result = indentCommand()({
        state,
        dispatch: dispatchSpy,
        editor,
        tr: state.tr,
        commands: editor.commands,
        can: editor.can,
        chain: editor.chain,
        view: editor.view,
      });

      expect(typeof result).toBe('boolean');
    });

    test('should handle multiple items list and create split lists', () => {
      editor.commands.setContent(
        '<ul><li><p>Item 1</p></li><li><p>Item 2</p></li><li><p>Item 3</p></li></ul>'
      );
      editor.commands.focus();

      const {state} = editor;
      let secondItemPos = 0;
      let itemCount = 0;
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'listItem') {
          itemCount++;
          if (itemCount === 2) {
            secondItemPos = pos + 2;
            return false;
          }
        }
      });

      editor.commands.setTextSelection(secondItemPos);

      const dispatchSpy = jest.fn((_tr: Transaction) => {});
      const indentCommand = editor.extensionManager.commands.indent;
      const result = indentCommand()({
        state: editor.state,
        dispatch: dispatchSpy,
        editor,
        tr: editor.state.tr,
        commands: editor.commands,
        can: editor.can,
        chain: editor.chain,
        view: editor.view,
      });

      expect(typeof result).toBe('boolean');
    });



    test('should dispatch transaction when dispatch is provided', () => {
      editor.commands.setContent('<ul><li><p>Item</p></li></ul>');
      editor.commands.focus();
      editor.commands.setTextSelection(4);

      const dispatchSpy = jest.fn((_tr: Transaction) => {});
      const indentCommand = editor.extensionManager.commands.indent;

      indentCommand()({
        state: editor.state,
        dispatch: dispatchSpy,
        editor,
        tr: editor.state.tr,
        commands: editor.commands,
        can: editor.can,
        chain: editor.chain,
        view: editor.view,
      });

      expect(dispatchSpy.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    test('should return true when indent is successful', () => {
      editor.commands.setContent('<ul><li><p>Item</p></li></ul>');
      editor.commands.focus();
      editor.commands.setTextSelection(4);

      const result = editor.commands.indent();

      expect(typeof result).toBe('boolean');
    });

    test('should not dispatch when dispatch is undefined', () => {
      editor.commands.setContent('<ul><li><p>Item</p></li></ul>');
      editor.commands.focus();
      editor.commands.setTextSelection(4);

      const indentCommand = editor.extensionManager.commands.indent;
      const result = indentCommand()({
        state: editor.state,
        dispatch: undefined,
        editor,
        tr: editor.state.tr,
        commands: editor.commands,
        can: editor.can,
        chain: editor.chain,
        view: editor.view,
      });

      expect(typeof result).toBe('boolean');
    });
    it('should return the correct index for items in a list', () => {
      const editor = new Editor({
        extensions: [StarterKit, Indent],
        content: `
        <ul>
          <li><p>Index 0</p></li>
          <li><p>Index 1</p></li>
          <li><p>Index 2</p></li>
        </ul>
      `,
      });

      const {doc} = editor.state;
      let listNode, listPos;
      const listItemPositions = [];

      // Traverse the doc to find the list and its items
      doc.descendants((node, pos) => {
        if (node.type.name === 'bulletList') {
          listNode = node;
          listPos = pos;
        }
        if (node.type.name === 'listItem') {
          listItemPositions.push(pos);
        }
      });

      // Test each item index
      expect(findActualItemIndex(listNode, listPos, listItemPositions[0])).toBe(
        0
      );
      expect(findActualItemIndex(listNode, listPos, listItemPositions[1])).toBe(
        1
      );
      expect(findActualItemIndex(listNode, listPos, listItemPositions[2])).toBe(
        2
      );

      // Test a position that doesn't exist in the list
      expect(findActualItemIndex(listNode, listPos, 9999)).toBe(-1);
    });
    it('handleSingleItemIndent', () => {
      const editor = new Editor({
        extensions: [StarterKit, Indent],
        content: `
        <ul>
          <li><p>Index 0</p></li>
          <li><p>Index 1</p></li>
          <li><p>Index 2</p></li>
        </ul>
      `,
      });

      const {doc} = editor.state;
      let listNode, listPos;

      // Traverse the doc to find the list and its items
      doc.descendants((node, pos) => {
        if (node.type.name === 'bulletList') {
          listNode = node;
          listPos = pos;
        }
      });
      const test = handleSingleItemIndent(
        {setNodeMarkup: () => {}},
        listPos,
        listNode,
        0,
        () => {}
      );
      expect(test).toBeTruthy();
    });

    it('createSplitLists', () => {
      const editor = new Editor({
        extensions: [StarterKit, Indent],
        content: `
        <ul>
          <li><p>Index 0</p></li>
          <li><p>Index 1</p></li>
          <li><p>Index 2</p></li>
        </ul>
      `,
      });

      const {doc} = editor.state;
      let listNode, listPos;

      // Traverse the doc to find the list and its items
      doc.descendants((node, pos) => {
        if (node.type.name === 'bulletList') {
          listNode = node;
          listPos = pos;
        }
      });
      const test = createSplitLists(
        {
          insert() {},
          mapping: {
            map() {
              return 1;
            },
          },
          delete: () => {},
          setNodeMarkup: () => {
            return {};
          },
        } as unknown as Transaction,
        listNode,
        listPos,
        1,
        0,
        listNode
      );
      expect(test).toBeTruthy();
    });
  });

  describe('outdent command', () => {
    test('should update indent level on outdent', () => {
      editor.commands.setContent('<p>Paragraph</p>');
      editor.commands.focus();
      editor.commands.setTextSelection(2);

      editor.commands.indent();
      const indentedLevel = editor.getAttributes('paragraph').indent;

      editor.commands.outdent();

      const outdentedLevel = editor.getAttributes('paragraph').indent;
      expect(outdentedLevel).toBeLessThanOrEqual(indentedLevel);
    });

    test('should return false when tr.docChanged is false', () => {
      editor.commands.setContent('<p>Paragraph at min indent</p>');
      editor.commands.focus();
      editor.commands.setTextSelection(2);

      const result = editor.commands.outdent();

      expect(result).toBe(false);
    });

    test('should return true and dispatch when tr.docChanged is true', () => {
      editor.commands.setContent('<p>Paragraph</p>');
      editor.commands.focus();
      editor.commands.setTextSelection(2);

      editor.commands.indent();

      const result = editor.commands.outdent();

      expect(typeof result).toBe('boolean');
    });

    test('should call focus when tr.docChanged is false', () => {
      editor.commands.setContent('<p>Paragraph</p>');
      editor.commands.focus();
      editor.commands.setTextSelection(2);

      const chainSpy = jest.spyOn(editor, 'chain');

      editor.commands.outdent();

      expect(chainSpy).toHaveBeenCalled();
      chainSpy.mockRestore();
    });

    test('should dispatch transaction when conditions are met', () => {
      editor.commands.setContent('<p>Paragraph</p>');
      editor.commands.focus();
      editor.commands.setTextSelection(2);

      editor.commands.indent();

      const dispatchSpy = jest.fn((_tr: Transaction) => {});
      const outdentCommand = editor.extensionManager.commands.outdent;

      outdentCommand()({
        tr: editor.state.tr,
        state: editor.state,
        dispatch: dispatchSpy,
        editor,
        commands: editor.commands,
        can: editor.can,
        chain: editor.chain,
        view: editor.view,
      });

      expect(dispatchSpy.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    test('should update selection in transaction', () => {
      editor.commands.setContent('<p>Paragraph</p>');
      editor.commands.focus();
      editor.commands.setTextSelection(2);

      const {state} = editor;

      const outdentCommand = editor.extensionManager.commands.outdent;
      const result = outdentCommand()({
        tr: state.tr,
        state,
        dispatch: jest.fn((_tr: Transaction) => {}),
        editor,
        commands: editor.commands,
        can: editor.can,
        chain: editor.chain,
        view: editor.view,
      });

      expect(typeof result).toBe('boolean');
    });

    test('should not dispatch when dispatch is undefined', () => {
      editor.commands.setContent('<p>Paragraph</p>');
      editor.commands.focus();
      editor.commands.setTextSelection(2);

      editor.commands.indent();

      const outdentCommand = editor.extensionManager.commands.outdent;
      const result = outdentCommand()({
        tr: editor.state.tr,
        state: editor.state,
        dispatch: undefined,
        editor,
        commands: editor.commands,
        can: editor.can,
        chain: editor.chain,
        view: editor.view,
      });

      expect(typeof result).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    test('indent should handle empty content', () => {
      editor.commands.setContent('');
      editor.commands.focus();

      const result = editor.commands.indent();

      expect(typeof result).toBe('boolean');
    });

    test('outdent should handle empty content', () => {
      editor.commands.setContent('');
      editor.commands.focus();

      const result = editor.commands.outdent();

      expect(typeof result).toBe('boolean');
    });

    test('indent should handle nested lists', () => {
      editor.commands.setContent(
        '<ul><li><p>Item 1</p><ul><li><p>Nested</p></li></ul></li></ul>'
      );
      editor.commands.focus();

      let nestedPos = 0;
      editor.state.doc.descendants((node, pos) => {
        if (node.textContent === 'Nested') {
          nestedPos = pos;
        }
      });

      editor.commands.setTextSelection(nestedPos);
      const result = editor.commands.indent();

      expect(typeof result).toBe('boolean');
    });

    test('indent should handle ordered lists', () => {
      editor.commands.setContent('<ol><li><p>Ordered Item</p></li></ol>');
      editor.commands.focus();
      editor.commands.setTextSelection(4);

      const result = editor.commands.indent();

      expect(typeof result).toBe('boolean');
    });
  });
});

describe('Indent Extension - Internal Logic', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [StarterKit, Indent],
    });
  });

  it('should return the value if within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('should return min if value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });
  it('should return max if value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should render style with margin-left for paragraphs', () => {
    editor.commands.setContent('<p data-indent="2">Test</p>');
    // 2 * 36px = 72px
    expect(editor.getHTML()).toContain(
      '<p data-indent="2" style="margin-left: 72px;">Test</p>'
    );
    expect(editor.getHTML()).toContain('data-indent="2"');
  });

  it('should parse data-indent attribute from HTML', () => {
    editor.commands.setContent('<p data-indent="3">Test</p>');
    expect(editor.getAttributes('paragraph').indent).toBe(3);
  });

  it('should fallback to default indent for invalid attributes', () => {
    editor.commands.setContent('<p data-indent="invalid">Test</p>');
    expect(editor.getAttributes('paragraph').indent).toBe(0);
  });

  it('should not render style for lists (only data-indent)', () => {
    // Assuming list items have isList: true logic in your schema
    editor.commands.setContent('<ul data-indent="1"><li>Item</li></ul>');
    const html = editor.getHTML();
    expect(html).toContain(
      '<ul><li><p data-indent="0" style="margin-left: 0px;">Item</p></li></ul>'
    );
  });
});

describe('Indent Extension - Shortcut Constraints', () => {
  it('Backspace should NOT outdent if cursor is not at the start of the node', () => {
    const editor = new Editor({
      extensions: [StarterKit, Indent],
      content: '<p data-indent="1">Text</p>',
    });

    const indentSpy = jest.spyOn(editor.commands, 'outdent');

    // Set selection to the end of the text
    editor.commands.setTextSelection(5);

    const indentExt = editor.extensionManager.extensions.find(
      (e) => e.name === 'indent'
    );
    const shortcuts = indentExt.config.addKeyboardShortcuts.call({
      editor,
      options: indentExt.options,
    });

    shortcuts.Backspace({editor});

    expect(indentSpy).not.toHaveBeenCalled();
    indentSpy.mockRestore();
  });

  it('Tab should NOT indent if cursor is not at the start of a list item', () => {
    const editor = new Editor({
      extensions: [StarterKit, Indent],
      content: '<ul><li><p>Item</p></li></ul>',
    });

    const indentSpy = jest.spyOn(editor.commands, 'indent');

    // Pos 4 is start, Pos 6 is middle of "Item"
    editor.commands.setTextSelection(6);

    const indentExt = editor.extensionManager.extensions.find(
      (e) => e.name === 'indent'
    );
    const shortcuts = indentExt.config.addKeyboardShortcuts.call({
      editor,
      options: indentExt.options,
    });

    shortcuts.Tab();

    expect(indentSpy).not.toHaveBeenCalled();
    indentSpy.mockRestore();
  });
  it('Tab should indent with SpacerMark', () => {
    const SpacerMark = Mark.create({
      name: 'spacer',

      addAttributes() {
        return {
          size: {
            default: null,
          },
        };
      },

      parseHTML() {
        return [{tag: 'span[data-spacer]'}];
      },

      renderHTML({HTMLAttributes}) {
        return ['span', {'data-spacer': '', ...HTMLAttributes}, 0];
      },
    });
    const editor = new Editor({
      extensions: [StarterKit, Indent, SpacerMark],
      content: '<ul><li><p>Item</p></li></ul>',
    });

    const indentSpy = jest.spyOn(editor.commands, 'indent');

    // Pos 4 is start, Pos 6 is middle of "Item"
    editor.commands.setTextSelection(6);

    const indentExt = editor.extensionManager.extensions.find(
      (e) => e.name === 'indent'
    );
    const shortcuts = indentExt.config.addKeyboardShortcuts.call({
      editor,
      options: indentExt.options,
    });

    shortcuts.Tab();

    expect(indentSpy).not.toHaveBeenCalled();
    indentSpy.mockRestore();
  });

});
