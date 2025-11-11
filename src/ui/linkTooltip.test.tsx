import LinkTooltip from './linkTooltip';
import { EditorView } from 'prosemirror-view';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import sanitizeURL from '../sanitizeURL';

// ---- Mock dependencies ----
jest.mock('smooth-scroll-into-view-if-needed', () => jest.fn(() => Promise.resolve()));
jest.mock('../sanitizeURL', () => jest.fn((url) => `sanitized:${url}`));
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  CustomButton: jest.fn((props) => ({ type: 'CustomButton', props })),
}));

describe('LinkTooltip (pure Jest tests)', () => {
    let mockProps: {
    href: string;
    editorView: EditorView;
    onCancel: jest.Mock;
    onEdit: jest.Mock;
    onRemove: jest.Mock;
  };
  let instance: LinkTooltip;

  beforeEach(() => {
    mockProps = {
      href: 'https://example.com',
      editorView: { dom: {} } as unknown as EditorView,
      onCancel: jest.fn(),
      onEdit: jest.fn(),
      onRemove: jest.fn(),
    };
    instance = new LinkTooltip(mockProps);
  });


  it('should call window.open with sanitized URL for normal links', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    instance._openLink('https://abc.com');

    expect(sanitizeURL).toHaveBeenCalledWith('https://abc.com');
    expect(openSpy).toHaveBeenCalledWith('sanitized:https://abc.com');
    openSpy.mockRestore();
  });

  it('should scroll to element for bookmark links', () => {
    const element = { id: 'target' } as unknown as HTMLElement;
    const getElementByIdSpy = jest
      .spyOn(document, 'getElementById')
      .mockReturnValue(element);

     instance._openLink('#target');

    expect(mockProps.onCancel).toHaveBeenCalledWith(mockProps.editorView);
    expect(scrollIntoView).toHaveBeenCalledWith(element, expect.any(Object));
    getElementByIdSpy.mockRestore();
  });

  it('should not call anything if href is empty',  () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    instance._openLink('');
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });
});
