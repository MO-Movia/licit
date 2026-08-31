// @flow

import TableColorCommand from './TableColorCommand.js';

// Backwards-compatible name retained for consumers that imported the old
// cell-fill command directly.
export default class TableCellColorCommand extends TableColorCommand {
  constructor() {
    super('backgroundColor');
  }
}
