/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { NodeSpec } from 'prosemirror-model';

const LandscapeSectionNodeSpec: NodeSpec = {
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
            getAttrs(dom: HTMLElement) {
                return {
                    class: dom.getAttribute('class'),
                };
            },
        },
    ],
    toDOM(node) {
        return ['section', node.attrs, 0];
    },
};

export default LandscapeSectionNodeSpec;
