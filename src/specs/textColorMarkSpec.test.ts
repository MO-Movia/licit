/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import TextColorMarkSpec from './textColorMarkSpec'; // Adjust the import path as needed
import toCSSColor from '../toCSSColor'; // Adjust the import path as needed
import {Attrs, Mark, MarkType} from 'prosemirror-model';

// Mocking toCSSColor function for testing purposes
jest.mock('../toCSSColor', () => jest.fn());

describe('TextColorMarkSpec', () => {
  describe('parseDOM', () => {
    it('should parse color style correctly', () => {
      const parseRules = TextColorMarkSpec.parseDOM || [];
      const rule = parseRules[0];
      if (!rule?.getAttrs) throw new Error('getAttrs not defined');

      const mockElement = {
        style: {color: 'rgb(255, 0, 0)'},
        getAttribute: jest.fn().mockReturnValue('true'),
      } as unknown as HTMLElement & string;

      (toCSSColor as jest.Mock).mockReturnValue('rgb(255, 0, 0)');

      const result = rule.getAttrs(mockElement);

      expect(result).toEqual({
        color: 'rgb(255, 0, 0)',
        overridden: true,
      });
      expect(toCSSColor).toHaveBeenCalledWith('rgb(255, 0, 0)');
    });
  });

  describe('toDOM', () => {
    const createMockMark = (color: string): Mark => {
      const mockMarkType = {} as MarkType;
      return {
        type: mockMarkType,
        attrs: {color} as Attrs,
        addToSet: (marks: readonly Mark[]) => [...marks],
        removeFromSet: () => [],
        isInSet: () => false,
        eq: () => true,
        toJSON: () => ({attrs: {color}, type: 'span'}),
      };
    };

    it('should generate a <span> element with the correct color style', () => {
      const mockMark = createMockMark('rgb(255, 0, 0)');
      if (!TextColorMarkSpec.toDOM) throw new Error('toDOM not defined');
      const result = TextColorMarkSpec.toDOM(mockMark, false);
      expect(result).toEqual(['span', {style: 'color: rgb(255, 0, 0);'}, 0]);
    });

    it('should generate a <span> element with no color style if no color is set', () => {
      const mockMark = createMockMark('');
      if (!TextColorMarkSpec.toDOM) throw new Error('toDOM not defined');
      const result = TextColorMarkSpec.toDOM(mockMark, false);
      expect(result).toEqual(['span', {style: ''}, 0]);
    });
  });
});
