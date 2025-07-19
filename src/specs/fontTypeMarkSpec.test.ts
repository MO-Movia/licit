import { Mark } from 'prosemirror-model';
import FontTypeMarkSpec, { FONT_TYPE_NAMES } from './fontTypeMarkSpec';

describe('FontTypeMarkSpec', () => {
  describe('parseDOM', () => {
    it('should return empty name attribute when font-family is not provided', () => {
      expect(FontTypeMarkSpec.parseDOM[0].getAttrs('' as any)).toEqual({ name: '' });
    });

    it('should return correct name attribute when valid font-family is provided', () => {
      expect(FontTypeMarkSpec.parseDOM[0].getAttrs('Arial' as any)).toEqual({ name: 'Arial' });
    });

    it('should remove quotes from font-family names', () => {
      expect(FontTypeMarkSpec.parseDOM[0].getAttrs('"Courier New"' as any)).toEqual({ name: 'Courier New' });
    });
  });

  describe('toDOM', () => {
    it('should return correct DOM structure when name is provided', () => {
      const mark = { attrs: { name: 'Tahoma' } }  as any;
      expect(FontTypeMarkSpec.toDOM(mark,false)).toEqual([
        'span',
        { style: 'font-family: Tahoma' },
        0,
      ]);
    });

    it('should return correct DOM structure when name is empty', () => {
      const mark = { attrs: { name: '' } }  as any;
      expect(FontTypeMarkSpec.toDOM(mark,false)).toEqual(['span', { style: '' }, 0]);
    });
  });

  describe('FONT_TYPE_NAMES', () => {
    it('should contain predefined font names', () => {
      expect(FONT_TYPE_NAMES).toContain('Arial');
      expect(FONT_TYPE_NAMES).toContain('Times New Roman');
      expect(FONT_TYPE_NAMES).toContain('Verdana');
    });
  });

});
