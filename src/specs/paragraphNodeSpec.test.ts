/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {Node} from '@tiptap/core';
import ParagraphNode, {
  INDENT_MARGIN_PT_SIZE,
  MIN_INDENT_LEVEL,
  MAX_INDENT_LEVEL,
  ATTRIBUTE_INDENT,
  ATTRIBUTE_STYLE_LEVEL,
  RESERVED_STYLE_NONE,
  RESERVED_STYLE_NONE_NUMBERING,
  EMPTY_CSS_VALUE,
  toParagraphDOM,
  getParagraphNodeAttrs,
  getParagraphStyle,
  convertMarginLeftToIndentValue,
} from './paragraphNodeSpec';

// Mock dependencies
jest.mock('@tiptap/core', () => ({
  Node: {
    create: jest.fn((config) => ({
      ...config,
      // Ensure the config is accessible as a Node instance would be
      config,
    })),
  },
  mergeAttributes: jest.fn((...args) => Object.assign({}, ...args)),
}));

jest.mock('../toCSSLineSpacing', () => ({
  __esModule: true,
  default: jest.fn((value) => value),
}));

jest.mock('../convertToCSSPTValue', () => ({
  __esModule: true,
  default: jest.fn((value) => {
    const match = value.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[0]) : 0;
  }),
}));

describe('ParagraphNode Constants', () => {
  test('should have correct constant values', () => {
    expect(INDENT_MARGIN_PT_SIZE).toBe(36);
    expect(MIN_INDENT_LEVEL).toBe(0);
    expect(MAX_INDENT_LEVEL).toBe(7);
    expect(ATTRIBUTE_INDENT).toBe('data-indent');
    expect(ATTRIBUTE_STYLE_LEVEL).toBe('data-style-level');
    expect(RESERVED_STYLE_NONE).toBe('None');
    expect(RESERVED_STYLE_NONE_NUMBERING).toBe('None-@#$-');
  });

  test('EMPTY_CSS_VALUE should contain expected values', () => {
    expect(EMPTY_CSS_VALUE.has('')).toBe(true);
    expect(EMPTY_CSS_VALUE.has('0%')).toBe(true);
    expect(EMPTY_CSS_VALUE.has('0pt')).toBe(true);
    expect(EMPTY_CSS_VALUE.has('0px')).toBe(true);
    expect(EMPTY_CSS_VALUE.has('10px')).toBe(false);
  });
});

describe('convertMarginLeftToIndentValue', () => {
  test('should convert margin to indent level correctly', () => {
    expect(convertMarginLeftToIndentValue('36pt')).toBe(1);
    expect(convertMarginLeftToIndentValue('72pt')).toBe(2);
    expect(convertMarginLeftToIndentValue('108pt')).toBe(3);
  });

  test('should handle minimum indent level', () => {
    expect(convertMarginLeftToIndentValue('0pt')).toBe(0);
    expect(convertMarginLeftToIndentValue('10pt')).toBe(0);
    expect(convertMarginLeftToIndentValue('35pt')).toBe(0);
  });

  test('should handle maximum indent level', () => {
    expect(convertMarginLeftToIndentValue('252pt')).toBe(7);
    expect(convertMarginLeftToIndentValue('500pt')).toBe(7);
    expect(convertMarginLeftToIndentValue('1000pt')).toBe(7);
  });

  test('should floor decimal values', () => {
    expect(convertMarginLeftToIndentValue('40pt')).toBe(1);
    expect(convertMarginLeftToIndentValue('70pt')).toBe(1);
  });
});

describe('getParagraphNodeAttrs', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement('p');
  });

  test('should parse align from attribute', () => {
    mockElement.setAttribute('align', 'center');
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.align).toBe('center');
  });

  test('should parse align from style.textAlign', () => {
    mockElement.style.textAlign = 'right';
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.align).toBe('right');
  });

  test('should default to left align', () => {
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.align).toBe('left');
  });

  test('should reject invalid align values', () => {
    mockElement.setAttribute('align', 'invalid');
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.align).toBeNull();
  });

  test('should accept valid align values', () => {
    ['left', 'right', 'center', 'justify'].forEach((align) => {
      mockElement.setAttribute('align', align);
      const attrs = getParagraphNodeAttrs(mockElement);
      expect(attrs.align).toBe(align);
    });
  });

  test('should parse indent from data-indent attribute', () => {
    mockElement.setAttribute(ATTRIBUTE_INDENT, '3');
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.indent).toBe(3);
  });

  test('should calculate indent from marginLeft', () => {
    mockElement.style.marginLeft = '72pt';
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.indent).toBe(2);
  });

  test('should prioritize data-indent over marginLeft', () => {
    mockElement.setAttribute(ATTRIBUTE_INDENT, '5');
    mockElement.style.marginLeft = '72pt';
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.indent).toBe(5);
  });

  test('should default indent to MIN_INDENT_LEVEL', () => {
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.indent).toBe(MIN_INDENT_LEVEL);
  });

  test('should parse lineHeight', () => {
    mockElement.style.lineHeight = '1.5';
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.lineSpacing).toBe('1.5');
  });

  test('should return null lineSpacing when not set', () => {
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.lineSpacing).toBeNull();
  });

  test('should parse paddingTop and paddingBottom', () => {
    mockElement.style.paddingTop = '10px';
    mockElement.style.paddingBottom = '20px';
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.paddingTop).toBe('10px');
    expect(attrs.paddingBottom).toBe('20px');
  });

  test('should parse all custom attributes', () => {
    mockElement.setAttribute('id', 'test-id');
    mockElement.setAttribute('reset', 'true');
    mockElement.setAttribute('overriddenAlign', 'yes');
    mockElement.setAttribute('overriddenAlignValue', 'center');
    mockElement.setAttribute('overriddenLineSpacing', 'yes');
    mockElement.setAttribute('overriddenLineSpacingValue', '2');
    mockElement.setAttribute('overriddenIndent', 'yes');
    mockElement.setAttribute('overriddenIndentValue', '3');
    mockElement.setAttribute('selectionId', 'sel-123');
    mockElement.setAttribute('objectId', 'obj-456');

    const attrs = getParagraphNodeAttrs(mockElement);

    expect(attrs.id).toBe('test-id');
    expect(attrs.reset).toBe('true');
    expect(attrs.overriddenAlign).toBe('yes');
    expect(attrs.overriddenAlignValue).toBe('center');
    expect(attrs.overriddenLineSpacing).toBe('yes');
    expect(attrs.overriddenLineSpacingValue).toBe('2');
    expect(attrs.overriddenIndent).toBe('yes');
    expect(attrs.overriddenIndentValue).toBe('3');
    expect(attrs.selectionId).toBe('sel-123');
    expect(attrs.objectId).toBe('obj-456');
  });

  test('should return empty strings for missing custom attributes', () => {
    const attrs = getParagraphNodeAttrs(mockElement);
    expect(attrs.id).toBe('');
    expect(attrs.reset).toBe('');
    expect(attrs.overriddenAlign).toBe('');
  });
});

describe('getParagraphStyle', () => {
  test('should return empty string when no styles', () => {
    const style = getParagraphStyle({});
    expect(style).toBe('');
  });

  test('should not include left align in style', () => {
    const style = getParagraphStyle({align: 'left'});
    expect(style).toBe('');
  });

  test('should include non-left align in style', () => {
    expect(getParagraphStyle({align: 'center'})).toContain(
      'text-align: center;'
    );
    expect(getParagraphStyle({align: 'right'})).toContain('text-align: right;');
    expect(getParagraphStyle({align: 'justify'})).toContain(
      'text-align: justify;'
    );
  });

  test('should include lineSpacing in style', () => {
    const style = getParagraphStyle({lineSpacing: '1.5'});
    expect(style).toContain('line-height: 1.5;');
    expect(style).toContain('--czi-content-line-height: 1.5;');
  });

  test('should include paddingTop when not empty', () => {
    const style = getParagraphStyle({paddingTop: '10px'});
    expect(style).toContain('padding-top: 10px;');
  });

  test('should not include paddingTop when empty', () => {
    expect(getParagraphStyle({paddingTop: ''})).not.toContain('padding-top');
    expect(getParagraphStyle({paddingTop: '0%'})).not.toContain('padding-top');
    expect(getParagraphStyle({paddingTop: '0pt'})).not.toContain('padding-top');
    expect(getParagraphStyle({paddingTop: '0px'})).not.toContain('padding-top');
  });

  test('should include paddingBottom when not empty', () => {
    const style = getParagraphStyle({paddingBottom: '20px'});
    expect(style).toContain('padding-bottom: 20px;');
  });

  test('should not include paddingBottom when empty', () => {
    expect(getParagraphStyle({paddingBottom: ''})).not.toContain(
      'padding-bottom'
    );
    expect(getParagraphStyle({paddingBottom: '0%'})).not.toContain(
      'padding-bottom'
    );
    expect(getParagraphStyle({paddingBottom: '0pt'})).not.toContain(
      'padding-bottom'
    );
    expect(getParagraphStyle({paddingBottom: '0px'})).not.toContain(
      'padding-bottom'
    );
  });

  test('should combine multiple styles', () => {
    const style = getParagraphStyle({
      align: 'center',
      lineSpacing: '2',
      paddingTop: '5px',
      paddingBottom: '10px',
    });
    expect(style).toContain('text-align: center;');
    expect(style).toContain('line-height: 2;');
    expect(style).toContain('--czi-content-line-height: 2;');
    expect(style).toContain('padding-top: 5px;');
    expect(style).toContain('padding-bottom: 10px;');
  });
});

describe('toParagraphDOM', () => {
  test('should create basic paragraph DOM structure', () => {
    const node = {attrs: {}};
    const dom = toParagraphDOM(node);
    expect(dom).toEqual(['p', {}, 0]);
  });

  test('should include style when present', () => {
    const node = {attrs: {align: 'center'}};
    const dom = toParagraphDOM(node);
    expect(dom[1]).toHaveProperty('style');
    expect(dom[1].style).toContain('text-align: center;');
  });

  test('should include indent attribute', () => {
    const node = {attrs: {indent: 3}};
    const dom = toParagraphDOM(node);
    expect(dom[1][ATTRIBUTE_INDENT]).toBe('3');
  });

  test('should include id attribute', () => {
    const node = {attrs: {id: 'test-123'}};
    const dom = toParagraphDOM(node);
    expect(dom[1].id).toBe('test-123');
  });

  test('should include all override attributes', () => {
    const node = {
      attrs: {
        reset: 'true',
        overriddenAlign: 'yes',
        overriddenAlignValue: 'center',
        overriddenLineSpacing: 'yes',
        overriddenLineSpacingValue: '2',
        overriddenIndent: 'yes',
        overriddenIndentValue: '3',
      },
    };
    const dom = toParagraphDOM(node);
    expect(dom[1].reset).toBe('true');
    expect(dom[1].overriddenAlign).toBe('yes');
    expect(dom[1].overriddenAlignValue).toBe('center');
    expect(dom[1].overriddenLineSpacing).toBe('yes');
    expect(dom[1].overriddenLineSpacingValue).toBe('2');
    expect(dom[1].overriddenIndent).toBe('yes');
    expect(dom[1].overriddenIndentValue).toBe('3');
  });

  test('should include selectionId when present', () => {
    const node = {attrs: {selectionId: 'sel-456'}};
    const dom = toParagraphDOM(node);
    expect(dom[1].selectionId).toBe('sel-456');
  });

  test('should not include selectionId when not present', () => {
    const node = {attrs: {}};
    const dom = toParagraphDOM(node);
    expect(dom[1]).not.toHaveProperty('selectionId');
  });

  test('should include all attributes together', () => {
    const node = {
      attrs: {
        indent: 2,
        id: 'para-1',
        align: 'right',
        lineSpacing: '1.5',
        selectionId: 'sel-789',
      },
    };
    const dom = toParagraphDOM(node);
    expect(dom[1][ATTRIBUTE_INDENT]).toBe('2');
    expect(dom[1].id).toBe('para-1');
    expect(dom[1].style).toContain('text-align: right;');
    expect(dom[1].selectionId).toBe('sel-789');
  });
});
