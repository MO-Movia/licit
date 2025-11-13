/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Mark, ParseRule} from 'prosemirror-model';
import FontTypeMarkSpec, {FONT_TYPE_NAMES} from './fontTypeMarkSpec';

interface FontAttrs {
  name: string;
  overridden: boolean;
}

describe('FontTypeMarkSpec', () => {
  describe('parseDOM', () => {
    function getFontRule(): ParseRule {
      const rule = FontTypeMarkSpec.parseDOM?.find(
        (r) => r.tag === 'span[style*=font-family]'
      );
      if (!rule) throw new Error('parseDOM rule for font-family not found');
      return rule;
    }

    it('should return Arial as default when both font and parent font are empty', () => {
      const rule = getFontRule();
      const spanEl = document.createElement('span');

      const getAttrs = rule.getAttrs as (domNode: HTMLElement) => FontAttrs;
      const result = getAttrs(spanEl);

      expect(result).toEqual({
        name: 'Arial',
        overridden: false,
      });
    });

    it('should return font name when provided directly in element', () => {
      const rule = getFontRule();
      const spanEl = document.createElement('span');
      spanEl.style.fontFamily = '"Times New Roman"';

      const getAttrs = rule.getAttrs as (domNode: HTMLElement) => FontAttrs;
      const result = getAttrs(spanEl);

      expect(result).toEqual({
        name: 'Times New Roman',
        overridden: false,
      });
    });

    it('should inherit font name from parent when element font is empty', () => {
      const rule = getFontRule();
      const parentEl = document.createElement('span');
      parentEl.style.fontFamily = '"Verdana"';
      const spanEl = document.createElement('span');
      parentEl.appendChild(spanEl);

      const getAttrs = rule.getAttrs as (domNode: HTMLElement) => FontAttrs;
      const result = getAttrs(spanEl);

      expect(result).toEqual({
        name: 'Verdana',
        overridden: false,
      });
    });

    it('should mark overridden true when element and parent fonts are different and parent overridden is true', () => {
      const rule = getFontRule();
      const parentEl = document.createElement('span');
      parentEl.style.fontFamily = '"Courier New"';
      parentEl.setAttribute('overridden', 'true');

      const spanEl = document.createElement('span');
      spanEl.style.fontFamily = '"Arial"';
      parentEl.appendChild(spanEl);

      const getAttrs = rule.getAttrs as (domNode: HTMLElement) => FontAttrs;
      const result = getAttrs(spanEl);

      expect(result).toEqual({
        name: 'Arial',
        overridden: true,
      });
    });

    it('should clean up quotes in font-family names', () => {
      const rule = getFontRule();
      const spanEl = document.createElement('span');
      spanEl.style.fontFamily = "'Comic Sans MS'";

      const getAttrs = rule.getAttrs as (domNode: HTMLElement) => FontAttrs;
      const result = getAttrs(spanEl);

      expect(result.name).toBe('Comic Sans MS');
    });
  });

  describe('toDOM', () => {
    it('should return correct DOM structure when name is provided', () => {
      const mark = {attrs: {name: 'Tahoma'}} as unknown as Mark;
      if (!FontTypeMarkSpec.toDOM) {
        throw new Error('SubMarkSpec.toDOM is not defined');
      }
      expect(FontTypeMarkSpec.toDOM(mark, false)).toEqual([
        'span',
        {style: 'font-family: Tahoma'},
        0,
      ]);
    });

    it('should return correct DOM structure when name is empty', () => {
      const mark = {attrs: {name: ''}} as unknown as Mark;
      if (!FontTypeMarkSpec.toDOM) {
        throw new Error('SubMarkSpec.toDOM is not defined');
      }
      expect(FontTypeMarkSpec.toDOM(mark, false)).toEqual([
        'span',
        {style: ''},
        0,
      ]);
    });
  });

  describe('FONT_TYPE_NAMES', () => {
    it('should contain predefined font names', () => {
      expect(FONT_TYPE_NAMES).toContain('Arial');
      expect(FONT_TYPE_NAMES).toContain('Times New Roman');
      expect(FONT_TYPE_NAMES).toContain('Verdana');
    });
  });
});
