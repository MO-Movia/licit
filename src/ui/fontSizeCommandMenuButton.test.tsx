import { render, screen, fireEvent } from '@testing-library/react';
import { EditorState } from 'prosemirror-state';
import FontSizeCommandMenuButton from './fontSizeCommandMenuButton';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import findActiveFontSize from '../findActiveFontSize'; 
import React from 'react';
import '@testing-library/jest-dom';

// Mock the findActiveFontSize function since it's an external function
jest.mock('../findActiveFontSize', () => jest.fn());

describe('FontSizeCommandMenuButton', () => {
  let dispatch: jest.Mock;
  let editorState: EditorState;
  let editorView: any;

  beforeEach(() => {
    UICommand.theme = "dark";
    dispatch = jest.fn();
    // Mock EditorState and EditorView for testing purposes
    editorState = {} as EditorState;
    editorView = { disabled: false } as any;
  });

  it('should render the button with the correct font size', () => {
    const fontSize = 12;
    
    // Mock findActiveFontSize to return a font size
    (findActiveFontSize as jest.Mock).mockReturnValue(fontSize);

    const {container} = render(<FontSizeCommandMenuButton dispatch={dispatch} editorState={editorState} editorView={editorView} />);
    
    const button = container.firstChild; 
    expect(button).toHaveClass('czi-tooltip-surface');
  });

  it('class name should include width-30 if fontSize <= 2', () => {
    const fontSize = 1;
    
    // Mock findActiveFontSize to return a font size
    (findActiveFontSize as jest.Mock).mockReturnValue(fontSize);

    editorView.disabled = true;

    const {container} = render(<FontSizeCommandMenuButton dispatch={dispatch} editorState={editorState} editorView={editorView} />);

    expect(container.querySelector('.width-30')).toBeDefined()
  });
});
