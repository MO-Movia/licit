import ListItemNodeSpec from './listItemNodeSpec';
import { Node as ProseMirrorNode } from 'prosemirror-model';

interface MockNode extends Partial<ProseMirrorNode> {
  attrs: {
    align: string | null;
  };
}
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
    const node: MockNode = { attrs: { align: 'right' } };
    expect(ListItemNodeSpec.toDOM(node as ProseMirrorNode))
      .toEqual(['li', { 'data-align': 'right' }, 0]);
  });

  it('should return correct DOM structure without attributes', () => {
    const node: MockNode = { attrs: { align: null } };
    expect(ListItemNodeSpec.toDOM(node as ProseMirrorNode))
      .toEqual(['li', {}, 0]);
  });
  });
    });