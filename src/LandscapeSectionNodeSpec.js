// @flow

const LandscapeSectionNodeSpec = {
  attrs: {
    class: { default: 'section-landscape' },
  },
  content: 'block+',
  group: 'block',
  defining: true,
  isolating: true,
  parseDOM: [
    {
      tag: 'section.section-landscape',
      getAttrs(dom: HTMLElement): Object {
        return {
          class: dom.getAttribute('class'),
        };
      },
    },
  ],
  toDOM(node: Object): Array<any> {
    return ['section', node.attrs, 0];
  },
};

export default LandscapeSectionNodeSpec;
