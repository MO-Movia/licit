// @flow

import { Schema } from 'prosemirror-model';

import EditorMarks from './EditorMarks.js';
import EditorNodes from './EditorNodes.js';

const EditorSchema = new Schema({
  nodes: EditorNodes,
  marks: EditorMarks,
});
export default EditorSchema;
