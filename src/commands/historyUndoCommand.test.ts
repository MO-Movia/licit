/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import HistoryUndoCommand from './historyUndoCommand';
import { Editor } from '@tiptap/react';
import { Transform } from 'prosemirror-transform';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

describe('HistoryRedoCommand', () => {
  const hisrdcommand = new HistoryUndoCommand();
  it('should be defined', () => {
    expect(hisrdcommand).toBeDefined();
  });
  it('should handle isEnabled', () => {
    expect(
      hisrdcommand.isEnabled({
        history$: { done: { eventCount: 0 } },
      } as unknown as EditorState)
    ).toBeFalsy();
  });
  it('should handle isEnabled with eventcount', () => {
    expect(
      hisrdcommand.isEnabled({
        history$: { done: { eventCount: 1 } },
      } as unknown as EditorState)
    ).toBeTruthy();
  });
  it('should call the getEditor method', () => {
    UICommand.prototype.editor = {
      view: { focus: () => {}, dispatch: () => {} },
      commands: { redo: jest.fn() },
    } as unknown as Editor;
    // Call the method
    const result = hisrdcommand.getEditor();

    // Verify that getEditor was called
    expect(result).toHaveProperty('view');
  });
  it('should handle execute', () => {
    jest
      .spyOn(hisrdcommand, 'getEditor')
      .mockReturnValue({ commands: { undo: () => {} } } as unknown as Editor);
    expect(
      hisrdcommand.execute({
        history$: { undone: { eventCount: 1 } },
      } as unknown as EditorState)
    ).toBeUndefined();
  });
  it('should handle waitForUserInput', () => {
    expect(
      hisrdcommand.waitForUserInput({
        history$: { undone: { eventCount: 1 } },
      } as unknown as EditorState)
    ).toBeDefined();
  });
  it('should handle executeWithUserInput tobefalsy', () => {
    expect(
      hisrdcommand.executeWithUserInput({
        history$: { undone: { eventCount: 1 } },
      } as unknown as EditorState)
    ).toBeFalsy();
  });
  it('should handle cancel', () => {
    expect(hisrdcommand.cancel()).toBe(null);
  });
  it('should handle executeCustom', () => {
    expect(
      hisrdcommand.executeCustom(
        {} as unknown as EditorState,
        {} as unknown as Transform,
        1,
        2
      )
    ).toBeDefined();
  });
});
