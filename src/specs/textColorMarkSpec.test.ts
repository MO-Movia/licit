import TextColorMarkSpec from './textColorMarkSpec'; // Adjust the import path as needed
import toCSSColor from '../toCSSColor'; // Adjust the import path as needed
import { Mark } from 'prosemirror-model';

// Mocking toCSSColor function for testing purposes
jest.mock('../toCSSColor', () => jest.fn());

describe('TextColorMarkSpec', () => {

  describe('parseDOM', () => {
    it('should parse color style correctly', () => {
      const mockElement:any = {
        style: {
          color: 'rgb(255, 0, 0)', // Red color in RGB format
        },
      };

      (toCSSColor as jest.Mock).mockReturnValue('rgb(255, 0, 0)'); // Mock the toCSSColor return value

      const result = TextColorMarkSpec.parseDOM[0].getAttrs(mockElement.style.color);

      expect(result).toEqual({ color: 'rgb(255, 0, 0)' });
      expect(toCSSColor).toHaveBeenCalledWith('rgb(255, 0, 0)');
    });

  });

  describe('toDOM', () => {
    it('should generate a <span> element with the correct color style', () => {
      const mockMark:any = {
        attrs: {
          color: 'rgb(255, 0, 0)', // Red color
        },
      };

      const result = TextColorMarkSpec.toDOM(mockMark,false);

      expect(result).toEqual(['span', { style: 'color: rgb(255, 0, 0);' }, 0]);
    });

    it('should generate a <span> element with no color style if no color is set', () => {
      const mockMark:any = {
        attrs: {
          color: '', // No color set
        },
      };

      const result = TextColorMarkSpec.toDOM(mockMark,false);

      expect(result).toEqual(['span', { style: '' }, 0]); // No color in style
    });
  });

});
