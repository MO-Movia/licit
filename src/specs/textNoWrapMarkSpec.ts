/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type { MarkSpec, DOMOutputSpec } from 'prosemirror-model';

const NO_WRAP_DOM: DOMOutputSpec = ['nobr', 0];

const TextNoWrapMarkSpec: MarkSpec = {
  parseDOM: [{ tag: 'nobr' }],
  toDOM() {
    return NO_WRAP_DOM;
  },
};

export default TextNoWrapMarkSpec;
