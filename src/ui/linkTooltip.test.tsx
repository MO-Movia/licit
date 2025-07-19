import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import LinkTooltip from './linkTooltip';
import { EditorView } from 'prosemirror-view';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import sanitizeURL from '../sanitizeURL';
import '@testing-library/jest-dom'; // For custom matchers like 'toBeInTheDocument'

// Mock external dependencies
jest.mock('smooth-scroll-into-view-if-needed', () => jest.fn());
jest.mock('../sanitizeURL', () => jest.fn().mockReturnValue('https://sanitized-url.com'));

describe('LinkTooltip Component', () => {
  const editorViewMock = {} as EditorView; // Mock the editorView
  const href = '#bookmark-id';
  const onCancel = jest.fn();
  const onEdit = jest.fn();
  const onRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.open to prevent actual opening of URLs in tests
    global.open = jest.fn();
  });

  it('should render the component with the correct href and buttons', () => {
    const { getByText, getByTitle } = render(
      <LinkTooltip
        editorView={editorViewMock}
        href={href}
        onCancel={onCancel}
        onEdit={onEdit}
        onRemove={onRemove}
      />
    );

    // Check if the href is displayed in the button label
    expect(getByText(href)).toBeInTheDocument();

    // Check if "Change" and "Remove" buttons are rendered
    expect(getByText('Change')).toBeInTheDocument();
    expect(getByText('Remove')).toBeInTheDocument();
  });

  it('should call onCancel and smooth scroll when clicking a bookmark link', async () => {
    let result = new LinkTooltip({
        editorView: editorViewMock,
        href:href,
        onCancel:onCancel,
        onEdit: onEdit,
        onRemove: onRemove
    });
    // Mock the document.getElementById to return an element
    const mockElement = document.createElement('div');
    document.getElementById = jest.fn().mockReturnValue(mockElement);

    // Simulate clicking the link button
    result._openLink(href);

    // Ensure that onCancel was called
    expect(onCancel).toHaveBeenCalledWith(editorViewMock);

    // Ensure that scrollIntoView was called with the correct parameters
    await expect(scrollIntoView).toHaveBeenCalledWith(mockElement, {
      scrollMode: 'if-needed',
      behavior: 'smooth',
    });
  });

  it('should call sanitizeURL if not bookmark', async () => {
    let newHref = 'https://sanitized-url.com';
    let result = new LinkTooltip({
     editorView: editorViewMock,
     href:newHref,
     onCancel:onCancel,
     onEdit: onEdit,
     onRemove: onRemove
 });


 // Simulate clicking the link button
 result._openLink(newHref);

expect(global.open).toHaveBeenCalledWith('https://sanitized-url.com');

});

});
