/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {
  applyMark,
  BULLET_LIST,
  HEADING,
  LIST_ITEM,
  MARK_SPACER,
  PARAGRAPH,
} from '@modusoperandi/licit-ui-commands';
import {HAIR_SPACE_CHAR, SPACER_SIZE_TAB} from '../../specs/spacerMarkSpec';
import {
  CommandProps,
  Extension,
  Extensions,
  isList,
  KeyboardShortcutCommand,
} from '@tiptap/core';
import {EditorState, TextSelection, Transaction} from 'prosemirror-state';
import {findParentNodeOfType} from 'prosemirror-utils';
import {Fragment, Schema, Node as ProsemirrorNode} from 'prosemirror-model';

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
      names: ['heading', 'paragraph', BULLET_LIST, 'ordered_list'],
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
                const val = Number.parseInt(attr, 10);
                return Number.isNaN(val)
                  ? this.options.defaultIndentLevel
                  : val;
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
        ({state, dispatch, editor}) => {
          if (!(state.selection instanceof TextSelection)) return false;

          const {$from} = state.selection;
          const tr = state.tr;

          const {listDepth, listItemDepth} = findListDepths($from);
          const isInList = listDepth !== -1 && listItemDepth !== -1;

          if (isInList) {
            const listNode = $from.node(listDepth);
            const listPos = $from.before(listDepth);
            const listItem = $from.node(listItemDepth);
            const listItemPos = $from.before(listItemDepth);

            const currentIndent = listNode.attrs.indent || 0;

            if (currentIndent >= this.options.maxIndentLevel) {
              return false;
            }

            const newIndent = currentIndent + 1;
            const actualItemIndex = findActualItemIndex(
              listNode,
              listPos,
              listItemPos
            );

            if (actualItemIndex === -1) return false;

            // Case 1: Only one item
            if (listNode.childCount === 1) {
              return handleSingleItemIndent(
                tr,
                listPos,
                listNode,
                newIndent,
                dispatch
              );
            }

            // Case 2: Multiple items - need to split
            const indentedListPos = createSplitLists(
              tr,
              listNode,
              listPos,
              actualItemIndex,
              newIndent,
              listItem
            );

            // Set cursor position to the indented item
            const newCursorPos = indentedListPos + 2;
            tr.setSelection(TextSelection.create(tr.doc, newCursorPos));

            if (dispatch) {
              dispatch(tr);
            }
            return true;
          } else {
            const updatedTr = updateIndentLevel(
              tr,
              this.options,
              editor.extensionManager.extensions,
              'indent'
            );

            if (updatedTr.docChanged && dispatch) {
              dispatch(updatedTr);
              return true;
            }
            return false;
          }
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
      Tab: () => {
        const {state} = this.editor;
        const {selection} = state;

        // Check if we're inside a list item at all
        if (selection instanceof TextSelection && selection.empty) {
          const {$from} = selection;

          // Check if cursor is inside a list item
          let isInListItem = false;
          for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === 'list_item') {
              isInListItem = true;
              break;
            }
          }

          if (isInListItem) {
            if ($from.parentOffset === 0) {
              return this.editor.commands.indent();
            }
          }
        }

        // Otherwise, insert tab space
        const {view} = this.editor;
        const tr = insertTabSpace(state, state.tr, state.schema);

        if (tr.docChanged) {
          view.dispatch(tr);
          return true;
        }
        return false;
      },
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
function insertTabSpace(
  _state: EditorState,
  tr: Transaction,
  schema: Schema
): Transaction {
  const {selection} = tr;
  if (!selection.empty || !(selection instanceof TextSelection)) {
    return tr;
  }

  const markType = schema.marks[MARK_SPACER];
  if (!markType) {
    return tr;
  }
  const paragraph = schema.nodes[PARAGRAPH];
  const heading = schema.nodes[HEADING];
  const listItem = schema.nodes[LIST_ITEM];

  const found =
    (listItem && findParentNodeOfType(listItem)(selection)) ||
    (paragraph && findParentNodeOfType(paragraph)(selection)) ||
    (heading && findParentNodeOfType(heading)(selection));

  if (!found) {
    return tr;
  }

  const {to} = selection;

  const textNode = schema.text(HAIR_SPACE_CHAR);
  tr = tr.insert(to, Fragment.from(textNode));
  const attrs = {
    size: SPACER_SIZE_TAB,
  };

  tr = tr.setSelection(TextSelection.create(tr.doc, to, to + 1));

  tr = applyMark(tr, schema, markType, attrs) as Transaction;

  tr = tr.setSelection(TextSelection.create(tr.doc, to + 1, to + 1));

  return tr;
}

function findListDepths($from) {
  let listDepth = -1;
  let listItemDepth = -1;

  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === 'list_item' && listItemDepth === -1) {
      listItemDepth = d;
    }
    if (
      (node.type.name === 'bullet_list' || node.type.name === 'ordered_list') &&
      listDepth === -1
    ) {
      listDepth = d;
    }
  }

  return {listDepth, listItemDepth};
}

// Helper function to find the actual item index
export function findActualItemIndex(listNode, listPos, listItemPos) {
  let actualItemIndex = -1;
  let currentPos = listPos + 1;

  for (let i = 0; i < listNode.childCount; i++) {
    if (currentPos === listItemPos) {
      actualItemIndex = i;
      break;
    }
    currentPos += listNode.child(i).nodeSize;
  }

  return actualItemIndex;
}

// Helper function to handle single item indent
export function handleSingleItemIndent(
  tr,
  listPos,
  listNode,
  newIndent,
  dispatch
) {
  tr.setNodeMarkup(listPos, null, {
    ...listNode.attrs,
    indent: newIndent,
    overriddenIndent: true,
    overriddenIndentValue: newIndent,
  });

  if (dispatch) {
    dispatch(tr);
  }
  return true;
}

// Helper function to create split lists
export function createSplitLists(
  tr: Transaction,
  listNode: ProsemirrorNode,
  listPos: number,
  actualItemIndex: number,
  newIndent: number,
  listItem: ProsemirrorNode
) {
  const itemsBefore = actualItemIndex;
  const itemsAfter = listNode.childCount - actualItemIndex - 1;

  tr.delete(listPos, listPos + listNode.nodeSize);
  let insertPosition = tr.mapping.map(listPos);

  // Create list with items BEFORE (if any)
  if (itemsBefore > 0) {
    const beforeItems = [];
    for (let i = 0; i < itemsBefore; i++) {
      beforeItems.push(listNode.child(i));
    }
    const beforeList = listNode.type.create(
      {...listNode.attrs},
      Fragment.from(beforeItems)
    );
    tr.insert(insertPosition, beforeList);
    insertPosition += beforeList.nodeSize;
  }

  // Create new list with the indented item
  const indentedList = listNode.type.create(
    {
      ...listNode.attrs,
      indent: newIndent,
      overriddenIndent: true,
      overriddenIndentValue: newIndent,
      start: 1,
      following: null,
      counterReset: null,
    },
    Fragment.from(listItem)
  );
  const indentedListPos = insertPosition;
  tr.insert(insertPosition, indentedList);
  insertPosition += indentedList.nodeSize;

  // Create list with items AFTER (if any)
  if (itemsAfter > 0) {
    const afterItems = [];
    for (let i = actualItemIndex + 1; i < listNode.childCount; i++) {
      afterItems.push(listNode.child(i));
    }

    const afterList = listNode.type.create(
      {
        ...listNode.attrs,
        counterReset: 'none',
        following: 'true',
        start: 1,
      },
      Fragment.from(afterItems)
    );
    tr.insert(insertPosition, afterList);
  }

  return indentedListPos;
}
