import { render, screen, fireEvent } from '@testing-library/react';
import { EditorState } from 'prosemirror-state';
import FontTypeCommandMenuButton from './fontTypeCommandMenuButton';
import { FontTypeCommand } from '@modusoperandi/licit-ui-commands';
import findActiveFontType from '../findActiveFontType';
import React from 'react';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import '@testing-library/jest-dom';

// Mock the findActiveFontType function
jest.mock('../findActiveFontType', () => jest.fn());

describe('FontTypeCommandMenuButton', () => {
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

  it('should render the button with the correct font type label', () => {
    const fontType = 'Arial';
    
    // Mock findActiveFontType to return a font type
    (findActiveFontType as jest.Mock).mockReturnValue(fontType);

    const {getByText} = render(<FontTypeCommandMenuButton dispatch={dispatch} editorState={editorState} editorView={editorView} />);

    expect(getByText(fontType)).toBeInTheDocument();
  });

  it('should render the button with the correct font type label even if the view is disabled', () => {
    const fontType = 'Arial';
    
    // Mock findActiveFontType to return a font type
    (findActiveFontType as jest.Mock).mockReturnValue(fontType);

    editorView.disabled = true;

    const {getByText} = render(<FontTypeCommandMenuButton dispatch={dispatch} editorState={editorState} editorView={editorView} />);

    expect(getByText(fontType)).toBeInTheDocument();
  });


});
