/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import StrongMarkSpec from './strongMarkSpec';
import {Mark, ParseRule} from 'prosemirror-model';
interface StrongAttrs {
  overridden: boolean;
}

describe('StrongMarkSpec', () => {
  describe('parseDOM', () => {
    function getRule(tag: string): ParseRule {
      const rule = StrongMarkSpec.parseDOM?.find((r) => r.tag === tag);
      if (!rule) throw new Error(`No parseDOM rule found for tag "${tag}"`);
      return rule;
    }

    it('should correctly parse <strong> tag', () => {
      const rule = getRule('strong');
      const strongEl = document.createElement('strong');
      strongEl.setAttribute('overridden', 'true');

      const getAttrs = rule.getAttrs as (dom: HTMLElement) => StrongAttrs;
      const attrs = getAttrs(strongEl);
      expect(attrs).toEqual({overridden: true});
    });

    it('should correctly parse <b> tag', () => {
      const rule = getRule('b');
      const boldEl = document.createElement('b');
      boldEl.setAttribute('overridden', 'false');

      const getAttrs = rule.getAttrs as (dom: HTMLElement) => StrongAttrs;
      const attrs = getAttrs(boldEl);
      expect(attrs).toEqual({overridden: false});
    });

    it('should correctly parse <span style="font-weight: bold">', () => {
      const rule = getRule('span[style*=font-weight]');
      const spanEl = document.createElement('span');
      spanEl.setAttribute('overridden', 'true');
      spanEl.setAttribute('style', 'font-weight: bold;');

      const getAttrs = rule.getAttrs as (dom: HTMLElement) => StrongAttrs;
      const attrs = getAttrs(spanEl);
      expect(attrs).toEqual({overridden: true});
    });
  });

  describe('toDOM', () => {
    it('should return correct DOM structure when overridden is true', () => {
      const mockMark = {
        attrs: {overridden: true},
      } as unknown as Mark;

      if (!StrongMarkSpec.toDOM) {
        throw new Error('SubMarkSpec.toDOM is not defined');
      }

      const result = StrongMarkSpec.toDOM(mockMark, false);
      expect(result).toEqual(['strong', {overridden: true}, 0]);
    });

    it('should return correct DOM structure when overridden is false', () => {
      const mockMark = {
        attrs: {overridden: false},
      } as unknown as Mark;

      if (!StrongMarkSpec.toDOM) {
        throw new Error('SubMarkSpec.toDOM is not defined');
      }

      const result = StrongMarkSpec.toDOM(mockMark, false);
      expect(result).toEqual(['strong', {overridden: false}, 0]);
    });
  });
});
