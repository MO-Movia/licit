import TextUnderlineMarkSpec from './textUnderlineMarkSpec';

type TagRule = { tag: string; getAttrs: (el: HTMLElement) => any };

describe('TextUnderlineMarkSpec', () => {
  describe('parseDOM', () => {
    it('<u> with overridden="true" → {overridden:true}', () => {
      const tagRule = TextUnderlineMarkSpec.parseDOM.find(
        (r: any) => r.tag === 'u'
      ) as TagRule;

      const el = document.createElement('u');
      el.setAttribute('overridden', 'true');

      expect(tagRule.getAttrs(el as any)).toEqual({ overridden: true });
    });

    it('<u> without overridden → {overridden:false}', () => {
      const tagRule = TextUnderlineMarkSpec.parseDOM.find(
        (r: any) => r.tag === 'u'
      ) as TagRule;

      const el = document.createElement('u');
      expect(tagRule.getAttrs(el as any)).toEqual({ overridden: false });
    });
  });

  describe('toDOM', () => {
    it('emits <u> with overridden=true', () => {
      const mark = { attrs: { overridden: true } } as any;
      // MarkSpec.toDOM typings may expect (mark, inline: boolean)
      const out = TextUnderlineMarkSpec.toDOM!(mark, false);
      expect(out).toEqual(['u', { overridden: true }, 0]);
    });

    it('emits <u> with overridden=false', () => {
      const mark = { attrs: { overridden: false } } as any;
      const out = TextUnderlineMarkSpec.toDOM!(mark, false);
      expect(out).toEqual(['u', { overridden: false }, 0]);
    });
  });
});
