import * as React from 'react';
import * as ReactDOM from 'react-dom';
import DocLayoutEditor, { DocLayoutEditorValue } from './docLayoutEditor';
import { LAYOUT } from '../constants';


describe('DocLayoutEditor (pure Jest)', () => {
  let container: HTMLDivElement;
  let closeMock: jest.Mock;

  beforeEach(() => {
    closeMock = jest.fn();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  const renderPure = (element: React.ReactElement) => {
    ReactDOM.render(element, container);
    return container;
  };

  it('renders radio buttons for layout options', () => {
    renderPure(<DocLayoutEditor close={closeMock} />);
    const html = container.innerHTML;
    expect(html).toContain('US Letter - Portrait');
    expect(html).toContain('US Letter - Landscape');
    expect(html).toContain('A4 - Portrait');
    expect(html).toContain('A4 - Landscape');
  });

  it('selects correct layout from initialValue', () => {
    renderPure(
      <DocLayoutEditor
        initialValue={{ layout: LAYOUT.A4_PORTRAIT }}
        close={closeMock}
      />
    );
    const html = container.innerHTML;
    expect(html).toContain('A4 - Portrait');
  });

  it('creates CustomRadioButton when width is provided', () => {
    renderPure(
      <DocLayoutEditor
        initialValue={{ layout: LAYOUT.A4_PORTRAIT, width: 500 }}
        close={closeMock}
      />
    );
    const html = container.innerHTML;
    expect(html).toContain('A4 - Portrait');
    expect(html).toContain('Custom width: 500pt');
  });

  it('_onSelect should change selectedValue in state', () => {
    const comp = new DocLayoutEditor({
      initialValue: { layout: LAYOUT.A4_PORTRAIT },
      close: closeMock,
    });
    comp._onSelect(LAYOUT.A4_PORTRAIT);
    expect(comp.state.selectedValue).toBe(LAYOUT.A4_PORTRAIT);
  });

  it('_cancel should call close()', () => {
    const comp = new DocLayoutEditor({
      initialValue: { layout: LAYOUT.A4_PORTRAIT },
      close: closeMock,
    });
    comp._cancel();
    expect(closeMock).toHaveBeenCalled();
  });

  it('_apply should call close() with layout value', () => {
    const comp = new DocLayoutEditor({
      initialValue: { layout: LAYOUT.A4_PORTRAIT },
      close: closeMock,
    });
    comp._apply();
    expect(closeMock).toHaveBeenCalledWith({
      width: null,
      layout: LAYOUT.A4_PORTRAIT,
    });
  });

  it('_apply should call close() with width value', () => {
    const comp = new DocLayoutEditor({
      initialValue: { width: 500 },
      close: closeMock,
    });
    comp._apply();
    expect(closeMock).toHaveBeenCalledWith({
      width: 500,
      layout: null,
    });
  });

  it('propsTypes.close should return an Error if invalid', () => {
    const propName = 'close';
    const output = new Error(
      `${propName}must be a function with 1 arg of type DocLayoutEditorValue`
    );

    const result = DocLayoutEditor.propsTypes.close(
      { initialValue: { width: 500 }, close: (_val?: DocLayoutEditorValue) => {} },
      'close'
    );

    expect(result).toEqual(output);
  });

  it('renders Cancel and Apply buttons', () => {
    renderPure(<DocLayoutEditor close={closeMock} />);
    const html = container.innerHTML;
    expect(html).toContain('Cancel');
    expect(html).toContain('Apply');
  });
});
