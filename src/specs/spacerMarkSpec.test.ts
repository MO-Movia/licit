import SpacerMarkSpec, { DOM_ATTRIBUTE_SIZE, SPACER_SIZE_TAB } from './spacerMarkSpec'; // Adjust the import path

describe('SpacerMarkSpec', () => {

  describe('parseDOM', () => {
    it('should correctly parse the size attribute from a span element', () => {
      // Mock the span element with the 'data-spacer-size' attribute
      const mockSpanElement: any = {
        getAttribute: jest.fn((attr: string) => {
          if (attr === DOM_ATTRIBUTE_SIZE) {
            return SPACER_SIZE_TAB; // Return the mocked value for size
          }
          return null;
        }),
      };

      const result = SpacerMarkSpec.parseDOM[0].getAttrs(mockSpanElement);

      expect(result).toEqual({
        size: SPACER_SIZE_TAB,
      });
    });

    it('should use the default size when the data-spacer-size attribute is missing', () => {
      // Mock the span element without the 'data-spacer-size' attribute
      const mockSpanElement: any = {
        getAttribute: jest.fn((attr: string) => {
          return null; // Simulate the attribute being missing
        }),
      };

      const result = SpacerMarkSpec.parseDOM[0].getAttrs(mockSpanElement);

      expect(result).toEqual({
        size: SPACER_SIZE_TAB, // Default value
      });
    });
  });

  describe('toDOM', () => {
    it('should generate the correct DOM structure for the SpacerMark', () => {
      const mockMark:any = {
        attrs: {
          size: SPACER_SIZE_TAB,
        },
      };

      const result = SpacerMarkSpec.toDOM(mockMark,false);

      expect(result).toEqual([
        'span',
        {
          [DOM_ATTRIBUTE_SIZE]: SPACER_SIZE_TAB,
        },
        0,
      ]);
    });

    it('should generate the correct DOM structure with a different size', () => {
      const mockMark:any = {
        attrs: {
          size: 'tab-large',
        },
      };

      const result = SpacerMarkSpec.toDOM(mockMark,false);

      expect(result).toEqual([
        'span',
        {
          [DOM_ATTRIBUTE_SIZE]: 'tab-large',
        },
        0,
      ]);
    });
  });
});
