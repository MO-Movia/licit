import ListItemNodeSpec from "./listItemNodeSpec";

describe('ListItemNodeSpec', () => {
    describe('parseDOM', () => {
      it('should return correct attributes from li element', () => {
        const dom = document.createElement('li');
        dom.setAttribute('data-align', 'center');
        expect(ListItemNodeSpec.parseDOM[0].getAttrs(dom)).toEqual({ align: 'center' });
      });
  
      it('should return null for invalid align values', () => {
        const dom = document.createElement('li');
        dom.setAttribute('data-align', 'invalid');
        expect(ListItemNodeSpec.parseDOM[0].getAttrs(dom)).toEqual({});
      });
    });
  
    describe('toDOM', () => {
      it('should return correct DOM structure with attributes', () => {
        const node = { attrs: { align: 'right' } };
        expect(ListItemNodeSpec.toDOM(node as any)).toEqual(['li', { 'data-align': 'right' }, 0]);
      });
  
      it('should return correct DOM structure without attributes', () => {
        const node = { attrs: { align: null } };
        expect(ListItemNodeSpec.toDOM(node as any)).toEqual(['li', {}, 0]);
      });
    });
  });