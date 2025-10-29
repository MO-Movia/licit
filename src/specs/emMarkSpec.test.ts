import EMMarkSpec from './emMarkSpec'; // Adjust import path
import {Attrs, Mark, MarkType} from 'prosemirror-model';

describe('EMMarkSpec', () => {
  it('parseDOM should parse <i>, <em>, and span with italic style', () => {
    const parseRules = EMMarkSpec.parseDOM || [];

    // <i> tag
    const domI = document.createElement('i');
    domI.setAttribute('overridden', 'true');
    const ruleI = parseRules.find((rule) => rule.tag === 'i');
    expect(ruleI).toBeTruthy();
    if (ruleI?.getAttrs) {
      const attrs = ruleI.getAttrs(domI as HTMLElement & string);
      if (attrs) expect(attrs.overridden).toBe(true);
    }

    // <em> tag
    const domEm = document.createElement('em');
    domEm.setAttribute('overridden', 'false');
    const ruleEm = parseRules.find((rule) => rule.tag === 'em');
    expect(ruleEm).toBeTruthy();
    if (ruleEm?.getAttrs) {
      const attrs = ruleEm.getAttrs(domEm as HTMLElement & string);
      if (attrs) expect(attrs.overridden).toBe(false);
    }

    // <span style="font-style: italic">
    const domSpan = document.createElement('span');
    domSpan.setAttribute('overridden', 'true');
    domSpan.setAttribute('style', 'font-style: italic');
    const ruleSpan = parseRules.find(
      (rule) => rule.tag === 'span[style*=font-style]'
    );
    expect(ruleSpan).toBeTruthy();
    if (ruleSpan?.getAttrs) {
      const attrs = ruleSpan.getAttrs(domSpan as HTMLElement & string);
      if (attrs) expect(attrs.overridden).toBe(true);
    }
  });

  it('toDOM should return <em> tag with overridden attribute', () => {
    const mockMarkType = {} as MarkType;
    const mockMark: Mark = {
      type: mockMarkType,
      attrs: {overridden: true} as Attrs,
      addToSet: (marks: readonly Mark[]) => [...marks],
      removeFromSet: () => [],
      isInSet: () => false,
      eq: () => true,
      toJSON: () => ({attrs: {overridden: true}, type: 'em'}),
    };

    if (!EMMarkSpec.toDOM) throw new Error('EMMarkSpec.toDOM is not defined');

    const domOutput = EMMarkSpec.toDOM(mockMark, true);
    expect(domOutput).toEqual(['em', {overridden: true}, 0]);
  });
});
