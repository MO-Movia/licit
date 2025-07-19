import LinkMarkSpec from './linkMarkSpec';
import { MarkSpec } from 'prosemirror-model';

describe('LinkMarkSpec', () => {
  describe('Structure and Defaults', () => {
    it('should have the correct default attributes', () => {
      expect(LinkMarkSpec.attrs).toEqual({
        href: { default: null },
        rel: { default: 'noopener noreferrer nofollow' },
        target: { default: 'blank' },
        title: { default: null },
      });
    });

    it('should be non-inclusive', () => {
      expect(LinkMarkSpec.inclusive).toBe(false);
    });
  });

  describe('parseDOM', () => {
    it('should correctly parse attributes from a DOM element', () => {
      const mockElement = document.createElement('a');
      mockElement.setAttribute('href', 'https://example.com');
      mockElement.setAttribute('title', 'Example');

      const getAttrs = LinkMarkSpec.parseDOM[0].getAttrs;
      const attrs = getAttrs(mockElement as any);

      expect(attrs).toEqual({
        href: 'https://example.com',
        title: 'Example',
        target: 'blank',
      });
    });

    it('should handle hash links correctly', () => {
      const mockElement = document.createElement('a');
      mockElement.setAttribute('href', '#section1');

      const getAttrs = LinkMarkSpec.parseDOM[0].getAttrs;
      const attrs = getAttrs(mockElement as any);

      expect(attrs).toEqual({
        href: '#section1',
        title: null,
        target: '',
      });
    });
  });

  describe('toDOM', () => {
    it('should return the correct DOM structure', () => {
      const mark = { attrs: { href: 'https://example.com', title: 'Example', target: 'blank', rel: 'noopener noreferrer nofollow' } };
      const result = LinkMarkSpec.toDOM(mark as any, false);

      expect(result).toEqual(['a', mark.attrs, 0]);
    });
  });
});
