// @flow
import clamp from './ui/clamp';
import compareNumber from './compareNumber';
import consolidateListNodes from './consolidateListNodes';
import isListNode from './isListNode';
import transformAndPreserveTextSelection from './transformAndPreserveTextSelection';
import { EditorState, AllSelection, TextSelection } from 'prosemirror-state';
import { BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH } from './NodeNames';
import { Fragment, Schema } from 'prosemirror-model';
import { MAX_INDENT_LEVEL, MIN_INDENT_LEVEL } from './ParagraphNodeSpec';
import { Transform } from 'prosemirror-transform';
import { getCustomStyleByLevel } from './customStyle';
import {
  getStyleLevel,
  applyLatestStyle,
  allowCustomLevelIndent,
} from './CustomStyleCommand';
import { EditorView } from 'prosemirror-view';

export default function updateIndentLevel(
  state: EditorState,
  tr: Transform,
  schema: Schema,
  delta: number,
  view: EditorView
): Transform {
  const { doc, selection } = tr;
  if (!doc || !selection) {
    return { tr, docChanged: false };
  }

  if (
    !(selection instanceof TextSelection || selection instanceof AllSelection)
  ) {
    return { tr, docChanged: false };
  }

  const { nodes } = schema;
  const { from, to } = selection;
  const listNodePoses = [];
  const blockquote = nodes[BLOCKQUOTE];
  const heading = nodes[HEADING];
  const paragraph = nodes[PARAGRAPH];

  doc.nodesBetween(from, to, (node, pos) => {
    const nodeType = node.type;
    if (
      nodeType === paragraph ||
      nodeType === heading ||
      nodeType === blockquote
    ) {
      tr = setNodeIndentMarkup(state, tr, pos, delta, view).tr;
      return false;
    } else if (isListNode(node)) {
      // List is tricky, we'll handle it later.
      listNodePoses.push(pos);
      return false;
    }
    return true;
  });

  if (!listNodePoses.length) {
    return { tr, docChanged: true };
  }

  tr = transformAndPreserveTextSelection(tr, schema, (memo) => {
    const { schema } = memo;
    let tr2 = memo.tr;
    listNodePoses
      .sort(compareNumber)
      .reverse()
      .forEach((pos) => {
        tr2 = setListNodeIndent(state, tr2, schema, pos, delta);
      });
    tr2 = consolidateListNodes(tr2);
    return tr2;
  });

  return { tr, docChanged: true };
}

function setListNodeIndent(
  state: EditorState,
  tr: Transform,
  schema: Schema,
  pos: number,
  delta: number
): Transform {
  const listItem = schema.nodes[LIST_ITEM];
  if (!listItem) {
    return tr;
  }

  const { doc, selection } = tr;
  if (!doc) {
    return tr;
  }

  const listNode = doc.nodeAt(pos);
  if (!listNode) {
    return tr;
  }

  const indentNew = clamp(
    MIN_INDENT_LEVEL,
    listNode.attrs.indent + delta,
    MAX_INDENT_LEVEL
  );
  if (indentNew === listNode.attrs.indent) {
    return tr;
  }

  const { from, to } = selection;

  // [FS] IRAD-947 2020-05-19
  // Fix for Multi-level lists lose multi-levels when indenting/de-indenting
  // Earlier they checked the to postion value to >= pos + listNode.nodeSize
  // It wont satisfy the list hve childrens

  if (from <= pos && to >= pos) {
    return setNodeIndentMarkup(state, tr, pos, delta).tr;
  }

  const listNodeType = listNode.type;

  // listNode is partially selected.
  const itemsBefore = [];
  const itemsSelected = [];
  const itemsAfter = [];

  doc.nodesBetween(pos, pos + listNode.nodeSize, (itemNode, itemPos) => {
    if (itemNode.type === listNodeType) {
      return true;
    }

    if (itemNode.type === listItem) {
      const listItemNode = listItem.create(
        itemNode.attrs,
        itemNode.content,
        itemNode.marks
      );
      if (itemPos + itemNode.nodeSize <= from) {
        itemsBefore.push(listItemNode);
      } else if (itemPos > to) {
        itemsAfter.push(listItemNode);
      } else {
        itemsSelected.push(listItemNode);
      }
      return false;
    }

    return true;
  });

  tr = tr.delete(pos, pos + listNode.nodeSize);
  if (itemsAfter.length) {
    const listNodeNew = listNodeType.create(
      listNode.attrs,
      Fragment.from(itemsAfter)
    );
    tr = tr.insert(pos, Fragment.from(listNodeNew));
  }

  if (itemsSelected.length) {
    const listNodeAttrs = {
      ...listNode.attrs,
      indent: indentNew,
    };
    const listNodeNew = listNodeType.create(
      listNodeAttrs,
      Fragment.from(itemsSelected)
    );
    tr = tr.insert(pos, Fragment.from(listNodeNew));
  }

  if (itemsBefore.length) {
    const listNodeNew = listNodeType.create(
      listNode.attrs,
      Fragment.from(itemsBefore)
    );
    tr = tr.insert(pos, Fragment.from(listNodeNew));
  }

  return tr;
}

function setNodeIndentMarkup(
  state: EditorState,
  tr: Transform,
  pos: number,
  delta: number,
  view: EditorView
): Transform {
  let retVal = true;
  if (!tr.doc) {
    return tr;
  }
  const node = tr.doc.nodeAt(pos);
  if (!node) {
    return { tr, docChanged: retVal };
  }
  const indent = clamp(
    MIN_INDENT_LEVEL,
    (node.attrs.indent || 0) + delta,
    MAX_INDENT_LEVEL
  );
  const styleLevel = getStyleLevel(node.attrs.styleName);
  if (styleLevel) {
    //FIX:  Normal Indent is not working along with custom style numbering
    const nextLevel = parseInt(styleLevel) + delta;
    const startPos = tr.selection.$from.before(1);
    const endPos = tr.selection.$to.after(1);

    const style = getCustomStyleByLevel(nextLevel);
    let isTabKey = false;
    let applyNext = false;
    if (style) {
      // [FS] IRAD-1387 2021-05-25
      // avoid executing the apply style on changing the cursor position
      if (view && view.lastKeyCode === 9) {
        isTabKey = true;
      }
      if (delta === 1 && nextLevel - parseInt(styleLevel) === 1) {
        applyNext = true;
      } else if (delta === -1 && parseInt(styleLevel) - nextLevel === 1) {
        applyNext = true;
      }
      if (view && view.dispatch && applyNext) {
        applyNext = true;
      } else if (isTabKey && applyNext) {
        applyNext = true;
      }
      if (
        applyNext &&
        allowCustomLevelIndent(tr, startPos, style.styleName, delta)
      ) {
        tr = applyLatestStyle(
          style.styleName,
          state,
          tr,
          node,
          startPos,
          endPos
        );
      } else {
        retVal = false;
      }
    }
    return { tr, docChanged: retVal };
  }
  if (indent === node.attrs.indent) {
    return { tr, docChanged: false };
  }
  const nodeAttrs = {
    ...node.attrs,
    indent,
  };
  tr = tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
  return { tr, docChanged: true };
}
