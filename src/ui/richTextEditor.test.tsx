import * as React from 'react';
import RichTextEditor from './richTextEditor';
import { Transform } from 'prosemirror-transform';
import { Transaction } from 'prosemirror-state';

// ? Define the props interface same as used by RichTextEditor
interface MockEditorFramesetProps {
  body: any;
  className?: string;
  embedded?: boolean;
  header?: string;
  height?: number;
  toolbar?: any;
  width?: number;
}

// ? Mock EditorFrameset properly
jest.mock('./editorFrameset', () => ({
  __esModule: true,
  default: (props: MockEditorFramesetProps) => ({
    type: 'EditorFrameset',
    props,
  }),
}));

// ? Mock EditorToolbar
jest.mock('./editorToolbar', () => ({
  __esModule: true,
  default: jest.fn((props) => ({ type: 'EditorToolbar', props })),
}));

// ? Mock Frag and EditorContent
jest.mock('./frag', () => ({
  __esModule: true,
  default: (props: any) => ({ type: 'Frag', props }),
}));
jest.mock('@tiptap/react', () => ({
  EditorContent: jest.fn((props) => ({ type: 'EditorContent', props })),
}));

jest.mock('./uuid', () => jest.fn(() => 'mock-uuid'));

describe('RichTextEditor (pure Jest tests)', () => {
  let mockProps: any;

  beforeEach(() => {
    mockProps = {
      editor: {
        view: { dispatch: jest.fn() },
      },
      editorState: {},
      editorView: {},
      readOnly: false,
      disabled: false,
      embedded: false,
      header: 'Test Header',
      height: 500,
      width: 800,
      toolbarConfig: {},
    };
  });

 it('should dispatch transaction when _dispatchTransaction is called', () => {
    const instance = new RichTextEditor(mockProps, {});
    const mockTransform = new Transform(null as any);
    instance._dispatchTransaction(mockTransform);
    expect(mockProps.editor.view.dispatch).toHaveBeenCalled();
  });

  it('should set editorView and call onReady in _onReady', () => {
    const instance = new RichTextEditor(mockProps, {});
    const mockEditorView = { view: true } as any;
    const onReady = jest.fn();
    instance.props.onReady = onReady;

    instance._onReady(mockEditorView);
    expect(instance.state.editorView).toBe(null);
    expect(onReady).toHaveBeenCalledWith(mockEditorView);
  });
  
});
