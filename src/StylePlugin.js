// [FS] IRAD-1052 2020-10-30
// Plugin to handle custom style on load
import {
    Plugin,
    PluginKey
} from 'prosemirror-state';
import {
    Node
} from 'prosemirror-model';
import {
    applyLatestStyle
} from './CustomStyleCommand';

export default class StylePlugin extends Plugin {

    constructor() {

        super({
            key: new PluginKey('StylePlugin'),
            state: {
                init(config, state) {
                    this.loaded = false;
                },
                apply(tr, value, oldState, newState) {}
            },
            props: {
                handleDOMEvents: {
                    keydown(view, event) {}
                },
                nodeViews: []
            },
            appendTransaction: (transactions, prevState, nextState) => {
                let tr = null;
                if (!this.loaded) {
                    this.loaded = true;
                    // do this only once when the document is loaded.
                    tr = applyStyles(nextState);
                }
                return tr;
            },
        });
    }
}

function applyStyles(state) {
    let tr = state.tr;
    tr.doc.descendants(function(child, pos) {
        const contentLen = child.content.size;
        if (child instanceof Node && 1 < contentLen) {
            tr = applyStyle(tr, state, child, pos, pos + contentLen);
        }
    });

    return tr;
}

function applyStyle(tr, state, node, startPos, endPos) {
    const styleName = node.attrs.styleName;
    if (styleName) {
        tr = applyLatestStyle(styleName, state, tr, node, startPos, endPos);
    }
    return tr;
}