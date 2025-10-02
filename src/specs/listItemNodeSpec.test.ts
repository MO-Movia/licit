import ListItemNodeSpec from './listItemNodeSpec';

describe('ListItemNodeSpec', () => {
  describe('parseDOM', () => {
    it('should return correct attributes from li element', () => {
      const dom = document.createElement('li');
      dom.setAttribute('data-align', 'center');
      expect(ListItemNodeSpec.parseDOM[0].getAttrs(dom)).toEqual({
        align: 'center',
      });
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
      expect(ListItemNodeSpec.toDOM(node as any)).toEqual([
        'li',
        { 'data-align': 'right' },
        0,
      ]);
    });

    it('should return correct DOM structure without attributes', () => {
      const node = { attrs: { align: null } };
      expect(ListItemNodeSpec.toDOM(node as any)).toEqual(['li', {}, 0]);
    });
  });

  it('getAttrs: uses style.textAlign when data-align is missing', () => {
    const dom = document.createElement('li');
    dom.style.textAlign = 'justify';
    expect(ListItemNodeSpec.parseDOM[0].getAttrs(dom)).toEqual({
      align: 'justify',
    });
  });

  it('getAttrs: prefers data-align over style.textAlign', () => {
    const dom = document.createElement('li');
    dom.setAttribute('data-align', 'right');
    dom.style.textAlign = 'left';
    expect(ListItemNodeSpec.parseDOM[0].getAttrs(dom)).toEqual({
      align: 'right',
    });
  });

  it('getAttrs: returns {} when neither attribute nor style is set', () => {
    const dom = document.createElement('li');
    expect(ListItemNodeSpec.parseDOM[0].getAttrs(dom)).toEqual({});
  });

  it('getAttrs: ignores invalid textAlign values', () => {
    const dom = document.createElement('li');
    dom.style.textAlign = 'middle'; // not left/right/center/justify
    expect(ListItemNodeSpec.parseDOM[0].getAttrs(dom)).toEqual({});
  });
});
