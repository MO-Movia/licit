/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Mark, ParseRule} from 'prosemirror-model';
import FontSizeMarkSpec from './fontSizeMarkSpec';
import {toClosestFontPtSize} from '../toClosestFontPtSize';

jest.mock('../toClosestFontPtSize', () => ({
  toClosestFontPtSize: jest.fn(),
}));

describe('FontSizeMarkSpec', () => {
  describe('parseDOM', () => {
    const getRule = (): ParseRule => {
      const rule = FontSizeMarkSpec.parseDOM?.find(
        (r) => r.tag === 'span[style*=font-size]'
      );
      if (!rule) throw new Error('parseDOM rule not found');
      return rule;
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return pt value from element font-size', () => {
      const rule = getRule();
      const spanEl = document.createElement('span');
      spanEl.style.fontSize = '14pt';
      spanEl.setAttribute('overridden', 'true');

      (toClosestFontPtSize as jest.Mock).mockReturnValue(14);

      const getAttrs = rule.getAttrs as (domNode: HTMLElement) => {
        pt: number;
        overridden: boolean;
      };
      const result = getAttrs(spanEl);

      expect(toClosestFontPtSize).toHaveBeenCalledWith('14pt');
      expect(result).toEqual({
        pt: 14,
        overridden: true,
      });
    });

    it('should return pt value inherited from parent when font-size not set', () => {
      const rule = getRule();
      const parentEl = document.createElement('span');
      parentEl.style.fontSize = '12pt';
      parentEl.setAttribute('overridden', 'true');
      const childEl = document.createElement('span');
      parentEl.appendChild(childEl);

      (toClosestFontPtSize as jest.Mock).mockReturnValueOnce(12);

      const getAttrs = rule.getAttrs as (domNode: HTMLElement) => {
        pt: number;
        overridden: boolean;
      };
      const result = getAttrs(childEl);

      expect(toClosestFontPtSize).toHaveBeenCalledWith('12pt');
      expect(result).toEqual({
        pt: 12,
        overridden: true,
      });
    });

    it('should handle empty font-size and parent font-size gracefully', () => {
      const rule = getRule();
      const spanEl = document.createElement('span');

      (toClosestFontPtSize as jest.Mock).mockReturnValue(0);

      const getAttrs = rule.getAttrs as (domNode: HTMLElement) => {
        pt: number;
        overridden: boolean;
      };
      const result = getAttrs(spanEl);

      expect(result).toEqual({
        pt: 0,
        overridden: false,
      });
    });

    it('should detect overridden correctly when parent is overridden and child has font-size', () => {
      const rule = getRule();
      const parentEl = document.createElement('span');
      parentEl.style.fontSize = '16pt';
      parentEl.setAttribute('overridden', 'true');

      const childEl = document.createElement('span');
      childEl.style.fontSize = '10pt';
      parentEl.appendChild(childEl);

      (toClosestFontPtSize as jest.Mock).mockImplementation((size) =>
        parseInt(size, 10)
      );

      const getAttrs = rule.getAttrs as (domNode: HTMLElement) => {
        pt: number;
        overridden: boolean;
      };
      const result = getAttrs(childEl);

      expect(result).toEqual({
        pt: 10,
        overridden: true,
      });
    });
  });

  describe('toDOM', () => {
    const toDOM = FontSizeMarkSpec.toDOM;

    it('should return correct DOM structure when pt is provided', () => {
      const mockMark = {
        attrs: {pt: 14, overridden: true},
      } as unknown as Mark;

      const result = toDOM(mockMark, false);

      expect(result).toEqual([
        'span',
        {
          overridden: true,
          style: 'font-size: 14pt;',
          class: 'czi-font-size-mark',
        },
        0,
      ]);
    });

    it('should return correct DOM structure when pt is not provided', () => {
      const mockMark = {
        attrs: {pt: '', overridden: false},
      } as unknown as Mark;

      const result = toDOM(mockMark, false);

      expect(result).toEqual([
        'span',
        {overridden: false, style: '', class: ''},
        0,
      ]);
    });
  });
});
