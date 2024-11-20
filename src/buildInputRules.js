// @flow

import {
  InputRule,
  ellipsis,
  emDash,
  inputRules,
  smartQuotes,
  textblockTypeInputRule,
  wrappingInputRule,
} from 'prosemirror-inputrules';
import { NodeType, Schema } from 'prosemirror-model';

import blockQuoteInputRule from './blockQuoteInputRule.js';

// This file is forked from
// // https://github.com/ProseMirror/prosemirror-example-setup/blob/master/src/inputrules.js

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a number
// followed by a dot at the start of a textblock into an ordered list.
function orderedListRule(nodeType: NodeType): InputRule {
  return wrappingInputRule(
    /^(\d+)\.\s$/,
    nodeType,
    (match) => ({ order: +match[1] }),
    (match, node) => node.childCount + node.attrs.order == +match[1]
  );
}

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a bullet
// (dash, plush, or asterisk) at the start of a textblock into a
// bullet list.
function bulletListRule(nodeType: NodeType): InputRule {
  return wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
}

// : (NodeType) → InputRule
// Given a code block node type, returns an input rule that turns a
// textblock starting with three backticks into a code block.
function codeBlockRule(nodeType: NodeType): InputRule {
  return textblockTypeInputRule(/^```$/, nodeType);
}

// : (NodeType, number) → InputRule
// Given a node type and a maximum level, creates an input rule that
// turns up to that number of `#` characters followed by a space at
// the start of a textblock into a heading whose level corresponds to
// the number of `#` signs.
function headingRule(nodeType: NodeType, maxLevel: number): InputRule {
  return textblockTypeInputRule(
    new RegExp('^(#{1,' + maxLevel + '})\\s$'),
    nodeType,
    (match) => ({ level: match[1].length })
  );
}

// : (Schema) → Plugin
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
export default function buildInputRules(schema: Schema) {
  const rules = smartQuotes.concat(ellipsis, emDash);
  let type;
  if (schema.nodes.blockquote) {
    rules.push(blockQuoteInputRule());
  }
  type = schema.nodes.ordered_list;
  if (type) {
    rules.push(orderedListRule(type));
  }
  type = schema.nodes.bullet_list;
  if (type) {
    rules.push(bulletListRule(type));
  }
  type = schema.nodes.code_block;
  if (type) {
    rules.push(codeBlockRule(type));
  }
  type = schema.nodes.heading;
  if (type) {
    rules.push(headingRule(type, 6));
  }
  return inputRules({ rules });
}
