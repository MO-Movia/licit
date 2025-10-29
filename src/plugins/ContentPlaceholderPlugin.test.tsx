import { EditorView } from 'prosemirror-view';
import { PluginKey } from 'prosemirror-state';
import ContentPlaceholderPlugin from './contentPlaceholderPlugin';
import isEditorStateEmpty from '../isEditorStateEmpty';
import ReactDOM from 'react-dom';
import * as React from 'react';

jest.mock('../isEditorStateEmpty');
jest.mock('react-dom', () => ({
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
      state: {} as any,
      docView: {
        dom: document.createElement('div'),
      },
      placeholder: 'Type something...', // ✅ Ensure placeholder is set
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
    const viewInstance = plugin.spec.view!(editorViewMock);

    // ✅ Ensure `_el` exists before calling `update()`
    (viewInstance as any)._el = mockEl;
    document.body.appendChild(mockEl);

    // ✅ Ensure placeholder is set
    (editorViewMock as any).placeholder = 'Type something...';

    // ✅ Force `_getBodyElement()` to return a valid element
    (viewInstance as any)._getBodyElement = jest.fn(() =>
      document.createElement('div')
    );

    // ✅ Attach `_el` to editor DOM before calling `update()`
    editorViewMock.dom.appendChild(mockEl);

    // ✅ Trigger `update()`
    (viewInstance as any).update(editorViewMock);

    // ✅ Ensure `ReactDOM.render` was called
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
    const viewInstance = plugin.spec.view!(editorViewMock);

    // ✅ Ensure `_el` is `null`
    (viewInstance as any)._el = null;

    (viewInstance as any).update(editorViewMock);

    // ✅ Ensure `ReactDOM.render` was NOT called
    expect(ReactDOM.render).not.toHaveBeenCalled();
  });

  it('should hide placeholder when editor is focused or not empty', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(false); // ✅ Simulate non-empty editor

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    // ✅ Simulate focused editor
    (viewInstance as any)._focused = true;
    (viewInstance as any)._el = mockEl;

    (viewInstance as any).update(editorViewMock);

    // ✅ Ensure `ReactDOM.render` was NOT called
    expect(ReactDOM.render).not.toHaveBeenCalled();
  });

  it('should not show placeholder if editor contains content', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(false);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    (viewInstance as any)._el = mockEl;

    // ✅ Trigger update
    (viewInstance as any).update(editorViewMock);

    // ✅ Ensure `ReactDOM.render` was NOT called
    expect(ReactDOM.render).not.toHaveBeenCalled();
  });

  it('should hide the placeholder when the editor is focused', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    (viewInstance as any)._onFocus();

    expect((viewInstance as any)._el.style.display).toBe('none');
  });

  it('should clean up properly on destroy', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    (viewInstance as any)._el = mockEl;

    (viewInstance as any).destroy();

    expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(mockEl);
    expect(document.body.contains(mockEl)).toBe(false);
  });

  it('should not render placeholder if _getBodyElement() returns null', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    // ✅ Ensure `_el` exists
    (viewInstance as any)._el = mockEl;

    // ✅ Force `_getBodyElement()` to return `null`
    (viewInstance as any)._getBodyElement = jest.fn(() => null);

    // ✅ Trigger `update()`
    (viewInstance as any).update(editorViewMock);

    // ✅ Ensure `ReactDOM.render` was NOT called
    expect(ReactDOM.render).not.toHaveBeenCalled();
  });

  it('should not show placeholder if there is no parent element', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    // ✅ Force `_el` to exist but have no parent
    (viewInstance as any)._el = document.createElement('div');

    // ✅ Trigger `update()`
    (viewInstance as any).update(editorViewMock);

    // ✅ Ensure `ReactDOM.render` was NOT called
    expect(ReactDOM.render).not.toHaveBeenCalled();
  });

  it('should not render placeholder if _el is invalid', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    // Set _el to an invalid value
    (viewInstance as any)._el = undefined;

    // Trigger update
    (viewInstance as any).update(editorViewMock);

    // Ensure render was NOT called
    expect(ReactDOM.render).not.toHaveBeenCalled();
  });

  it('should not render placeholder if _el has no parent', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    // Create _el without appending it to the DOM
    (viewInstance as any)._el = document.createElement('div');

    // Trigger update
    (viewInstance as any).update(editorViewMock);

    // Ensure render was NOT called
    expect(ReactDOM.render).not.toHaveBeenCalled();
  });

  it('should not render placeholder if _getBodyElement() returns null', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    // Mock _getBodyElement to return null
    (viewInstance as any)._el = mockEl;
    (viewInstance as any)._getBodyElement = jest.fn(() => null);

    // Trigger update
    (viewInstance as any).update(editorViewMock);

    // Ensure render was NOT called
    expect(ReactDOM.render).not.toHaveBeenCalled();
  });

  it('should not render placeholder if _el does not exist', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    // Simulate _el being null
    (viewInstance as any)._el = null;

    // Trigger update
    (viewInstance as any).update(editorViewMock);

    // Ensure ReactDOM.render was not called
    expect(ReactDOM.render).not.toHaveBeenCalled();
  });

  it('should not render placeholder if _getBodyElement() returns null', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    // Mock _getBodyElement to return null
    (viewInstance as any)._el = mockEl;
    (viewInstance as any)._getBodyElement = jest.fn(() => null);

    // Trigger update
    (viewInstance as any).update(editorViewMock);

    // Ensure ReactDOM.render was not called
    expect(ReactDOM.render).not.toHaveBeenCalled();
  });

  it('should unmount component when _el is removed from the DOM', () => {
    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    // Simulate valid _el and append to DOM
    (viewInstance as any)._el = mockEl;
    document.body.appendChild(mockEl);

    // Simulate element removal
    document.body.removeChild(mockEl);

    // Trigger destroy
    (viewInstance as any).destroy();

    // Ensure unmount happened
    expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalledWith(mockEl);
  });

  it('should trigger _onBlur if activeElement is outside bodyEl', () => {
    (isEditorStateEmpty as jest.Mock).mockReturnValue(true);

    const plugin = new ContentPlaceholderPlugin();
    const viewInstance = plugin.spec.view!(editorViewMock);

    // Create bodyEl and an outsideElement
    const bodyEl = document.createElement('div');
    const outsideElement = document.createElement('input');
    document.body.appendChild(bodyEl);
    document.body.appendChild(outsideElement);

    // Mock _getBodyElement to return bodyEl
    (viewInstance as any)._getBodyElement = jest.fn(() => bodyEl);

    // Focus the outside element to simulate blur
    outsideElement.focus();

    // Trigger update
    (viewInstance as any).update(editorViewMock);

    // Ensure the blur event triggered the state change
    expect((viewInstance as any)._focused).toBe(false);

    // Clean up
    document.body.removeChild(outsideElement);
  });
});
