import * as React from 'react';
import * as ReactDOM from 'react-dom';

//  Mock PointerSurface to simulate click behavior
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  PointerSurface: (props: any) => (
    <div
      className={props.className}
      title={props.title}
      onClick={(e) => props.onClick && props.onClick('mock-value', e)}
      data-testid="pointer-surface"
    >
      {props.children}
    </div>
  ),
  preventEventDefault: jest.fn(),
}));

import CustomRadioButton from './customRadioButton';

describe('CustomRadioButton (pure Jest)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  });

  it('applies correct class names based on checked and inline props', () => {
    ReactDOM.render(<CustomRadioButton checked inline />, container);
    const pointerSurface = container.querySelector('.czi-custom-radio-button');
    expect(pointerSurface).not.toBeNull();
    expect(pointerSurface!.classList.contains('checked')).toBe(true);
    expect(pointerSurface!.classList.contains('inline')).toBe(true);
  });

  it('renders a radio input element', () => {
    ReactDOM.render(<CustomRadioButton />, container);
    const input = container.querySelector('input[type="radio"]');
    expect(input).not.toBeNull();
    expect(input!.classList.contains('czi-custom-radio-button-input')).toBe(true);
  });

  it('disables the radio button when disabled prop is passed', () => {
    ReactDOM.render(<CustomRadioButton disabled />, container);
    const input = container.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('applies the title prop to PointerSurface', () => {
    ReactDOM.render(<CustomRadioButton title="Test Title" />, container);
    const surface = container.querySelector('[title="Test Title"]');
    expect(surface).not.toBeNull();
  });

  it('renders the label correctly', () => {
    ReactDOM.render(<CustomRadioButton label="Test Label" />, container);
    const labelEl = container.querySelector('.czi-custom-radio-button-label');
    expect(labelEl).not.toBeNull();
    expect(labelEl!.textContent).toBe('Test Label');
  });

  it('calls onSelect handler when clicked', () => {
    const handleSelect = jest.fn();
    ReactDOM.render(<CustomRadioButton onSelect={handleSelect} />, container);
    const surface = container.querySelector('[data-testid="pointer-surface"]') as HTMLElement;
    surface.click();
    expect(handleSelect).toHaveBeenCalled();
  });
});
