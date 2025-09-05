// @flow

import { Node } from 'prosemirror-model';
import type { MarkSpec } from './Types.js';

const HangingIndentMarkSpec: MarkSpec = {
    attrs: {
        prefix: { default: null },
        overridden: { default: false },
    },
    inline: true,
    group: 'inline',
    parseDOM: [
        {
            tag: 'span[prefix]',
            getAttrs: (domNode) => {
                const _prefix = domNode.getAttribute('prefix');
                return { prefix: _prefix || null };
            },
        },
    ],
    toDOM(node: Node) {
        const { prefix } = node.attrs;
        const attrs = { prefix };
        return ['span', attrs, 0];
    },
    rank: 5000
};

export default HangingIndentMarkSpec;
