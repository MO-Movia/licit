import { ATTRIBUTE_LIST_STYLE_TYPE } from './listItemNodeSpec';
import OrderedListNodeSpec, { ATTRIBUTE_COUNTER_RESET, ATTRIBUTE_FOLLOWING } from './orderedListNodeSpec'; // Adjust the import path
import { ATTRIBUTE_INDENT, MIN_INDENT_LEVEL, RESERVED_STYLE_NONE } from './paragraphNodeSpec';

describe('OrderedListNodeSpec', () => {

  describe('parseDOM', () => {
    it('should correctly parse attributes from an <ol> element', () => {
      const mockOlElement:any = {
        getAttribute: jest.fn((attr) => {
          const attrs = {
            [ATTRIBUTE_LIST_STYLE_TYPE]: 'decimal',
            [ATTRIBUTE_COUNTER_RESET]: 'none',
            [ATTRIBUTE_INDENT]: '2',
            start: '5',
            name: 'myList',
            [ATTRIBUTE_FOLLOWING]: 'true',
            type: 'x.x.x'
          };
          return attrs[attr];
        }),
        hasAttribute: jest.fn((attr) => {
          const attrs = [
            ATTRIBUTE_LIST_STYLE_TYPE,
            ATTRIBUTE_COUNTER_RESET,
            ATTRIBUTE_INDENT,
            'start',
            'name',
            ATTRIBUTE_FOLLOWING,
            'type'
          ];
          return attrs.includes(attr); // Returns true if the attribute is one of the known attributes
        }),
      };

      const result = OrderedListNodeSpec.parseDOM[0].getAttrs(mockOlElement);

      expect(result).toEqual({
        counterReset: 'none',
        following: 'true',
        indent: 2,
        listStyleType: 'decimal',
        name: 'myList',
        start: 5,
        type: 'x.x.x'
      });
    });

    it('should handle missing optional attributes correctly', () => {
      const mockOlElement: any = {
        getAttribute: jest.fn((attr) => {
          const attrs = {
            [ATTRIBUTE_LIST_STYLE_TYPE]: 'lower-roman',
            start: '1'
            // Simulate missing optional attributes
          };
          return attrs[attr];
        }),
        hasAttribute: jest.fn((attr) => {
          const attrs = ['start', ATTRIBUTE_LIST_STYLE_TYPE];
          return attrs.includes(attr); // Only returns true for the provided attributes
        }),
      };

      const result = OrderedListNodeSpec.parseDOM[0].getAttrs(mockOlElement);

      expect(result).toEqual({
        counterReset: undefined,
        following: undefined,
        indent: MIN_INDENT_LEVEL,
        listStyleType: 'lower-roman',
        name: undefined,
        start: 1,
        type: undefined
      });
    });
  });

  describe('toDOM', () => {
    it('should generate correct DOM output with all attributes', () => {
      const mockNode: any = {
        attrs: {
          counterReset: 'none',
          following: 'true',
          indent: 2,
          listStyleType: 'decimal',
          name: 'myList',
          start: 5,
          type: 'x.x.x',
          styleName: RESERVED_STYLE_NONE
        }
      };

      const result = OrderedListNodeSpec.toDOM(mockNode);

      expect(result).toEqual([
        'ol',
        {
          [ATTRIBUTE_INDENT]: 2,
          [ATTRIBUTE_COUNTER_RESET]: 'none',
          [ATTRIBUTE_FOLLOWING]: 'true',
          [ATTRIBUTE_LIST_STYLE_TYPE]: 'decimal',
          start: 5,
          name: 'myList',
          type: 'x.x.x',
          style: expect.any(String) // Expect the style to be a string but we don't check the exact content here
        },
        0
      ]);
    });

    it('should generate correct DOM output when listStyleType is not provided', () => {
      const mockNode: any = {
        attrs: {
          counterReset: 'none',
          following: 'true',
          indent: 2,
          listStyleType: undefined, // Simulating a missing listStyleType
          name: 'myList',
          start: 5,
          type: 'x.x.x',
          styleName: RESERVED_STYLE_NONE
        }
      };

      const result = OrderedListNodeSpec.toDOM(mockNode);

      expect(result).toEqual([
        'ol',
        {
          [ATTRIBUTE_INDENT]: 2,
          [ATTRIBUTE_COUNTER_RESET]: 'none',
          [ATTRIBUTE_FOLLOWING]: 'true',
          [ATTRIBUTE_LIST_STYLE_TYPE]: undefined,
          start: 5,
          name: 'myList',
          type: 'x.x.x',
          style: expect.any(String) // The style should still be generated, even if listStyleType is undefined
        },
        0
      ]);
    });
  });
});
