import { ATTRIBUTE_INDENT, MIN_INDENT_LEVEL } from './paragraphNodeSpec';
import BulletListNodeSpec from './bulletListNodeSpec';
import { ATTRIBUTE_LIST_STYLE_TYPE } from './listItemNodeSpec';


describe('BulletListNodeSpec', () => {
  describe('parseDOM', () => {
    it('should return correct attributes from ul element', () => {
      const dom = document.createElement('ul');
      dom.setAttribute(ATTRIBUTE_LIST_STYLE_TYPE, 'circle');
      dom.setAttribute(ATTRIBUTE_INDENT, '2');

      expect(BulletListNodeSpec.parseDOM[0].getAttrs(dom)).toEqual({
        indent: 2,
        listStyleType: 'circle',
      });
    });

    it('should return default attributes when attributes are missing', () => {
      const dom = document.createElement('ul');
      expect(BulletListNodeSpec.parseDOM[0].getAttrs(dom)).toEqual({
        indent: MIN_INDENT_LEVEL,
        listStyleType: null,
      });
    });
  });

  describe('toDOM', () => {
    it('should return correct DOM structure with attributes', () => {
      const node = { attrs: { indent: 1, listStyleType: 'square' } };
      expect(BulletListNodeSpec.toDOM(node as any)).toEqual([
        'ul',
        { type: 'square', [ATTRIBUTE_INDENT]: 1, [ATTRIBUTE_LIST_STYLE_TYPE]: 'square' },
        0,
      ]);
    });

    it('should return correct DOM structure with default values', () => {
      const node = { attrs: { indent: 0, listStyleType: null } };
      expect(BulletListNodeSpec.toDOM(node as any)).toEqual([
        'ul',
        { type: 'disc', [ATTRIBUTE_INDENT]: 0 },
        0,
      ]);
    });
  });
});
