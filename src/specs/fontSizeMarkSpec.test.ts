import { Mark } from 'prosemirror-model';
import FontSizeMarkSpec from './fontSizeMarkSpec';
import { toClosestFontPtSize } from '../toClosestFontPtSize';

jest.mock('../toClosestFontPtSize', () => ({
  toClosestFontPtSize: jest.fn(),
}));

describe('FontSizeMarkSpec', () => {
  describe('parseDOM', () => {
    it('should return empty attrs when font-size is not provided', () => {
      expect(FontSizeMarkSpec.parseDOM[0].getAttrs('' as any)).toEqual({});
    });

    it('should return correct pt value when valid font-size is provided', () => {
      (toClosestFontPtSize as jest.Mock).mockReturnValue(12);
      expect(FontSizeMarkSpec.parseDOM[0].getAttrs('16px' as any)).toEqual({ pt: 12 });
    });

    it('should return empty attrs when toClosestFontPtSize returns null', () => {
      (toClosestFontPtSize as jest.Mock).mockReturnValue(null);
      expect(FontSizeMarkSpec.parseDOM[0].getAttrs('invalid' as any)).toEqual({});
    });
  });

  describe('toDOM', () => {
    it('should return correct DOM structure when pt is provided', () => {
      const mark = { attrs: { pt: 12 } } as any;
      expect(FontSizeMarkSpec.toDOM(mark,false)).toEqual([
        'span',
        { style: 'font-size: 12pt;', class: 'czi-font-size-mark' },
        0,
      ]);
    });

    it('should return correct DOM structure when pt is null', () => {
      const mark = { attrs: { pt: null } } as any;
      expect(FontSizeMarkSpec.toDOM(mark,false)).toEqual(['span', null, 0]);
    });
  });
});
