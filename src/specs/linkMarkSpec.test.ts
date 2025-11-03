import LinkMarkSpec from './linkMarkSpec';
import {Attrs, Mark} from 'prosemirror-model';

describe('LinkMarkSpec', () => {
  describe('Structure and Defaults', () => {
    it('should have the correct default attributes', () => {
      expect(LinkMarkSpec.attrs).toEqual({
        href: {default: null},
        rel: {default: 'noopener noreferrer nofollow'},
        selectionId: {
          default: null,
        },
        target: {default: 'blank'},
        title: {default: null},
      });
    });

    it('should be non-inclusive', () => {
      expect(LinkMarkSpec.inclusive).toBe(false);
    });
  });

  describe('parseDOM', () => {
    const parseRules = LinkMarkSpec.parseDOM ?? [];

    it('should extract href, title, target, and selectionId correctly for normal links', () => {
      const mockElement = document.createElement('a');
      mockElement.setAttribute('href', 'https://example.com');
      mockElement.setAttribute('title', 'Example');
      mockElement.setAttribute('selectionId', 'sel-123');

      const rule = parseRules.find((r) => r.tag === 'a[href]');
      expect(rule).toBeTruthy();

      // Explicitly cast getAttrs to a version that expects HTMLElement
      const getAttrs = rule?.getAttrs as
        | ((dom: HTMLElement) => Attrs)
        | undefined;

      expect(getAttrs).toBeDefined();
      const attrs = getAttrs!(mockElement);

      expect(attrs).toEqual({
        href: 'https://example.com',
        title: 'Example',
        target: 'blank',
        selectionId: 'sel-123',
      });
    });

    it('should set target to empty string when href starts with #', () => {
      const mockElement = document.createElement('a');
      mockElement.setAttribute('href', '#internal');
      mockElement.setAttribute('title', 'Internal link');

      const rule = parseRules.find((r) => r.tag === 'a[href]');
      expect(rule).toBeTruthy();

      const getAttrs = rule?.getAttrs as
        | ((dom: HTMLElement) => Attrs)
        | undefined;
      expect(getAttrs).toBeDefined();

      const attrs = getAttrs!(mockElement);

      expect(attrs).toEqual({
        href: '#internal',
        title: 'Internal link',
        target: '',
        selectionId: '',
      });
    });
  });

  describe('toDOM', () => {
    it('should return correct DOM structure with href and title attributes', () => {
      const mockMark = {
        attrs: {
          href: 'https://example.com',
          title: 'Example Link',
        },
      } as unknown as Mark;

      const result = LinkMarkSpec.toDOM?.(mockMark, false);
      expect(result).toEqual([
        'a',
        {href: 'https://example.com', title: 'Example Link'},
        0,
      ]);
    });

    it('should return correct DOM structure even if attributes are empty', () => {
      const mockMark = {attrs: {}} as unknown as Mark;

      const result = LinkMarkSpec.toDOM?.(mockMark, false);
      expect(result).toEqual(['a', {}, 0]);
    });
  });
});
