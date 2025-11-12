import ParagraphNodeSpec, {
  convertMarginLeftToIndentValue,
  getParagraphNodeAttrs,
  toParagraphDOM,
} from './paragraphNodeSpec';
import {DOMOutputSpec, Node as PNode } from 'prosemirror-model';
describe('ParagraphNodeSpec', () => {
  it('should have correct default attributes', () => {
    expect(ParagraphNodeSpec.attrs).toEqual({
      align: {default: null},
      color: {default: null},
      id: {default: null},
      indent: {default: null},
      lineSpacing: {default: null},
      overriddenAlign: {default: null},
      overriddenAlignValue: {default: null},
      overriddenIndent: {default: null},
      overriddenIndentValue: {default: null},
      overriddenLineSpacing: {default: null},
      overriddenLineSpacingValue: {default: null},
      paddingBottom: {default: null},
      paddingTop: {default: null},
      reset: {default: null},
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
      objectId: '',
      overriddenAlign: '',
      overriddenAlignValue: '',
      overriddenIndent: '',
      overriddenIndentValue: '',
      overriddenLineSpacing: '',
      overriddenLineSpacingValue: '',
      paddingTop: '10px',
      paddingBottom: '5px',
      reset: '',
      selectionId: '',
      id: 'test-id',
    });
  });

  it('should convert margin-left to indent value correctly', () => {
    expect(convertMarginLeftToIndentValue('72pt')).toBe(2);
    expect(convertMarginLeftToIndentValue('36pt')).toBe(1);
    expect(convertMarginLeftToIndentValue('0pt')).toBe(0);
  });

  it('should use textAlign from style when align attribute is not present', () => {
  const dom = document.createElement('p');
  dom.style.textAlign = 'right';

  const attrs = getParagraphNodeAttrs(dom);
  expect(attrs.align).toBe('right');
});

it('should prioritize align attribute over textAlign style', () => {
  const dom = document.createElement('p');
  dom.setAttribute('align', 'center');
  dom.style.textAlign = 'right';

  const attrs = getParagraphNodeAttrs(dom);
  expect(attrs.align).toBe('center');
});

it('should default to "left" when no align attribute or textAlign style is present', () => {
  const dom = document.createElement('p');

  const attrs = getParagraphNodeAttrs(dom);
  expect(attrs.align).toBe('left');
});

it('should return null for invalid align values', () => {
  const dom = document.createElement('p');
  dom.setAttribute('align', 'invalid-value');

  const attrs = getParagraphNodeAttrs(dom);
  expect(attrs.align).toBeNull();
});

it('should parse indent from marginLeft when indent attribute is not present', () => {
  const dom = document.createElement('p');
  dom.style.marginLeft = '108pt'; // Should convert to indent 3

  const attrs = getParagraphNodeAttrs(dom);
  expect(attrs.indent).toBe(3);
});

it('should prioritize indent attribute over marginLeft style', () => {
  const dom = document.createElement('p');
  dom.setAttribute('data-indent', '5');
  dom.style.marginLeft = '72pt';

  const attrs = getParagraphNodeAttrs(dom);
  expect(attrs.indent).toBe(5);
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

    const domSpec: DOMOutputSpec = toParagraphDOM(node as unknown as PNode);
    expect(domSpec).toEqual([
      'p',
      {
        style: 'text-align: justify;padding-top: 15px;padding-bottom: 10px;',
        id: 'para-1',
        'data-indent': '3',
        indent: 3,
        overriddenAlign: undefined,
        overriddenAlignValue: undefined,
        overriddenIndent: undefined,
        overriddenIndentValue: undefined,
        overriddenLineSpacing: undefined,
        overriddenLineSpacingValue: undefined,
        paddingBottom: '10px',
        paddingTop: '15px',
        reset: undefined,
        align: 'justify',
      },
      0,
    ]);
  });
});
