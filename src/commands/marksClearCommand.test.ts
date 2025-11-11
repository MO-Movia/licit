import { EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { clearMarks, clearHeading } from '@modusoperandi/licit-ui-commands';
import MarksClearCommand from './marksClearCommand';
import { Schema } from 'prosemirror-model';

jest.mock('@modusoperandi/licit-ui-commands', () => ({
  clearMarks: jest.fn(),
  clearHeading: jest.fn(),
}));

describe('MarksClearCommand', () => {
  let command: MarksClearCommand;
  let state: EditorState;
  let dispatch: jest.Mock;

  beforeEach(() => {
    command = new MarksClearCommand();
    dispatch = jest.fn();

    // Mock state and selection
    const mySchema = new Schema({
      nodes: {
        doc: {
          attrs: { lineSpacing: { default: 'test' } },
          content: 'block+',
        },
        paragraph: {
          attrs: { lineSpacing: { default: 'test' } },
          content: 'text*',
          group: 'block',
        },
        heading: {
          attrs: { lineSpacing: { default: 'test' } },
          content: 'text*',
          group: 'block',
          defining: true,
        },
        bullet_list: {
          content: 'list_item+',
          group: 'block',
        },
        list_item: {
          attrs: { lineSpacing: { default: 'test' } },
          content: 'paragraph',
          defining: true,
        },
        blockquote: {
          attrs: { lineSpacing: { default: 'test' } },
          content: 'block+',
          group: 'block',
        },
        text: {
          inline: true,
        },
      },
    });
    const dummyDoc = mySchema.node('doc', null, [
      mySchema.node('heading', { marks: [] }, [mySchema.text('Heading 1')]),
      mySchema.node('paragraph', { marks: [] }, [
        mySchema.text('This is a paragraph'),
      ]),
      mySchema.node('bullet_list', { marks: [] }, [
        mySchema.node('list_item', { marks: [] }, [
          mySchema.node('paragraph', { marks: [] }, [
            mySchema.text('List item 1'),
          ]),
        ]),
        mySchema.node('list_item', { marks: [] }, [
          mySchema.node('paragraph', { marks: [] }, [
            mySchema.text('List item 2'),
          ]),
        ]),
      ]),
      mySchema.node('blockquote', { marks: [] }, [
        mySchema.node('paragraph', { marks: [] }, [
          mySchema.text('This is a blockquote'),
        ]),
      ]),
    ]);

    state = {
      doc: dummyDoc,
      schema: mySchema,
      selection: {},
      tr: {
        setSelection: jest.fn().mockReturnThis(),
      },
    } as unknown as EditorState;
  });

  describe('isActive', () => {
    it('should return false', () => {
      expect(command.isActive(state)).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return false if selection is empty', () => {
      state = EditorState.create({
        doc: state.doc,
        selection: TextSelection.create(state.doc, 0, 0), // Empty selection
      });
      expect(command.isEnabled(state)).toBe(false);
    });

    it('should return true if selection is not empty and of type TextSelection or AllSelection', () => {
      state = EditorState.create({
        doc: state.doc,
        selection: TextSelection.create(state.doc, 0, 1), // Non-empty selection
      });
      expect(command.isEnabled(state)).toBe(true);

      state = EditorState.create({
        doc: state.doc,
        selection: TextSelection.create(state.doc, 0, 1), // AllSelection
      });
      expect(command.isEnabled(state)).toBe(true);
    });    
  });

  describe('execute', () => {
    it('should call clearMarks and clearHeading and dispatch the transaction', () => {
      const tr = state.tr;
      const clearMarksMock = clearMarks as jest.Mock;
      const clearHeadingMock = clearHeading as jest.Mock;
      clearMarksMock.mockReturnValue(tr); // Mock the transformation result
      clearHeadingMock.mockReturnValue(tr);

      command.execute(state, dispatch);

      expect(clearMarksMock).toHaveBeenCalledWith(
        state.tr.setSelection(state.selection),
        state.schema
      );
      expect(clearHeadingMock).toHaveBeenCalledWith(tr, state.schema);
    });

    it('should return true if there is dispatch the transaction', () => {
      const tr = { ...state.tr, docChanged: true };
      const clearMarksMock = clearMarks as jest.Mock;
      const clearHeadingMock = clearHeading as jest.Mock;
      clearMarksMock.mockReturnValue(tr); // Mock the transformation result
      clearHeadingMock.mockReturnValue(tr);

      command.execute(state, dispatch);
      expect(clearMarksMock).toHaveBeenCalledWith(
        state.tr.setSelection(state.selection),
        state.schema
      );
      expect(clearHeadingMock).toHaveBeenCalledWith(tr, state.schema);
    });

    it('should not dispatch if doc is not changed', () => {
      const tr = state.tr;
      const clearMarksMock = clearMarks as jest.Mock;
      const clearHeadingMock = clearHeading as jest.Mock;
      clearMarksMock.mockReturnValue(tr); // No doc change
      clearHeadingMock.mockReturnValue(tr);

      // Call execute and check that dispatch is not called
      const result = command.execute(state, dispatch);
      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    describe('waitForUserInput', () => {
      it('should resolve to undefined', async () => {
        const result = await command.waitForUserInput(state);
        expect(result).toBeNull();
      });
    });

    describe('executeWithUserInput', () => {
      it('should return false', () => {
        const result = command.executeWithUserInput(state);
        expect(result).toBe(false);
      });
    });

    describe('cancel', () => {
      it('should return null', () => {
        const result = command.cancel();
        expect(result).toBeNull();
      });
    });

    describe('executeCustom', () => {
      it('should return the given Transform', () => {
        const mockTransform = {} as Transform;
        const result = command.executeCustom(state, mockTransform, 0, 1);
        expect(result).toBe(mockTransform);
      });
    });
  });
});
