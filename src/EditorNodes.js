// @flow

import { Schema } from 'prosemirror-model';
import BlockquoteNodeSpec from './BlockquoteNodeSpec.js';
import BookmarkNodeSpec from './BookmarkNodeSpec.js';
import BulletListNodeSpec from './BulletListNodeSpec.js';
import DocNodeSpec from './DocNodeSpec.js';
import HardBreakNodeSpec from './HardBreakNodeSpec.js';
import HorizontalRuleNodeSpec from './HorizontalRuleNodeSpec.js';
import ListItemNodeSpec from './ListItemNodeSpec.js';
import * as NodeNames from './NodeNames.js';
import OrderedListNodeSpec from './OrderedListNodeSpec.js';
import ParagraphNodeSpec from './ParagraphNodeSpec.js';
import TableNodesSpecs from './TableNodesSpecs.js';
import TextNodeSpec from './TextNodeSpec.js';

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
