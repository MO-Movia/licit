// @flow

import { tableEditing } from 'prosemirror-tables';

import TableCellMenuPlugin from './TableCellMenuPlugin.js';
import TablePendingStyleMarksPlugin from './TablePendingStyleMarksPlugin.js';
import TableResizePlugin from './TableResizePlugin.js';

// Tables
// https://github.com/ProseMirror/prosemirror-tables/blob/master/demo.js
export default [
  new TableCellMenuPlugin(),
  new TableResizePlugin(),
  TablePendingStyleMarksPlugin(),
  tableEditing(),
];
