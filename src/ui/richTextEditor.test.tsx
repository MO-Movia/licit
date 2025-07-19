// RichTextEditor.test.tsx

import React from 'react';
import { render, screen} from '@testing-library/react';
import RichTextEditor from './RichTextEditor'; // Adjust the path accordingly
import { Editor } from '@tiptap/react';
import '@testing-library/jest-dom';
import { EditorState } from 'prosemirror-state';

// Mock uuid function
jest.mock('./uuid', () => jest.fn(() => 'mocked-uuid'));
// Mock the findActiveFontSize function since it's an external function
jest.mock('../findActiveFontSize', () => jest.fn().mockReturnValue(12));

jest.mock('./editorFrameset', () => {
  return jest.fn(() => (
    <div className="mock-editor-frameset">
      Mocked EditorFrameset
    </div>
  ));
});

jest.mock('./editorToolbar', () => {
  return jest.fn(() => (
    <div className="czi-editor-toolbar">
      Mocked EditorToolbar
    </div>
  ));
});

describe('RichTextEditor', () => {
  afterEach(() => {
    //cleanup();
  });
const state = {
  selection: {
    node: null,
    anchor: 0,
    head: 0,
    from: 1,
    to: 2,
  },
  plugins: [],
  tr: {
    doc: {
      nodeAt: (_x) => {
        return {isAtom: true, isLeaf: true, isText: false};
      },
    },
  },
} as unknown as EditorState;
  const defaultProps = {
    editor: { view: { dispatch: jest.fn() } } as unknown as Editor,
    editorState: state,
    toolbarConfig: {},
    readOnly: false,
    disabled: false,
    height: 200,
    width: 300,
    onReady: jest.fn(),
  };

  

  it('should render the editor with correct components', () => {
    render(<RichTextEditor {...defaultProps} />);

    // Check if the mocked components render correctly
    expect(screen.getByText('Mocked EditorFrameset')).toBeInTheDocument();
  });

  it('should render the editor with correct components even if it is read only', () => {
    const propsWithReadOnly = {
      ...defaultProps,
      readOnly: true,
    };
    render(<RichTextEditor {...propsWithReadOnly} />);

    // Check if the mocked components render correctly
    expect(screen.getByText('Mocked EditorFrameset')).toBeInTheDocument();
  });

  it('should call the onReady function when editorView is set', () => {
    const mockOnReady = jest.fn();
    const propsWithOnReady = {
      ...defaultProps,
      onReady: mockOnReady,
    };

   let viewInstance = new RichTextEditor(propsWithOnReady, {});
   const {view} = {} as Editor;;
    // Simulate setting editorView
    const editorView = view ; // Mocked editorView
   viewInstance._onReady(editorView);

    // Check if onReady was called
    expect(mockOnReady).toHaveBeenCalledWith(editorView);
  });

  it('should dispatch a transaction when _dispatchTransaction is called', () => {
    const dispatchTransactionMock = jest.fn();
    const propsWithDispatchTransaction = {
      ...defaultProps,
      editor: { view: { dispatch: dispatchTransactionMock } } as unknown as Editor,
    };

    let viewInstance = new RichTextEditor(propsWithDispatchTransaction, {});

    viewInstance._dispatchTransaction(state.tr);

    expect(dispatchTransactionMock).toHaveBeenCalled();
  });
});
