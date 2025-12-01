import OverrideMarkSpec from './overrideMarkSpec';

describe('OverrideMarkSpec', () => {
  describe('attrs', () => {
    it('should have correct default attributes', () => {
      expect(OverrideMarkSpec.attrs).toEqual({
        strong: {default: false},
        em: {default: false},
        underline: {default: false},
        strike: {default: false},
      });
    });
  });

  describe('basic properties', () => {
    it('should be inline', () => {
      expect(OverrideMarkSpec.inline).toBe(true);
    });

    it('should belong to inline group', () => {
      expect(OverrideMarkSpec.group).toBe('inline');
    });
  });

  describe('parseDOM', () => {
    let mockElement: HTMLElement | string;

    beforeEach(() => {
      mockElement = document.createElement('span');
    });

    it('should parse span with only strong attribute', () => {
      (mockElement as HTMLElement).setAttribute('cs-strong', 'true');

      const parser = OverrideMarkSpec.parseDOM![0];
      const result = parser.getAttrs!(mockElement as string & HTMLElement);

      expect(result).toEqual({
        strong: true,
        em: false,
        underline: false,
        strike: false,
      });
    });

    it('should parse span with only em attribute', () => {
      (mockElement as HTMLElement).setAttribute('cs-em', 'true');

      const parser = OverrideMarkSpec.parseDOM![0];
      const result = parser.getAttrs!(mockElement as HTMLElement & string);

      expect(result).toEqual({
        strong: false,
        em: true,
        underline: false,
        strike: false,
      });
    });

    it('should parse span with only underline attribute', () => {
      (mockElement as HTMLElement).setAttribute('cs-underline', 'true');

      const parser = OverrideMarkSpec.parseDOM![0];
      const result = parser.getAttrs!(mockElement as HTMLElement & string);

      expect(result).toEqual({
        strong: false,
        em: false,
        underline: true,
        strike: false,
      });
    });

    it('should parse span with only strike attribute', () => {
      (mockElement as HTMLElement).setAttribute('cs-strike', 'true');

      const parser = OverrideMarkSpec.parseDOM![0];
      const result = parser.getAttrs!(mockElement as HTMLElement & string);

      expect(result).toEqual({
        strong: false,
        em: false,
        underline: false,
        strike: true,
      });
    });

    it('should parse span with multiple attributes', () => {
      (mockElement as HTMLElement).setAttribute('cs-strong', 'true');
      (mockElement as HTMLElement).setAttribute('cs-underline', 'true');

      const parser = OverrideMarkSpec.parseDOM![0];
      const result = parser.getAttrs!(mockElement as HTMLElement & string);

      expect(result).toEqual({
        strong: true,
        em: false,
        underline: true,
        strike: false,
      });
    });

    it('should return false when all attributes are false', () => {
      const parser = OverrideMarkSpec.parseDOM![0];
      const result = parser.getAttrs!(mockElement as HTMLElement & string);

      expect(result).toBe(false);
    });

    it('should return false when attributes are not "true"', () => {
      (mockElement as HTMLElement).setAttribute('cs-strong', 'false');
      (mockElement as HTMLElement).setAttribute('cs-em', 'false');

      const parser = OverrideMarkSpec.parseDOM![0];
      const result = parser.getAttrs!(mockElement as HTMLElement & string);

      expect(result).toBe(false);
    });

    it('should return false when span has no relevant attributes', () => {
      (mockElement as HTMLElement).setAttribute('class', 'some-class');
      (mockElement as HTMLElement).setAttribute('id', 'some-id');

      const parser = OverrideMarkSpec.parseDOM![0];
      const result = parser.getAttrs!(mockElement as HTMLElement & string);

      expect(result).toBe(false);
    });
  });

  describe('toDOM', () => {
    it('should render span with all attributes true', () => {
      const mark = {
        attrs: {
          strong: true,
          em: true,
          underline: true,
          strike: true,
        },
      };

      const result = OverrideMarkSpec.toDOM!(mark as any, true);

      expect(result).toEqual([
        'span',
        {
          'cs-strong': true,
          'cs-em': true,
          'cs-underline': true,
          'cs-strike': true,
        },
        0,
      ]);
    });

    it('should render span with only strong attribute', () => {
      const mark = {
        attrs: {
          strong: true,
          em: false,
          underline: false,
          strike: false,
        },
      };

      const result = OverrideMarkSpec.toDOM!(mark as any, true);

      expect(result).toEqual([
        'span',
        {
          'cs-strong': true,
          'cs-em': false,
          'cs-underline': false,
          'cs-strike': false,
        },
        0,
      ]);
    });

    it('should render span with multiple attributes', () => {
      const mark = {
        attrs: {
          strong: true,
          em: false,
          underline: true,
          strike: false,
        },
      };

      const result = OverrideMarkSpec.toDOM!(mark as any, true);

      expect(result).toEqual([
        'span',
        {
          'cs-strong': true,
          'cs-em': false,
          'cs-underline': true,
          'cs-strike': false,
        },
        0,
      ]);
    });

    it('should return null when all attributes are false', () => {
      const mark = {
        attrs: {
          strong: false,
          em: false,
          underline: false,
          strike: false,
        },
      };

      const result = OverrideMarkSpec.toDOM!(mark as any, true);

      expect(result).toBeNull();
    });

    it('should render span with em attribute only', () => {
      const mark = {
        attrs: {
          strong: false,
          em: true,
          underline: false,
          strike: false,
        },
      };

      const result = OverrideMarkSpec.toDOM!(mark as any, true);

      expect(result).toEqual([
        'span',
        {
          'cs-strong': false,
          'cs-em': true,
          'cs-underline': false,
          'cs-strike': false,
        },
        0,
      ]);
    });

    it('should render span with strike attribute only', () => {
      const mark = {
        attrs: {
          strong: false,
          em: false,
          underline: false,
          strike: true,
        },
      };

      const result = OverrideMarkSpec.toDOM!(mark as any, true);

      expect(result).toEqual([
        'span',
        {
          'cs-strong': false,
          'cs-em': false,
          'cs-underline': false,
          'cs-strike': true,
        },
        0,
      ]);
    });
  });

  describe('parseDOM tag selector', () => {
    it('should target span tags', () => {
      const parser = OverrideMarkSpec.parseDOM![0];
      expect(parser.tag).toBe('span');
    });
  });
});
