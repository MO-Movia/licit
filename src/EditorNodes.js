// @flow

import { Schema } from 'prosemirror-model';
import BlockquoteNodeSpec from './BlockquoteNodeSpec';
import BookmarkNodeSpec from './BookmarkNodeSpec';
import BulletListNodeSpec from './BulletListNodeSpec';
import DocNodeSpec from './DocNodeSpec';
import HardBreakNodeSpec from './HardBreakNodeSpec';
// import HeadingNodeSpec from './HeadingNodeSpec';
import HorizontalRuleNodeSpec from './HorizontalRuleNodeSpec';
import ListItemNodeSpec from './ListItemNodeSpec';
import MathNodeSpec from './MathNodeSpec';
import * as NodeNames from './NodeNames';
import OrderedListNodeSpec from './OrderedListNodeSpec';
import ParagraphNodeSpec from './ParagraphNodeSpec';
import TableNodesSpecs from './TableNodesSpecs';
import TextNodeSpec from './TextNodeSpec';

const {
  BLOCKQUOTE,
  BOOKMARK,
  BULLET_LIST,
  //CODE_BLOCK,
  DOC,
  HARD_BREAK,
  HEADING,
  HORIZONTAL_RULE,
  LIST_ITEM,
  MATH,
  ORDERED_LIST,
  PARAGRAPH,
  TEXT,
} = NodeNames;

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js

// !! Be careful with the order of these nodes, which may effect the parsing
// outcome.!!
// [FS-SEA][06-04-2023]
// Changed HeadingNodeSpec to ParagraphNodeSpec for HEADING to handle Header as a paragraph
const nodes = {
  [DOC]: DocNodeSpec,
  [PARAGRAPH]: ParagraphNodeSpec,
  [BLOCKQUOTE]: BlockquoteNodeSpec,
  [HORIZONTAL_RULE]: HorizontalRuleNodeSpec,
  [HEADING]: ParagraphNodeSpec,
  [TEXT]: TextNodeSpec,
  [MATH]: MathNodeSpec,
  [HARD_BREAK]: HardBreakNodeSpec,
  [BULLET_LIST]: BulletListNodeSpec,
  [ORDERED_LIST]: OrderedListNodeSpec,
  [LIST_ITEM]: ListItemNodeSpec,
  [BOOKMARK]: BookmarkNodeSpec,
};

const marks = {};
const schema = new Schema({ nodes, marks });
const EditorNodes = schema.spec.nodes.append(TableNodesSpecs);
export default EditorNodes;
