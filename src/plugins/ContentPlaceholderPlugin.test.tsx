/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorView } from 'prosemirror-view';
import { PluginKey } from 'prosemirror-state';
import ContentPlaceholderPlugin from './contentPlaceholderPlugin';
import isEditorStateEmpty from '../isEditorStateEmpty';
import ReactDOM from 'react-dom';
import * as React from 'react';

jest.mock('../isEditorStateEmpty');
jest.mock('react-dom', (): typeof import('react-dom') => ({
  ...jest.requireActual('react-dom'),
  render: jest.fn(),
  unmountComponentAtNode: jest.fn(),
}));

interface EditorViewWithPlaceholder extends EditorView {
  placeholder?: string;
}

describe('ContentPlaceholderPlugin', () => {
  let editorViewMock: EditorViewWithPlaceholder;
  let mockEl: HTMLElement;

  beforeEach(() => {
    const parentDiv = document.createElement('div');
    const dom = document.createElement('div');
    parentDiv.appendChild(dom);
    document.body.appendChild(parentDiv);

    mockEl = document.createElement('div');
    mockEl.className = 'czi-editor-content-placeholder';
    document.body.appendChild(mockEl);

    editorViewMock = {
      dom,
      state: {},
      docView: {
        dom: document.createElement('div'),
      },
      placeholder: 'Type something...', // Ensure placeholder is set
    } as unknown as EditorViewWithPlaceholder;

    (isEditorStateEmpty as jest.Mock).mockClear();
    (ReactDOM.render as jest.Mock).mockClear();
    (ReactDOM.unmountComponentAtNode as jest.Mock).mockClear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should initialize the ContentPlaceholderPlugin', () => {
    const plugin = new ContentPlaceholderPlugin();
    expect(plugin.spec.key).toBeInstanceOf(PluginKey);
  });

  it('should display the placeholder when the editor is empty and not focused', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

  const plugin = new ContentPlaceholderPlugin();

  // Define a proper interface for the plugin view
  interface PlaceholderView {
    update: (view: EditorView) => void;
    destroy: () => void;
    _el?: HTMLElement | null;
    _focused?: boolean;
    _getBodyElement?: () => HTMLElement | null;
    _onFocus?: () => void;
    _onBlur?: () => void;
  }

  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;

  // Ensure `_el` exists before calling `update()`
  viewInstance._el = mockEl;
  document.body.appendChild(mockEl);

  // Ensure placeholder is set
  (editorViewMock as { placeholder: string }).placeholder = 'Type something...';

  // Force `_getBodyElement()` to return a valid element
  viewInstance._getBodyElement = jest.fn(() => document.createElement('div'));

  // Attach `_el` to editor DOM before calling `update()`
  editorViewMock.dom.appendChild(mockEl);

  // Trigger `update()`
  viewInstance.update(editorViewMock);

  // Ensure `ReactDOM.render` was called
  expect(ReactDOM.render).toHaveBeenCalledTimes(1);
  expect(ReactDOM.render).toHaveBeenCalledWith(
    React.createElement('div', null, 'Type something...'),
    mockEl
  );
  expect(mockEl.style.display).toBe('block');
});


  it('should exit update() early if _el is null', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

  const plugin = new ContentPlaceholderPlugin();
  interface PlaceholderView {
    update: (view: EditorView) => void;
    destroy: () => void;
    _el?: HTMLElement | null;
    _getBodyElement?: () => HTMLElement | null;
  }

  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;

  // Explicitly set _el to null
  viewInstance._el = null;

  // Call update safely
  viewInstance.update(editorViewMock);

  // Ensure ReactDOM.render was NOT called
  expect(ReactDOM.render).not.toHaveBeenCalled();
});


  it('should hide placeholder when editor is focused or not empty', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(false); // Simulate non-empty editor

  const plugin = new ContentPlaceholderPlugin();
  interface PlaceholderView {
    update: (view: EditorView) => void;
    destroy: () => void;
    _el?: HTMLElement | null;
    _focused?: boolean;
  }
  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  viewInstance._focused = true;
  viewInstance._el = mockEl;
  viewInstance.update(editorViewMock);

  expect(ReactDOM.render).not.toHaveBeenCalled();
});


  it('should not show placeholder if editor contains content', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(false);

  const plugin = new ContentPlaceholderPlugin();

  // Define an interface for the plugin view
  interface PlaceholderView {
    update: (view: EditorView) => void;
    destroy: () => void;
    _el?: HTMLElement | null;
  }
  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  viewInstance._el = mockEl;
  viewInstance.update(editorViewMock);
  expect(ReactDOM.render).not.toHaveBeenCalled();
});


it('should hide the placeholder when the editor is focused', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(true);
  const plugin = new ContentPlaceholderPlugin();
  interface PlaceholderView {
    _onFocus: () => void;
    _el: HTMLElement;
  }
  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  viewInstance._el = document.createElement('div');
  viewInstance._el.style.display = 'block';
  viewInstance._onFocus();
  expect(viewInstance._el.style.display).toBe('none');
});


  it('should clean up properly on destroy', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

  const plugin = new ContentPlaceholderPlugin();
  interface PlaceholderView {
    _el: HTMLElement;
    destroy: () => void;  }

  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  viewInstance._el = mockEl;
  viewInstance.destroy();

  expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(mockEl);
  expect(document.body.contains(mockEl)).toBe(false);
});


  it('should not show placeholder if there is no parent element', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

  const plugin = new ContentPlaceholderPlugin();
  interface PlaceholderView {
    _el: HTMLElement;
    update: (view: EditorView) => void;
  }
  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  viewInstance._el = document.createElement('div');
  viewInstance.update(editorViewMock);

  expect(ReactDOM.render).not.toHaveBeenCalled();
});


  it('should not render placeholder if _el is invalid', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

  const plugin = new ContentPlaceholderPlugin();
  interface PlaceholderView {
    _el?: HTMLElement;
    update: (view: EditorView) => void;
  }
  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  viewInstance._el = undefined;
  viewInstance.update(editorViewMock);

  expect(ReactDOM.render).not.toHaveBeenCalled();
});


 it('should not render placeholder if _el has no parent', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

  const plugin = new ContentPlaceholderPlugin();
  interface PlaceholderView {
    _el: HTMLElement;
    update: (view: EditorView) => void;
  }
  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  viewInstance._el = document.createElement('div');
  viewInstance.update(editorViewMock);

  expect(ReactDOM.render).not.toHaveBeenCalled();
});


  it('should not render placeholder if _el does not exist', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

  const plugin = new ContentPlaceholderPlugin();

  interface PlaceholderView {
    _el: HTMLElement | null;
    update: (view: EditorView) => void;
  }
  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  viewInstance._el = null;
  viewInstance.update(editorViewMock);

  expect(ReactDOM.render).not.toHaveBeenCalled();
});


it('should not render placeholder if _getBodyElement() returns null', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

  const plugin = new ContentPlaceholderPlugin();
  interface PlaceholderView {
    _el: HTMLElement;
    _getBodyElement: () => HTMLElement | null;
    update: (view: EditorView) => void;
  }
  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  viewInstance._el = mockEl;
  viewInstance._getBodyElement = jest.fn(() => null);
  viewInstance.update(editorViewMock);

  expect(ReactDOM.render).not.toHaveBeenCalled();
});


it('should unmount component when _el is removed from the DOM', () => {
  const plugin = new ContentPlaceholderPlugin();
  interface PlaceholderView {
    _el: HTMLElement;
    destroy: () => void;
  }
  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  viewInstance._el = mockEl;
  document.body.appendChild(mockEl);
  document.body.removeChild(mockEl);
  viewInstance.destroy();

  expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(mockEl);
});


  it('should trigger _onBlur if activeElement is outside bodyEl', () => {
  (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

  const plugin = new ContentPlaceholderPlugin();
  interface PlaceholderView {
    _getBodyElement: () => HTMLElement;
    _focused: boolean;
    update: (view: typeof editorViewMock) => void;
  }

  const viewInstance = plugin.spec.view(editorViewMock) as unknown as PlaceholderView;
  const bodyEl = document.createElement('div');
  const outsideElement = document.createElement('input');
  document.body.appendChild(bodyEl);
  document.body.appendChild(outsideElement);
  viewInstance._getBodyElement = jest.fn(() => bodyEl);
  outsideElement.focus();
  viewInstance.update(editorViewMock);

  expect(viewInstance._focused).toBe(false);
  document.body.removeChild(outsideElement);
});

});
