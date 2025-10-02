import TextHighlightMarkSpec from './textHighlightMarkSpec';
import { toCSSColor, isTransparent } from '../toCSSColor';

jest.mock('../toCSSColor', () => ({
  toCSSColor: jest.fn(),
  isTransparent: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe('TextHighlightMarkSpec', () => {
  describe('parseDOM', () => {
    it('parses non-transparent background and overridden="true"', () => {
      const el = document.createElement('span');
      el.style.backgroundColor = 'rgb(255, 255, 0)';
      el.setAttribute('overridden', 'true');

      (toCSSColor as jest.Mock).mockReturnValue('rgb(255, 255, 0)');
      (isTransparent as jest.Mock).mockReturnValue(false);

      const out = TextHighlightMarkSpec.parseDOM[0].getAttrs(el as any);
      expect(out).toEqual({
        highlightColor: 'rgb(255, 255, 0)',
        overridden: true,
      });
    });

    it('parses transparent background and overridden="false"', () => {
      const el = document.createElement('span');
      el.style.backgroundColor = 'rgba(0,0,0,0)';
      el.setAttribute('overridden', 'false');

      (toCSSColor as jest.Mock).mockReturnValue('rgba(0,0,0,0)');
      (isTransparent as jest.Mock).mockReturnValue(true);

      const out = TextHighlightMarkSpec.parseDOM[0].getAttrs(el as any);
      expect(out).toEqual({ highlightColor: '', overridden: false });
    });

    it('defaults overridden=false when attribute missing', () => {
      const el = document.createElement('span');
      el.style.backgroundColor = 'rgb(0, 255, 0)';

      (toCSSColor as jest.Mock).mockReturnValue('rgb(0, 255, 0)');
      (isTransparent as jest.Mock).mockReturnValue(false);

      const out = TextHighlightMarkSpec.parseDOM[0].getAttrs(el as any);
      expect(out).toEqual({
        highlightColor: 'rgb(0, 255, 0)',
        overridden: false,
      });
    });
  });

  describe('toDOM', () => {
    it('emits style when highlightColor is set and overridden=true', () => {
      const mark = {
        attrs: { highlightColor: '#ff0', overridden: true },
      } as any;
      const out = TextHighlightMarkSpec.toDOM!(mark, false);
      expect(out).toEqual([
        'span',
        { style: 'background-color: #ff0;', overridden: 'true' },
        0,
      ]);
    });

    it('omits style when highlightColor is empty and overridden=false', () => {
      const mark = { attrs: { highlightColor: '', overridden: false } } as any;
      const out = TextHighlightMarkSpec.toDOM!(mark, false);
      expect(out).toEqual(['span', { style: '', overridden: 'false' }, 0]);
    });

    it('covers optional-chaining path when overridden is undefined', () => {
      const mark = { attrs: { highlightColor: 'rgb(1,2,3)' } } as any; // no overridden
      const out = TextHighlightMarkSpec.toDOM!(mark, false);
      // overridden?.toString() yields undefined: key exists with undefined value
      expect(out).toEqual([
        'span',
        { style: 'background-color: rgb(1,2,3);', overridden: undefined },
        0,
      ]);
    });
  });
});
