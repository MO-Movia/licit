import { EditorView } from 'prosemirror-view';
import Frag from './frag';
import RichTextEditor from './richTextEditor';
import { Transform } from 'prosemirror-transform';
import { EditorState } from 'prosemirror-state';
import { Editor } from '@tiptap/core';
import { ToolbarMenuConfig } from '@src/types';

// ? Define the props interface same as used by RichTextEditor
interface MockEditorFramesetProps {
  body: React.ReactElement;
  className?: string;
  embedded?: boolean;
  header?: string;
  height?: number;
  toolbar?: React.ReactElement;
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
  default: (props: Frag) => ({ type: 'Frag', props }),
}));
jest.mock('@tiptap/react', () => ({
  EditorContent: jest.fn((props) => ({ type: 'EditorContent', props })),
}));

jest.mock('./uuid', () => jest.fn(() => 'mock-uuid'));

describe('RichTextEditor (pure Jest tests)', () => {
  let mockProps: RichTextEditor['props'];

  beforeEach(() => {
    mockProps = {
      editor: {
        view: { dispatch: jest.fn() } as unknown as EditorView,
      } as unknown as Editor,
      editorState: {} as EditorState,
      editorView: {} as EditorView,
      readOnly: false,
      disabled: false,
      embedded: false,
      height: 500,
      width: 800,
      toolbarConfig: {} as ToolbarMenuConfig[],
    };
  });

 it('should dispatch transaction when _dispatchTransaction is called', () => {
    const instance = new RichTextEditor(mockProps, {});
    const mockTransform = new Transform(null as Transform['doc']);
    instance._dispatchTransaction(mockTransform);
    expect(mockProps.editor.view.dispatch).toHaveBeenCalled();
  });

  it('should set editorView and call onReady in _onReady', () => {
    const instance = new RichTextEditor(mockProps, {});
    const mockEditorView = { view: true } as unknown as EditorView;
    const onReady = jest.fn();
    instance.props.onReady = onReady;

    instance._onReady(mockEditorView);
    expect(instance.state.editorView).toBe(null);
    expect(onReady).toHaveBeenCalledWith(mockEditorView);
  });
  
});
