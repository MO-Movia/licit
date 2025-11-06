import TextSelectionMarkSpec from './textSelectionMarkSpec'; // Adjust the import path as needed
import {DOMOutputSpec, Mark} from 'prosemirror-model';

describe('TextSelectionMarkSpec', () => {


  describe('toDOM', () => {
    it('should generate a <czi-text-selection> element with the correct class', () => {
      const mockMark: Partial<Mark> = {
        attrs: {id: ''},
      };

      const result: DOMOutputSpec = TextSelectionMarkSpec.toDOM(
        mockMark as unknown as Mark,
        false
      );

      expect(result).toEqual([
        'czi-text-selection',
        {class: 'czi-text-selection'},
        0,
      ]);
    });
  });

});
