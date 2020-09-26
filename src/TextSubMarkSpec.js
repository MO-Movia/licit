// @flow

import type {MarkSpec} from './Types';

const TextSubMarkSpec: MarkSpec = {
  parseDOM: [
    {tag: 'sub'},
    {
      style: 'vertical-align',
      getAttrs: value => {
        return value === 'sub' && null;
      },
    },
  ],
  toDOM() {
    return ['sub', 0];
  },
};

export default TextSubMarkSpec;
