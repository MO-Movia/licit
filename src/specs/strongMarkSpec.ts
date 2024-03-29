import type { MarkSpec, DOMOutputSpec } from 'prosemirror-model';

const STRONG_DOM: DOMOutputSpec = ['strong', 0];
const CSS_BOLD_PATTERN = /^(bold(er)?|[5-9]\d{2,})$/;

const StrongMarkSpec: MarkSpec = {
  parseDOM: [
    { tag: 'strong' },
    // This works around a Google Docs misbehavior where
    // pasted content will be inexplicably wrapped in `<b>`
    // tags with a font-weight normal.
    {
      tag: 'b',
      getAttrs: (el: HTMLElement) => el.style.fontWeight != 'normal' && null,
    },
    {
      style: 'font-weight',
      getAttrs: (value: string) => CSS_BOLD_PATTERN.test(value) && null,
    },
  ],
  toDOM() {
    return STRONG_DOM;
  },
};

export default StrongMarkSpec;
