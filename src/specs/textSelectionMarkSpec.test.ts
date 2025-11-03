import TextSelectionMarkSpec from './textSelectionMarkSpec'; // Adjust the import path as needed

describe('TextSelectionMarkSpec', () => {


  describe('toDOM', () => {
    it('should generate a <czi-text-selection> element with the correct class', () => {
      const mockMark = {
        attrs: { id: '' }, // No specific id is set
      } as any;

      const result = TextSelectionMarkSpec.toDOM(mockMark,false);

      // The expected result is a <czi-text-selection> element with the "czi-text-selection" class
      expect(result).toEqual(['czi-text-selection', { class: 'czi-text-selection' }, 0]);
    });
  });

});
