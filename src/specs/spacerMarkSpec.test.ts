import SpacerMarkSpec, { DOM_ATTRIBUTE_SIZE, SPACER_SIZE_TAB } from './spacerMarkSpec'; // Adjust the import path
import {Attrs, Mark} from 'prosemirror-model';

describe('SpacerMarkSpec', () => {

  describe('parseDOM', () => {
  it('should correctly parse the size attribute from a span element', () => {
    const mockSpanElement: HTMLElement = {
      getAttribute: (attr: string): string | null =>
        attr === DOM_ATTRIBUTE_SIZE ? SPACER_SIZE_TAB : null,
    } as unknown as HTMLElement;

    const parseRule = SpacerMarkSpec.parseDOM[0];
    const getAttrs = parseRule.getAttrs as (el: HTMLElement) => Attrs;

    const result = getAttrs(mockSpanElement);

    expect(result).toEqual({ size: SPACER_SIZE_TAB });
  });

  it('should use the default size when the data-spacer-size attribute is missing', () => {
    const mockSpanElement: HTMLElement = {
      getAttribute: () => null,
    } as unknown as HTMLElement;

    const parseRule = SpacerMarkSpec.parseDOM[0];
    const getAttrs = parseRule.getAttrs as (el: HTMLElement) => Attrs;

    const result = getAttrs(mockSpanElement);

    expect(result).toEqual({ size: SPACER_SIZE_TAB });
  });
});



  describe('toDOM', () => {
     interface MockMark {
    readonly attrs: { size: string };
  }

  const createMockMark = (size: string): MockMark => ({
    attrs: { size },
  });

  it('should generate the correct DOM structure for the default SpacerMark', () => {
    const mockMark = createMockMark(SPACER_SIZE_TAB);

    const result = SpacerMarkSpec.toDOM(mockMark as unknown as Mark, false);

    expect(result).toEqual([
      'span',
      { [DOM_ATTRIBUTE_SIZE]: SPACER_SIZE_TAB },
      0,
    ]);
  });

  it('should generate the correct DOM structure for a custom size', () => {
    const mockMark = createMockMark('tab-large');

    const result = SpacerMarkSpec.toDOM(mockMark as unknown as Mark, false);

    expect(result).toEqual([
      'span',
      { [DOM_ATTRIBUTE_SIZE]: 'tab-large' },
      0,
    ]);
  });
  });
});
