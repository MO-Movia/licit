import TextSuperMarkSpec from './textSuperMarkSpec';

type TagRule = { tag: string; getAttrs: (el: HTMLElement) => any };
type StyleRule = { style: string; getAttrs: (value: string) => any };

describe('TextSuperMarkSpec', () => {
  describe('parseDOM', () => {
    it('<sup> with overridden="true" → {overridden:true}', () => {
      const tagRule = TextSuperMarkSpec.parseDOM.find(
        (r: any) => r.tag === 'sup'
      ) as TagRule;

      const el = document.createElement('sup');
      el.setAttribute('overridden', 'true');
      expect(tagRule.getAttrs(el as any)).toEqual({ overridden: true });
    });

    it('<sup> without overridden → {overridden:false}', () => {
      const tagRule = TextSuperMarkSpec.parseDOM.find(
        (r: any) => r.tag === 'sup'
      ) as TagRule;

      const el = document.createElement('sup');
      expect(tagRule.getAttrs(el as any)).toEqual({ overridden: false });
    });

    it('style vertical-align="sup" → {overridden:true}', () => {
      const styleRule = TextSuperMarkSpec.parseDOM.find(
        (r: any) => r.style === 'vertical-align'
      ) as StyleRule;

      expect(styleRule.getAttrs('sup')).toEqual({ overridden: true });
    });

    it('style vertical-align not "sup" → null', () => {
      const styleRule = TextSuperMarkSpec.parseDOM.find(
        (r: any) => r.style === 'vertical-align'
      ) as StyleRule;

      expect(styleRule.getAttrs('baseline')).toBeNull();
    });
  });

  describe('toDOM', () => {
    it('emits <sup> with overridden=true', () => {
      const mark = { attrs: { overridden: true } } as any;
      const out = TextSuperMarkSpec.toDOM!(mark, false); // pass inline boolean to satisfy types
      expect(out).toEqual(['sup', { overridden: true }, 0]);
    });

    it('emits <sup> with overridden=false', () => {
      const mark = { attrs: { overridden: false } } as any;
      const out = TextSuperMarkSpec.toDOM!(mark, false);
      expect(out).toEqual(['sup', { overridden: false }, 0]);
    });
  });
});
