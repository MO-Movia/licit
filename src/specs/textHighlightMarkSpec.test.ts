import TextHighlightMarkSpec from './textHighlightMarkSpec'; // Adjust the import path as needed
import { toCSSColor, isTransparent } from '../toCSSColor'; // Adjust the import path as needed
import { Mark, ParseRule } from 'prosemirror-model';

// Mocking `toCSSColor` and `isTransparent` for testing purposes
jest.mock('../toCSSColor', () => ({
  toCSSColor: jest.fn(),
  isTransparent: jest.fn(),
}));

interface HighlightAttrs {
  highlightColor: string;
  overridden: boolean;
}

describe('TextHighlightMarkSpec', () => {

  describe('parseDOM', () => {
   it('should extract background color and set overridden to false', () => {
    const rule = TextHighlightMarkSpec.parseDOM?.find(
      (r: ParseRule) => r.tag === 'span[style*=background-color]'
    );
    if (!rule) throw new Error('parseDOM rule for background-color not found');

    const span = document.createElement('span');
    span.style.backgroundColor = 'rgb(255, 0, 0)';

    (toCSSColor as jest.Mock).mockReturnValue('#ff0000');
    (isTransparent as jest.Mock).mockReturnValue(false);

    const getAttrs = rule.getAttrs as (dom: HTMLElement) => HighlightAttrs;
    const result = getAttrs(span);

    expect(result).toEqual({
      highlightColor: '#ff0000',
      overridden: false,
    });
    expect(toCSSColor).toHaveBeenCalledWith('rgb(255, 0, 0)');
    expect(isTransparent).toHaveBeenCalledWith('#ff0000');
  });

  it('should set overridden to true when attribute is present', () => {
    const rule = TextHighlightMarkSpec.parseDOM?.find(
      (r: ParseRule) => r.tag === 'span[style*=background-color]'
    );
    if (!rule) throw new Error('parseDOM rule for background-color not found');

    const span = document.createElement('span');
    span.style.backgroundColor = 'rgb(0, 255, 0)';
    span.setAttribute('overridden', 'true');

    (toCSSColor as jest.Mock).mockReturnValue('#00ff00');
    (isTransparent as jest.Mock).mockReturnValue(false);

    const getAttrs = rule.getAttrs as (dom: HTMLElement) => HighlightAttrs;
    const result = getAttrs(span);

    expect(result).toEqual({
      highlightColor: '#00ff00',
      overridden: true,
    });
  });

  it('should return empty highlightColor for transparent background', () => {
    const rule = TextHighlightMarkSpec.parseDOM?.find(
      (r: ParseRule) => r.tag === 'span[style*=background-color]'
    );
    if (!rule) throw new Error('parseDOM rule for background-color not found');

    const span = document.createElement('span');
    span.style.backgroundColor = 'transparent';

    (toCSSColor as jest.Mock).mockReturnValue('transparent');
    (isTransparent as jest.Mock).mockReturnValue(true);

    const getAttrs = rule.getAttrs as (dom: HTMLElement) => HighlightAttrs;
    const result = getAttrs(span);

    expect(result).toEqual({
      highlightColor: '',
      overridden: false,
    });
  });
});

describe('toDOM', () => {
    interface HighlightMark extends Pick<Mark, 'attrs'> {
      attrs: {
        highlightColor?: string;
        overridden?: boolean;
      };
    }

    it('should return span with background color and overridden true', () => {
      const node: HighlightMark = {
        attrs: {
          highlightColor: '#ff0000',
          overridden: true,
        },
      };

      const result = TextHighlightMarkSpec.toDOM(node as unknown as Mark, false);
      expect(result).toEqual([
        'span',
        {
          style: 'background-color: #ff0000;',
          overridden: 'true',
        },
        0,
      ]);
    });

    it('should return span without background color when highlightColor is missing', () => {
      const node: HighlightMark = {
        attrs: {
          overridden: false,
        },
      };

      const result = TextHighlightMarkSpec.toDOM(node as unknown as Mark, false);
      expect(result).toEqual([
        'span',
        {
          style: '',
          overridden: 'false',
        },
        0,
      ]);
    });
  });
});


