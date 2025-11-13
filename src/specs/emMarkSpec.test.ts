/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import EMMarkSpec from './emMarkSpec'; // Adjust import path
import {Attrs, Mark, MarkType} from 'prosemirror-model';

describe('EMMarkSpec', () => {
  it('parseDOM should parse <i>, <em>, and span with italic style', () => {
    const parseRules = EMMarkSpec.parseDOM || [];

    // Type guard for HTMLElement-based getAttrs
    function isHTMLElementGetter(
      fn: unknown
    ): fn is (node: HTMLElement) => false | Attrs {
      // Accept it if it's a function and NOT the string version
      return typeof fn === 'function';
    }

    function getAttrsOrThrow(
      rule: {getAttrs?: unknown},
      el: HTMLElement
    ): Attrs {
      if (!rule.getAttrs || !isHTMLElementGetter(rule.getAttrs)) {
        throw new Error('getAttrs is missing or not an HTMLElement getter');
      }

      const result = rule.getAttrs(el);
      if (!result) {
        throw new Error('getAttrs returned false or null');
      }

      return result;
    }

    // ----- <i> -----
    const domI = document.createElement('i');
    domI.setAttribute('overridden', 'true');

    const ruleI = parseRules.find((r) => r.tag === 'i');
    if (!ruleI) throw new Error('Missing <i> parse rule');

    const attrsI = getAttrsOrThrow(ruleI, domI);
    expect(attrsI.overridden).toBe(true);

    // ----- <em> -----
    const domEm = document.createElement('em');
    domEm.setAttribute('overridden', 'false');

    const ruleEm = parseRules.find((r) => r.tag === 'em');
    if (!ruleEm) throw new Error('Missing <em> parse rule');

    const attrsEm = getAttrsOrThrow(ruleEm, domEm);
    expect(attrsEm.overridden).toBe(false);

    // ----- <span style> -----
    const domSpan = document.createElement('span');
    domSpan.setAttribute('overridden', 'true');
    domSpan.setAttribute('style', 'font-style: italic');

    const ruleSpan = parseRules.find(
      (r) => r.tag === 'span[style*=font-style]'
    );
    if (!ruleSpan) throw new Error('Missing italic <span> rule');

    const attrsSpan = getAttrsOrThrow(ruleSpan, domSpan);
    expect(attrsSpan.overridden).toBe(true);
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
