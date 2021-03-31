// [FS] IRAD-1052 2020-10-30
// Plugin to handle custom style on load
import {Plugin, PluginKey} from 'prosemirror-state';
import CitationView from './ui/CitationView';
const DELKEYCODE = 46;
const BACKSPACEKEYCODE = 8;
export default class CitationUsePlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('CitationUsePlugin'),
      state: {
        init(config, state) {
          this.loaded = false;
          this.spec.props.nodeViews['CitationView'] = CitationView;
        },
        apply(tr, value, oldState, newState) {},
      },
      props: {
        handleDOMEvents: {
          keydown(view, event) {
            this.view = view;
          },
        },
        nodeViews: [CitationView],
      },
      // [FS] IRAD-1253 2021-03-25
      // to handle delete the citation from the paragraph
      appendTransaction: (transactions, prevState, nextState) => {
        let tr = null;
        if (isDocChanged(transactions)) {
          if (prevState.doc !== nextState.doc) {
            const startPos = prevState.tr.selection.from;
            if (
              this.view &&
              (DELKEYCODE === this.view.lastKeyCode ||
                BACKSPACEKEYCODE === this.view.lastKeyCode)
            ) {
              const node = prevState.tr.doc.nodeAt(startPos);
              if (
                node &&
                'citationnote' === prevState.tr.doc.nodeAt(startPos).type.name
              ) {
                if (!tr) {
                  tr = nextState.tr;
                }
                const parentPos =
                  nextState.tr.selection.$head.pos -
                  nextState.tr.selection.$head.parentOffset -
                  1;
                const parentNode = nextState.tr.doc.nodeAt(parentPos);
                if (parentNode) {
                  const newattrs = Object.assign({}, parentNode.attrs);
                  newattrs.citationUseObject = null;
                  tr = tr.setNodeMarkup(parentPos, undefined, newattrs);
                }
              }
            }
          }
        }
        return tr;
      },
    });
  }
}

function isDocChanged(transactions) {
  return transactions.some((transaction) => transaction.docChanged);
}
