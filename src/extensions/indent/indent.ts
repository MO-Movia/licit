/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {
  CommandProps,
  Extension,
  Extensions,
  isList,
  KeyboardShortcutCommand,
} from '@tiptap/core';
import {TextSelection, Transaction} from 'prosemirror-state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

type IndentOptions = {
  names: Array<string>;
  indentRange: number;
  minIndentLevel: number;
  maxIndentLevel: number;
  defaultIndentLevel: number;
  HTMLAttributes: Record<string, unknown>;
};
export const Indent = Extension.create<IndentOptions, never>({
  name: 'indent',

  addOptions() {
  return {
    names: ['heading', 'paragraph', 'bulletList', 'orderedList'], 
    indentRange: 1, 
    minIndentLevel: 0,
    maxIndentLevel: 7,
    defaultIndentLevel: 0,
    HTMLAttributes: {},
  };
},

  addGlobalAttributes() {
    return [
      {
        types: this.options.names,
        attributes: {
          indent: {
            default: this.options.defaultIndentLevel,

            renderHTML: (attributes) => {
              if (attributes.isList) {
                return {
                  'data-indent': attributes.indent,
                };
              }

              return {
                'data-indent': attributes.indent,
                style: `margin-left: ${attributes.indent * 36}px`,
              };
            },

            parseHTML: (element) => {
              const attr = element.getAttribute('data-indent');
              if (attr !== null) {
                const val = parseInt(attr, 10);
                return isNaN(val) ? this.options.defaultIndentLevel : val;
              }
              return this.options.defaultIndentLevel;
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      indent:
        () =>
        ({tr, state, dispatch, editor}: CommandProps) => {
          const {selection} = state;
          tr = tr.setSelection(selection);
          tr = updateIndentLevel(
            tr,
            this.options,
            editor.extensionManager.extensions,
            'indent'
          );
          if (tr.docChanged && dispatch) {
            dispatch(tr);
            return true;
          }
          editor.chain().focus().run();
          return false;
        },
      outdent:
        () =>
        ({tr, state, dispatch, editor}: CommandProps) => {
          const {selection} = state;
          tr = tr.setSelection(selection);
          tr = updateIndentLevel(
            tr,
            this.options,
            editor.extensionManager.extensions,
            'outdent'
          );
          if (tr.docChanged && dispatch) {
            dispatch(tr);
            return true;
          }
          editor.chain().focus().run();
          return false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: indent(),
      'Shift-Tab': outdent(false),
      Backspace: outdent(true),
      'Mod-]': indent(),
      'Mod-[': outdent(false),
    };
  },
});

export const clamp = (val: number, min: number, max: number): number => {
  if (val < min) {
    return min;
  }
  if (val > max) {
    return max;
  }
  return val;
};

function setNodeIndentMarkup(
  tr: Transaction,
  pos: number,
  delta: number,
  min: number,
  max: number
): Transaction {
  if (!tr.doc) return tr;
  const node = tr.doc.nodeAt(pos);
  if (!node) return tr;
  const indentVal = clamp((node.attrs.indent || 0) + delta, min, max);
  if (indentVal === node.attrs.indent) return tr;
  const nodeAttrs = {
    ...node.attrs,
    indent: indentVal,
    overriddenIndent: 'true',
    overriddenIndentValue: indentVal,
  };
  return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
}

type IndentType = 'indent' | 'outdent';
const updateIndentLevel = (
  tr: Transaction,
  options: IndentOptions,
  extensions: Extensions,
  type: IndentType
): Transaction => {
  const {doc, selection} = tr;
  if (!doc || !selection) return tr;
  if (!(selection instanceof TextSelection)) {
    return tr;
  }
  const {from, to} = selection;
  doc.nodesBetween(from, to, (node, pos) => {
    if (options.names.includes(node.type.name)) {
      tr = setNodeIndentMarkup(
        tr,
        pos,
        options.indentRange * (type === 'indent' ? 1 : -1),
        options.minIndentLevel,
        options.maxIndentLevel
      );
      return false;
    }
    return !isList(node.type.name, extensions);
  });
  return tr;
};

const indent: () => KeyboardShortcutCommand =
  () =>
  ({editor}) => {
    if (
      !isList(editor.state.doc.type.name, editor.extensionManager.extensions)
    ) {
      return editor.commands.indent();
    }
    return false;
  };
const outdent: (outdentOnlyAtHead: boolean) => KeyboardShortcutCommand =
  (outdentOnlyAtHead) =>
  ({editor}) => {
    if (
      !(
        isList(
          editor.state.doc.type.name,
          editor.extensionManager.extensions
        ) ||
        (outdentOnlyAtHead && editor.state.selection.$head.parentOffset !== 0)
      )
    ) {
      return editor.commands.outdent();
    }
    return false;
  };
