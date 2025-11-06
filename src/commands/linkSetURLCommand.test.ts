import { EditorState, TextSelection } from 'prosemirror-state';
import LinkSetURLCommand from './linkSetURLCommand';
import { Transform } from 'prosemirror-transform';
import { Schema } from 'prosemirror-model';
import { EditorViewEx } from '@src/constants';

jest.mock('@modusoperandi/licit-ui-commands', () => {
  const actual = jest.requireActual<typeof import('@modusoperandi/licit-ui-commands')>('@modusoperandi/licit-ui-commands');
  return {
    ...actual,
    findNodesWithSameMark: jest.fn().mockReturnValue({
      mark: { attrs: { href: 'https://google.com' } },
    }),
  };
});

jest.mock('../plugins/selectionPlaceholderPlugin', () => {
  const actual = jest.requireActual<
    typeof import('../plugins/selectionPlaceholderPlugin')
  >('../plugins/selectionPlaceholderPlugin');

  return {
    ...actual,
    hideSelectionPlaceholder: jest.fn().mockReturnValue({
      setSelection: jest.fn().mockReturnThis(),
    }),
  };
});

describe('LinkSetURLCommand', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  const lsc = new LinkSetURLCommand();
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

  const state = {
    doc: dummyDoc,
    selection: {
      from: 0,
      to: 0,
      $head: {
        depth: 1,
        node: jest.fn(() => ({ type: { spec: { tableRole: '' } } })),
      },
    },
  };

  it('should be defined', () => {
    expect(lsc).toBeDefined();
  });
  it('should handle isEnabled with TextSelection.create', () => {
    expect(
      lsc.isEnabled({
        schema: { marks: { link: {} } },
        selection: TextSelection.create(state.doc, 0, 1),
      } as unknown as EditorState)
    ).toBeDefined();
  });
  it('should handle return false if markType is null', () => {
    const result = lsc.isEnabled({
      schema: { marks: {} },
      selection: TextSelection.create(state.doc, 0, 1),
    } as unknown as EditorState);

    expect(result).toBeFalsy();
  });
  it('should handle isEnabled', () => {
    expect(
      lsc.isEnabled({
        schema: { marks: { link: {} } },
        selection: { from: 0, to: 1 } as unknown as TextSelection,
      } as unknown as EditorState)
    ).toBeDefined();
  });
  it('should handle waitForUserInput', () => {
    expect(
      lsc.waitForUserInput(
        {
          doc: { nodeAt: () => {} },
          schema: { marks: { link: {} } },
          selection: { from: 0, to: 1 },
        } as unknown as EditorState,
        () => {}
      )
    ).toBeDefined();
  });
  it('waitForUserInput should return undefined if markType is empty', async () => {
    const result = await lsc.waitForUserInput({
      doc: { nodeAt: () => {} },
      schema: { marks: { link: null } },
      selection: TextSelection.create(state.doc, 0, 1),
    } as unknown as EditorState);

    expect(result).toBeFalsy();
  });

  it('should handle waitForUserInput with popup', () => {
    lsc._popUp = {};
    expect(
      lsc.waitForUserInput(
        {
          doc: { nodeAt: () => {} },
          schema: { marks: { link: {} } },
          selection: { from: 0, to: 1 },
        } as unknown as EditorState,
        () => {}
      )
    ).toBeDefined();
  });
  it('should handle executeWithUserInput with href null', () => {
    expect(
      lsc.executeWithUserInput(
        {
          doc: { nodeAt: () => {} },
          schema: { marks: { link: null } },
          selection: { from: 0, to: 1 },
        } as unknown as EditorState,
        () => {}
      )
    ).toBeDefined();
  });
  it('should handle executeWithUserInput with valid href', () => {
    const result = lsc.executeWithUserInput(
      {
        doc: { nodeAt: () => {} },
        schema: { marks: { link: {} } },
        selection: { from: 0, to: 1 },
      } as unknown as EditorState,
      () => {},
      { focus: jest.fn() } as unknown as EditorViewEx,
      'https://google.com'
    );

    expect(result).toBeTruthy();
  });
  it('should handle cancel', () => {
    expect(lsc.cancel()).toBe(null);
  });
  it('should handle executeCustom', () => {
    expect(
      lsc.executeCustom(
        {} as unknown as EditorState,
        {} as unknown as Transform,
        0,
        1
      )
    ).toBeDefined();
  });

  it('_popup should contain close once it created', async () => {
    lsc._popUp = null;
    const response = lsc.waitForUserInput(
      {
        doc: { nodeAt: () => {} },
        schema: { marks: { link: {} } },
        selection: { from: 0, to: 1 },
      } as unknown as EditorState,
      () => {}
    );
    const onCloseCallback = lsc._popUp?.close;
    if (onCloseCallback) {
      onCloseCallback('mocked value');
    }

    // Assert that the resolve function was called with the expected value
    await expect(response).resolves.toBe('mocked value');
  });

  describe('Marktype null', () => {
    it('should resolve immediately if no valid markType exists', async () => {
      const mockData = {
        doc: { nodeAt: () => {} },
        schema: { marks: { link: null } },
        selection: { from: 0, to: 1 },
        test: 'New',
      } as unknown as EditorState;

      lsc._popUp = null;

      const result = await lsc.waitForUserInput(mockData, () => {});

      expect(result).toBeUndefined(); // Resolves immediately when no valid mark type is found
    });
  });
});
