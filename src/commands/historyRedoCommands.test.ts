import { EditorState } from 'prosemirror-state';
import HistoryRedoCommand from './historyRedoCommand';
import { Editor } from '@tiptap/react';
import { Transform } from 'prosemirror-transform';

describe('HistoryRedoCommand', () => {
  let hisrdcommand: HistoryRedoCommand;

  beforeEach(() => {
    hisrdcommand = new HistoryRedoCommand();
  });

  it('should be defined', () => {
    expect(hisrdcommand).toBeDefined();
  });

  describe('isEnabled', () => {
    it('should return false when there are no undone events', () => {
      const mockState = {
        history$: { undone: { eventCount: 0 } },
      } as unknown as EditorState;
      expect(hisrdcommand.isEnabled(mockState)).toBeFalsy();
    });

    it('should return true when there are undone events', () => {
      const mockState = {
        history$: { undone: { eventCount: 1 } },
      } as unknown as EditorState;
      expect(hisrdcommand.isEnabled(mockState)).toBeTruthy();
    });
  });

  describe('execute', () => {
    it('should call redo when editor is available', () => {
      const mockRedo = jest.fn();
      jest.spyOn(hisrdcommand, 'getEditor').mockReturnValue({
        commands: { redo: mockRedo },
      } as unknown as Editor);

      const mockState = {
        history$: { undone: { eventCount: 1 } },
      } as unknown as EditorState;

      hisrdcommand.execute(mockState);
      expect(mockRedo).toHaveBeenCalled();
    });

    it('should handle null editor gracefully', () => {
      jest.spyOn(hisrdcommand, 'getEditor').mockReturnValue(null);

      const mockState = {
        history$: { undone: { eventCount: 1 } },
      } as unknown as EditorState;

      expect(hisrdcommand.execute(mockState)).toBe(false);
    });
  });

  it('should handle waitForUserInput', async () => {
    const result = await hisrdcommand.waitForUserInput();
    expect(result).toBeNull();
  });

  it('should handle executeWithUserInput', () => {
    const result = hisrdcommand.executeWithUserInput();
    expect(result).toBeFalsy();
  });

  it('should handle cancel', () => {
    expect(hisrdcommand.cancel()).toBeUndefined();
  });

  it('should handle executeCustom', () => {
    const mockTransform = {} as Transform;
    const result = hisrdcommand.executeCustom({} as EditorState, mockTransform);
    expect(result).toBe(mockTransform);
  });
});
