import * as React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import TableGridSizeEditor from './TableGridSizeEditor.js';

describe('TableGridSizeEditor custom dimensions', () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterAll(() => {
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function setInputValue(input, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    ).set;
    act(() => {
      valueSetter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  it('submits typed row and column values', () => {
    const close = jest.fn();
    act(() => root.render(<TableGridSizeEditor close={close} />));
    const rows = container.querySelector('input[aria-label="Rows"]');
    const cols = container.querySelector('input[aria-label="Columns"]');
    const form = container.querySelector('form');

    setInputValue(rows, '12');
    setInputValue(cols, '8');
    act(() => form.dispatchEvent(new Event('submit', { bubbles: true })));

    expect(close).toHaveBeenCalledWith({ rows: 12, cols: 8 });
  });

  it('prevents submission when a dimension is outside the allowed range', () => {
    const close = jest.fn();
    act(() => root.render(<TableGridSizeEditor close={close} />));
    const rows = container.querySelector('input[aria-label="Rows"]');
    const form = container.querySelector('form');

    setInputValue(rows, '101');
    act(() => form.dispatchEvent(new Event('submit', { bubbles: true })));

    expect(container.querySelector('button').disabled).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });
});
