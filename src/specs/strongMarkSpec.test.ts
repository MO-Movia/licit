import StrongMarkSpec from './strongMarkSpec'; // Adjust the import path as needed
import { Mark } from 'prosemirror-model';

describe('StrongMarkSpec', () => {

  describe('parseDOM', () => {

    it('should parse <b> tags with non-normal font weight correctly', () => {
      const mockBElement:any = {
        tag: 'b',
        style: {
          fontWeight: 'bold', // Non-normal font weight
        },
      };

      const result = StrongMarkSpec.parseDOM[1].getAttrs(mockBElement);

      expect(result).toBeNull();
    });

    it('should ignore <b> tags with normal font weight', () => {
      const mockBElement:any = {
        tag: 'b',
        style: {
          fontWeight: 'normal', // Normal font weight
        },
      };

      const result = StrongMarkSpec.parseDOM[1].getAttrs(mockBElement);

      expect(result).toBeFalsy(); 
    });

    it('should parse style font-weight with bold or similar value', () => {
        const mockElement : any = {
            style: {
              fontWeight: 'bold',
            },
          };

      const result = StrongMarkSpec.parseDOM[2].getAttrs(mockElement.style.fontWeight);

      expect(result).toBeNull(); // Should return null when the style is a valid bold pattern
    });

    it('should ignore invalid font-weight style', () => {
      const mockElement:any = {
        style: {
          fontWeight: 'italic', // Invalid value
        },
      };

      const result = StrongMarkSpec.parseDOM[2].getAttrs(mockElement);

      expect(result).toBeFalsy(); // Should return false for invalid font-weight style
    });
  });

  describe('toDOM', () => {
    it('should generate <strong> element', () => {
      const mockMark = {} as Mark;

      const result = StrongMarkSpec.toDOM(mockMark,false);

      expect(result).toEqual(['strong', 0]);
    });
  });

});
