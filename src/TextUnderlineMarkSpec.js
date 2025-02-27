// @flow

import type { MarkSpec } from './Types.js';

// https://bitbucket.org/atlassian/atlaskit/src/34facee3f461/packages/editor-core/src/schema/nodes/?at=master
const TextUnderlineMarkSpec: MarkSpec = {
  attrs: {
    overridden: { default: false },
  },
  parseDOM: [
    {
      tag: 'u',
      getAttrs: (dom: HTMLElement) => {
        const _overridden = dom.getAttribute('overridden');
        return { overridden: _overridden === 'true' };
      }
    },
  ],
  toDOM(mark) {
    return ['u', { overridden: mark.attrs.overridden }, 0];
  },
};

export default TextUnderlineMarkSpec;
