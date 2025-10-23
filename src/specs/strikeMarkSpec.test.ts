import { Mark } from '@tiptap/react';
import StrikeMarkSpec from './strikeMarkSpec';

describe('StrikeMarkSpec', () => {
  describe('parseDOM', () => {
    it('should return null for line-through style', () => {
      const result = StrikeMarkSpec.parseDOM[0].getAttrs('line-through' as any);
      expect(result).toBeNull();
    });

    it('should return false for non-line-through styles', () => {
      const result = StrikeMarkSpec.parseDOM[0].getAttrs('underline' as any);
      expect(result).toBe(false);
    });

    it('should return false for missing style', () => {
      const result = StrikeMarkSpec.parseDOM[0].getAttrs(null);
      expect(result).toBe(false);
    });
  });

  describe('toDOM', () => {
    it('should return the correct DOM structure for the strike-through', () => {
      const result = StrikeMarkSpec.toDOM({} as any, false);
      expect(result).toEqual(['span', { style: 'text-decoration: line-through' }, 0]);
    });
  });
});
