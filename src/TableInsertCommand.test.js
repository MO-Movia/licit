import { EditorState } from 'prosemirror-state';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

import EditorSchema from './EditorSchema.js';
import TableInsertCommand from './TableInsertCommand.js';

describe('TableInsertCommand', () => {
  it('opens the insert-table grid from hover or click menu events', () => {
    const command = new TableInsertCommand();

    expect(
      command.shouldRespondToUIEvent({ type: UICommand.EventType.MOUSEENTER })
    ).toBe(true);
    expect(
      command.shouldRespondToUIEvent({ type: UICommand.EventType.CLICK })
    ).toBe(true);
    expect(command.shouldRespondToUIEvent({ type: 'mouseleave' })).toBe(false);
  });

  it('closes the grid popup when the command is cancelled', () => {
    const command = new TableInsertCommand();
    const close = jest.fn();
    command._popUp = { close };

    command.cancel();

    expect(close).toHaveBeenCalledTimes(1);
  });

  it('inserts the selected table size and restores editor focus', () => {
    const paragraph = EditorSchema.nodes.paragraph.create();
    const state = EditorState.create({
      doc: EditorSchema.nodes.doc.create(null, [paragraph]),
      schema: EditorSchema,
    });
    const dispatch = jest.fn();
    const view = { focus: jest.fn() };
    const command = new TableInsertCommand();

    expect(
      command.executeWithUserInput(state, dispatch, view, {
        rows: 2,
        cols: 3,
      })
    ).toBe(true);

    const transaction = dispatch.mock.calls[0][0];
    let table = null;
    transaction.doc.descendants((node) => {
      if (node.type.name === 'table') {
        table = node;
      }
    });

    expect(table).not.toBeNull();
    expect(table.childCount).toBe(2);
    expect(table.firstChild.childCount).toBe(3);
    expect(view.focus).toHaveBeenCalledTimes(1);
  });

  it('does not dispatch when the grid is dismissed without a size', () => {
    const state = EditorState.create({ schema: EditorSchema });
    const dispatch = jest.fn();
    const command = new TableInsertCommand();

    expect(command.executeWithUserInput(state, dispatch, null, undefined)).toBe(
      false
    );
    expect(dispatch).not.toHaveBeenCalled();
  });
});
