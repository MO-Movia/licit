/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Mark, MarkSpec, Attrs } from 'prosemirror-model';

export const DOM_ATTRIBUTE_SIZE = 'data-spacer-size';
export const SPACER_SIZE_TAB = 'tab';
export const SPACER_SIZE_TAB_LARGE = 'tab-large';

// See http://jkorpela.fi/chars/spaces.html
export const HAIR_SPACE_CHAR = '\u200A';

const SpacerMarkSpec: MarkSpec = {
  attrs: {
    size: { default: SPACER_SIZE_TAB },
  },
  defining: true,
  draggable: false,
  excludes: '_',
  group: 'inline',
  inclusive: false,
  inline: true,
  spanning: false,
  parseDOM: [
    {
      tag: `span[${DOM_ATTRIBUTE_SIZE}]`,
      getAttrs: (el: HTMLElement): Attrs => {
        return {
          size: el.getAttribute(DOM_ATTRIBUTE_SIZE) || SPACER_SIZE_TAB,
        };
      },
    },
  ],
  toDOM(mark: Mark) {
    const { size } = mark.attrs;
    return [
      'span',
      {
        [DOM_ATTRIBUTE_SIZE]: size,
      },
      0,
    ];
  },
};

export default SpacerMarkSpec;
