import TextHighlightMarkSpec from './textHighlightMarkSpec'; // Adjust the import path as needed
import { toCSSColor, isTransparent } from '../toCSSColor'; // Adjust the import path as needed
import { Mark } from 'prosemirror-model';

// Mocking `toCSSColor` and `isTransparent` for testing purposes
jest.mock('../toCSSColor', () => ({
  toCSSColor: jest.fn(),
  isTransparent: jest.fn(),
}));

describe('TextHighlightMarkSpec', () => {

  describe('parseDOM', () => {
    it('should parse background-color and return highlightColor', () => {
      const mockElement = {
        style: {
          backgroundColor: 'rgb(255, 255, 0)', // Yellow background color
        },
      } as any;

      // Mock the toCSSColor function to return the same value for simplicity
      (toCSSColor as jest.Mock).mockReturnValue('rgb(255, 255, 0)');
      (isTransparent as jest.Mock).mockReturnValue(false); // It is not transparent

      const result = TextHighlightMarkSpec.parseDOM[0].getAttrs(mockElement);

      expect(result).toEqual({ highlightColor: 'rgb(255, 255, 0)' });
      expect(toCSSColor).toHaveBeenCalledWith('rgb(255, 255, 0)');
      expect(isTransparent).toHaveBeenCalledWith('rgb(255, 255, 0)');
    });

    it('should return empty highlightColor for transparent background', () => {
      const mockElement = {
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent background
        },
      } as any;

      (toCSSColor as jest.Mock).mockReturnValue('rgba(0, 0, 0, 0)'); // Transparent
      (isTransparent as jest.Mock).mockReturnValue(true); // Transparent color

      const result = TextHighlightMarkSpec.parseDOM[0].getAttrs(mockElement);

      expect(result).toEqual({ highlightColor: '' });
      expect(toCSSColor).toHaveBeenCalledWith('rgba(0, 0, 0, 0)');
      expect(isTransparent).toHaveBeenCalledWith('rgba(0, 0, 0, 0)');
    });

    it('should return empty highlightColor if background-color is empty', () => {
      const mockElement = {
        style: {
          backgroundColor: '', // No background-color
        },
      } as any;

      const result = TextHighlightMarkSpec.parseDOM[0].getAttrs(mockElement);

      expect(result).toEqual({ highlightColor: '' });
    });
  });

  describe('toDOM', () => {
    it('should generate a <span> element with the correct background-color style', () => {
      const mockMark = {
        attrs: {
          highlightColor: 'rgb(255, 255, 0)', // Yellow background color
        },
      } as any;

      const result = TextHighlightMarkSpec.toDOM(mockMark,false);

      expect(result).toEqual(['span', { style: 'background-color: rgb(255, 255, 0);' }, 0]);
    });

    it('should generate a <span> element with no background-color if no highlightColor is set', () => {
      const mockMark = {
        attrs: {
          highlightColor: '', // No highlight color
        },
      } as any;

      const result = TextHighlightMarkSpec.toDOM(mockMark, false);

      expect(result).toEqual(['span', { style: '' }, 0]); // No background color in style
    });
  });

});
