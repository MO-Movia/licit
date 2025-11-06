import { parseLabel, isExpandButton, MORE } from './editorToolbarConfig';
import Icon from './icon';

describe('Utility functions', () => {
  describe('parseLabel', () => {
    it('should return the correct parsed label and icon when the pattern matches', () => {
      const input = '[format_bold] Bold';
      const theme = 'dark';

      const result = parseLabel(input, theme);

      expect(result.icon).toEqual(Icon.get('[format_bold] Bold', null, theme));
      expect(result.title).toBe('format_bold');
    });

    it('should return null for icon and the input as title if no match is found', () => {
      const input = 'Plain text';
      const theme = 'light';

      const result = parseLabel(input, theme);

      expect(result.icon).toBeNull();
      expect(result.title).toBe('Plain text');
    });

    it('should return null for icon and the input is empty', () => {
      const input = '';
      const theme = '';

      const result = parseLabel(input, theme);

      expect(result.icon).toBeNull();
      expect(result.title).toBeNull();
    });

  });

  describe('isExpandButton', () => {
    it('should return true for the title "Expand"', () => {
      const result = isExpandButton('Expand');
      expect(result).toBe(true);
    });

    it('should return false for any other title', () => {
      const result = isExpandButton('Collapse');
      expect(result).toBe(false);
    });

    it('should return false for an empty title', () => {
      const result = isExpandButton('');
      expect(result).toBe(false);
    });
  });

  describe('Constants', () => {
    it('should export the MORE constant', () => {
      expect(MORE).toBe(' More');
    });
  });
});
