import StrongMarkSpec from './strongMarkSpec';

describe('StrongMarkSpec', () => {
  describe('parseDOM', () => {
    it('<strong> with overridden="true" → {overridden:true}', () => {
      const el = document.createElement('strong');
      el.setAttribute('overridden', 'true');
      expect(StrongMarkSpec.parseDOM[0].getAttrs(el as any)).toEqual({ overridden: true });
    });

    it('<strong> without attribute → {overridden:false}', () => {
      const el = document.createElement('strong');
      expect(StrongMarkSpec.parseDOM[0].getAttrs(el as any)).toEqual({ overridden: false });
    });

    it('<b> with overridden="false" → {overridden:false}', () => {
      const el = document.createElement('b');
      el.setAttribute('overridden', 'false');
      expect(StrongMarkSpec.parseDOM[1].getAttrs(el as any)).toEqual({ overridden: false });
    });

    it('<span style="font-weight:700"> with overridden="true" → {overridden:true}', () => {
      const el = document.createElement('span');
      el.style.fontWeight = '700';
      el.setAttribute('overridden', 'true');
      expect(StrongMarkSpec.parseDOM[2].getAttrs(el as any)).toEqual({ overridden: true });
    });

    it('<span style="font-weight:bold"> without attribute → {overridden:false}', () => {
      const el = document.createElement('span');
      el.style.fontWeight = 'bold';
      expect(StrongMarkSpec.parseDOM[2].getAttrs(el as any)).toEqual({ overridden: false });
    });
  });

  describe('toDOM', () => {
    it('emits strong with overridden=true', () => {
      const mark = { attrs: { overridden: true } } as any;
      const out = StrongMarkSpec.toDOM!(mark, false);
      expect(out).toEqual(['strong', { overridden: true }, 0]);
    });

    it('emits strong with overridden=false', () => {
      const mark = { attrs: { overridden: false } } as any;
      const out = StrongMarkSpec.toDOM!(mark, false);
      expect(out).toEqual(['strong', { overridden: false }, 0]);
    });
  });
});
