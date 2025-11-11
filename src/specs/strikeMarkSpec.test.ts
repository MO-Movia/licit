import StrikeMarkSpec from './strikeMarkSpec';
import {Attrs, Mark, MarkType} from 'prosemirror-model';

describe('StrikeMarkSpec', () => {
  describe('parseDOM', () => {
    it('should return { overridden: true } when overridden="true"', () => {
      const mockElement = document.createElement('strike');
      mockElement.setAttribute('overridden', 'true');

      const parseRules = StrikeMarkSpec.parseDOM ?? [];
      const rule = parseRules[0];
      expect(rule).toBeTruthy();

      const result = rule.getAttrs(
        mockElement as unknown as HTMLElement & string
      );
      expect(result).toEqual({overridden: true});
    });

    it('should return { overridden: false } when overridden="false"', () => {
      const mockElement = document.createElement('strike');
      mockElement.setAttribute('overridden', 'false');

      const parseRules = StrikeMarkSpec.parseDOM ?? [];
      const rule = parseRules[0];
      expect(rule).toBeTruthy();

      const result = rule.getAttrs(
        mockElement as unknown as HTMLElement & string
      );
      expect(result).toEqual({overridden: false});
    });

    it('should return { overridden: false } when overridden attribute is missing', () => {
      const mockElement = document.createElement('strike');

      const parseRules = StrikeMarkSpec.parseDOM ?? [];
      const rule = parseRules[0];
      expect(rule).toBeTruthy();

      const result = rule.getAttrs(
        mockElement as unknown as HTMLElement & string
      );
      expect(result).toEqual({overridden: false});
    });
  });

  describe('toDOM', () => {
    const createMockMark = (): Mark => {
      const mockMarkType = {} as MarkType;
      return {
        type: mockMarkType,
        attrs: {overridden: true} as Attrs,
        addToSet: (marks: readonly Mark[]) => [...marks],
        removeFromSet: () => [],
        isInSet: () => false,
        eq: () => true,
        toJSON: () => ({attrs: {overridden: true}, type: 'strike'}),
      };
    };

    it('should return the correct DOM structure for strike-through', () => {
      const mockMark = createMockMark();

      // Non-null assertion because toDOM is defined
      const result = StrikeMarkSpec.toDOM(mockMark, false);

      // Match what your editor actually outputs
      expect(result).toEqual(['strike', {overridden: true}, 0]);
    });
  });
});
