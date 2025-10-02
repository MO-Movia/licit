import TextSubMarkSpec from './textSubMarkSpec';

type TagRule = { tag: string; getAttrs: (el: HTMLElement) => any };
type StyleRule = { style: string; getAttrs: (value: string) => any };

describe('TextSubMarkSpec', () => {
  describe('parseDOM', () => {
    it('<sub> with overridden="true" → {overridden:true}', () => {
      const tagRule = TextSubMarkSpec.parseDOM.find(
        (r: any) => r.tag === 'sub'
      ) as TagRule;

      const el = document.createElement('sub');
      el.setAttribute('overridden', 'true');

      expect(tagRule.getAttrs(el as any)).toEqual({ overridden: true });
    });

    it('<sub> without overridden → {overridden:false}', () => {
      const tagRule = TextSubMarkSpec.parseDOM.find(
        (r: any) => r.tag === 'sub'
      ) as TagRule;

      const el = document.createElement('sub');
      expect(tagRule.getAttrs(el as any)).toEqual({ overridden: false });
    });

    it('style vertical-align=sub → {overridden:true}', () => {
      const styleRule = TextSubMarkSpec.parseDOM.find(
        (r: any) => r.style === 'vertical-align'
      ) as StyleRule;

      expect(styleRule.getAttrs('sub')).toEqual({ overridden: true });
    });

    it('style vertical-align not sub → null', () => {
      const styleRule = TextSubMarkSpec.parseDOM.find(
        (r: any) => r.style === 'vertical-align'
      ) as StyleRule;

      expect(styleRule.getAttrs('baseline')).toBeNull();
    });
  });

  describe('toDOM', () => {
    it('emits sub with overridden=true', () => {
      const mark = { attrs: { overridden: true } } as any;
      const out = TextSubMarkSpec.toDOM!(mark, false); // pass inline boolean
      expect(out).toEqual(['sub', { overridden: true }, 0]);
    });

    it('emits sub with overridden=false', () => {
      const mark = { attrs: { overridden: false } } as any;
      const out = TextSubMarkSpec.toDOM!(mark, false);
      expect(out).toEqual(['sub', { overridden: false }, 0]);
    });
  });
});
