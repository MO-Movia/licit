// @flow

import { tableEditing } from 'prosemirror-tables';

import TableCellMenuPlugin from './TableCellMenuPlugin.js';
import TableCellStyleInheritancePlugin from './TableCellStyleInheritancePlugin.js';
import TableResizePlugin from './TableResizePlugin.js';
import createTableRowResizingPlugin from './createTableRowResizingPlugin.js';
import createPendingTableMarksPlugin from './createPendingTableMarksPlugin.js';

// Tables
// https://github.com/ProseMirror/prosemirror-tables/blob/master/demo.js
export default [
  new TableCellMenuPlugin(),
  createTableRowResizingPlugin(),
  new TableResizePlugin(),
  new TableCellStyleInheritancePlugin(),
  createPendingTableMarksPlugin(),
  tableEditing(),
];
