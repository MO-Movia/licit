import {
  applyStoredTableStyles,
  applyTableStyle,
  hasTableStylePlugin,
  openTableStylePicker,
} from './TableStylePlugin.js';

describe('table style plugin bridge', () => {
  it('routes table style operations to an installed plugin', () => {
    const popup = { close: jest.fn() };
    const plugin = {
      applyStoredTableStyles: jest.fn((_state, tr) => ({ ...tr, stored: true })),
      applyTableStyle: jest.fn((_state, tr) => ({ ...tr, applied: true })),
      openTableStylePicker: jest.fn(() => popup),
    };
    const state = { plugins: [plugin] };
    const view = { state };
    const tr = {};

    expect(hasTableStylePlugin(state)).toBe(true);
    expect(applyTableStyle(state, tr, 4, 'Body Table')).toEqual({ applied: true });
    expect(applyStoredTableStyles(state, tr)).toEqual({ stored: true });
    expect(
      openTableStylePicker(view, { anchor: document.createElement('button') })
    ).toBe(popup);
    expect(plugin.openTableStylePicker).toHaveBeenCalledWith(
      expect.objectContaining({ view })
    );
  });

  it('leaves transactions unchanged when the styles plugin is absent', () => {
    const state = { plugins: [] };
    const tr = {};

    expect(hasTableStylePlugin(state)).toBe(false);
    expect(applyTableStyle(state, tr, 0, 'Normal')).toBe(tr);
    expect(applyStoredTableStyles(state, tr)).toBe(tr);
  });
});
