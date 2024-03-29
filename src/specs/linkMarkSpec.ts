import type { MarkSpec, Attrs } from 'prosemirror-model';

const LinkMarkSpec: MarkSpec = {
  attrs: {
    href: { default: null },
    rel: { default: 'noopener noreferrer nofollow' },
    target: { default: 'blank' },
    title: { default: null },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs: (dom: HTMLElement): Attrs => {
        const href = dom.getAttribute('href');
        const target = href && href.indexOf('#') === 0 ? '' : 'blank';
        return {
          href: dom.getAttribute('href'),
          title: dom.getAttribute('title'),
          target,
        };
      },
    },
  ],
  toDOM(mark) {
    return ['a', mark.attrs, 0];
  },
};

export default LinkMarkSpec;
