import LinkURLEditor from './linkURLEditor';
import sanitizeURL from '../sanitizeURL';
import {SyntheticEvent} from 'react';

jest.mock('../sanitizeURL', () => jest.fn((url) => `sanitized:${url}`));

jest.mock('@modusoperandi/licit-ui-commands', () => ({
  CustomButton: 'CustomButton',
  preventEventDefault: jest.fn((e?: Event) => e?.preventDefault?.()),
}));

jest.mock('@modusoperandi/licit-doc-attrs-step', () => ({
  UICommand: {theme: 'dark'},
}));

describe('LinkURLEditor (pure Jest tests)', () => {
  let mockProps: LinkURLEditor['props'];

  beforeEach(() => {
    mockProps = {
      href: '',
      close: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should render the main structure correctly', () => {
    const instance = new LinkURLEditor(mockProps);
    const result = instance.render();

    expect(result.type).toBe('div');
    expect(result.props.className).toContain('czi-image-url-editor dark');
  });

  it('should update state on _onURLChange', () => {
    const instance = new LinkURLEditor(mockProps);

    //  manually spy on setState to simulate synchronous update
    const setStateSpy = jest
      .spyOn(instance, 'setState')
      .mockImplementation((update: jest.SpyInstance) => {
        instance.state = {...instance.state, ...update};
      });

    const event = {
      target: {value: 'http://example.com'},
    } as unknown as SyntheticEvent<Element, Event>;
    instance._onURLChange(event);

    expect(setStateSpy).toHaveBeenCalledWith({url: 'http://example.com'});
    expect(instance.state.url).toBe('http://example.com');

    setStateSpy.mockRestore();
  });

  it('should call close() on _cancel', () => {
    const instance = new LinkURLEditor(mockProps);
    instance._cancel();
    expect(mockProps.close).toHaveBeenCalled();
  });

  it('should sanitize and call close() with sanitized URL on _apply', () => {
    const instance = new LinkURLEditor(mockProps);

    //  force the state manually (no React lifecycle)
    instance.state = {url: 'http://good.com'};

    instance._apply();
    expect(sanitizeURL).toHaveBeenCalledWith('http://good.com');
    expect(mockProps.close).toHaveBeenCalledWith('sanitized:http://good.com');
  });

  it('should not call close() when URL has spaces in _apply', () => {
    const instance = new LinkURLEditor(mockProps);
    instance.state = {url: 'bad url'};
    instance._apply();
    expect(mockProps.close).not.toHaveBeenCalled();
  });

  it('should prevent default and apply on Enter key', () => {
    const instance = new LinkURLEditor(mockProps);
    const preventDefault = jest.fn();
    const applySpy = jest.spyOn(instance, '_apply');
    const event = {
      key: 'Enter',
      preventDefault,
    } as unknown as React.KeyboardEvent;
    instance._onKeyDown(event);
    expect(preventDefault).toHaveBeenCalled();
    expect(applySpy).toHaveBeenCalled();
  });

  it('should not trigger _apply for non-Enter key', () => {
    const instance = new LinkURLEditor(mockProps);
    const applySpy = jest.spyOn(instance, '_apply');
    const event = {
      key: 'A',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;
    instance._onKeyDown(event);
    expect(applySpy).not.toHaveBeenCalled();
  });
});
