import ParagraphNodeSpec, { convertMarginLeftToIndentValue, getParagraphNodeAttrs, toParagraphDOM } from './paragraphNodeSpec';
import { DOMOutputSpec } from 'prosemirror-model';

describe('ParagraphNodeSpec', () => {
  it('should have correct default attributes', () => {
    expect(ParagraphNodeSpec.attrs).toEqual({
      align: { default: null },
      color: { default: null },
      id: { default: null },
      indent: { default: null },
      lineSpacing: { default: null },
      paddingBottom: { default: null },
      paddingTop: { default: null },
    });
  });

  it('should parse DOM attributes correctly', () => {
    const dom = document.createElement('p');
    dom.setAttribute('align', 'center');
    dom.setAttribute('id', 'test-id');
    dom.style.lineHeight = '1.5';
    dom.style.marginLeft = '72pt';
    dom.style.paddingTop = '10px';
    dom.style.paddingBottom = '5px';

    const attrs = getParagraphNodeAttrs(dom);
    expect(attrs).toEqual({
      align: 'center',
      indent: 2,
      lineSpacing: '165%',
      paddingTop: '10px',
      paddingBottom: '5px',
      id: 'test-id',
    });
  });

  it('should convert margin-left to indent value correctly', () => {
    expect(convertMarginLeftToIndentValue('72pt')).toBe(2);
    expect(convertMarginLeftToIndentValue('36pt')).toBe(1);
    expect(convertMarginLeftToIndentValue('0pt')).toBe(0);
  });

  it('should generate correct DOM output', () => {
    const node = {
      attrs: {
        align: 'justify',
        indent: 3,
        id: 'para-1',
        paddingTop: '15px',
        paddingBottom: '10px',
      },
    };

    const domSpec: DOMOutputSpec = toParagraphDOM(node as any);
    expect(domSpec).toEqual([
      'p',
      {
        style: 'text-align: justify;padding-top: 15px;padding-bottom: 10px;',
        id: 'para-1',
        'data-indent': '3',
      },
      0,
    ]);
  });
});
