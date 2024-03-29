import {
  InputRule,
  ellipsis,
  emDash,
  inputRules,
  smartQuotes,
  wrappingInputRule,
} from 'prosemirror-inputrules';
import { NodeType, Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

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

// : (Schema) → Plugin
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
export default function buildInputRules(schema: Schema): Plugin {
  const rules = smartQuotes.concat(ellipsis, emDash);
  let type;
  if ((type == schema.nodes.ordered_list)) {
    rules.push(orderedListRule(type));
  }
  return inputRules({ rules });
}
