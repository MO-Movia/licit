// [FS] IRAD-1052 2020-10-30
// Plugin to handle custom style on load
import {
    Plugin,
    PluginKey
} from 'prosemirror-state';
import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { applyStyle_New } from './CustomStyleCommand';
import { StyleView } from './StyleView';


export default class StylePlugin extends Plugin {

    constructor() {

        super({
            key: new PluginKey('StylePlugin'),
            view(editorView: EditorView) {
                const state = editorView.state;
                let tr = state.tr;
                const view = new StyleView(editorView);
                state.doc.descendants(function (child, pos) {
                    console.log(child);
                    console.log(pos);
                    if (child instanceof Node && child.content.size > 1) {
                        // applyStyle(state.tr, state, child, pos, pos + child.content.size);
                        // to check attribute is applying or not
                        // const attrs = child.attrs;
                        // tr = tr.setNodeMarkup(pos, undefined, {
                        //     ...attrs,
                        //     ['id']: '2'
                        // });
                        tr = applyStyle(editorView.state.tr, editorView.state, child, 8, 16);
                        editorView.dispatch(tr);
                    }
                });
                return view;
                // return editorView;
            },
            state: {
                init(config, state) {
                    console.log('init');
                    config.doc.descendants(function (child, pos) {
                        console.log(child);
                        console.log(pos);
                        // if (child instanceof Node && child.content.size > 1) {
                        // 	// applyStyle(state.tr, state, child, pos, pos + child.content.size);
                        // 	//	applyStyle(state.tr, state, child, 8, 16);
                        // to check attribute is applying or not
                        // 	const attrs = child.attrs;
                        // 	state.tr.setNodeMarkup(pos, undefined, {
                        // 		...attrs,
                        // 		['id']: '2'
                        // 	});
                        // 	return true;
                        // }
                    });

                },
                apply(tr, set) {
                    console.log('apply');
                }
            },
            props: {
                handleDOMEvents: {
                    keydown(view, event) {
                        const charCode = event.key;
                        console.log(charCode);
                    }
                },
                nodeViews: []
            },
            appendTransaction: (transactions, prevState, nextState) => {

            },
        });
    }



}

function applyStyle(tr, state, node, startPos, endPos) {
    return applyStyle_New('SE', state, tr, node, startPos, endPos);
}



