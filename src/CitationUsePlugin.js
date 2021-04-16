// [FS] IRAD-1052 2020-10-30
// Plugin to handle custom style on load
import {Plugin, PluginKey, EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {Node} from 'prosemirror-model';
import CitationView from './ui/CitationView';
const DELKEYCODE = 46;
const BACKSPACEKEYCODE = 8;
const ENTERKEYCODE = 13;
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
      // to handle citation position in a paragraph
      appendTransaction: (transactions, prevState, nextState) => {
        let tr = null;
        if (isDocChanged(transactions)) {
          if (prevState.doc !== nextState.doc) {
            const startPos = prevState.tr.selection.from;
            const parentPos =
              nextState.tr.selection.$head.pos -
              nextState.tr.selection.$head.parentOffset -
              1;
            const parentNode = nextState.tr.doc.nodeAt(parentPos);
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

                if (parentNode) {
                  const newattrs = Object.assign({}, parentNode.attrs);
                  newattrs.citationUseObject = null;
                  tr = tr.setNodeMarkup(parentPos, undefined, newattrs);
                }
              } else {
                if (parentNode) {
                  tr = reArrangeCitationTextPosition(
                    tr,
                    parentNode,
                    prevState,
                    nextState,
                    undefined,
                    parentPos
                  );
                }
              }
            } else {
              if (parentNode && this.view) {
                tr = reArrangeCitationTextPosition(
                  tr,
                  parentNode,
                  prevState,
                  nextState,
                  this.view.lastKeyCode,
                  parentPos
                );
              }
            }
          }
        }
        return tr;
      },
    });
  }
}

// Manage citation applied text position on document edit
function reArrangeCitationTextPosition(
  tr: Transform,
  node: Node,
  prevState: EditorState,
  nextState: EditorState,
  keyCode: ?number,
  parentPos: number
) {
  let textContent = '';
  let isCitationText = false;
  node.descendants(function (child: Node, pos: number, parent: Node) {
    if ('text' === child.type.name && !isCitationText) {
      textContent = `${textContent}${child.text}`;
    } else if ('citationnote' === child.type.name) {
      isCitationText = true;
      const newattrs = Object.assign({}, child.attrs);
      if (
        nextState.selection.to < child.attrs.to &&
        prevState.tr.doc.nodeSize !== nextState.tr.doc.nodeSize
      ) {
        if (!tr) {
          tr = nextState.tr;
        }
        const prevPosDifference =
          prevState.tr.doc.nodeSize - nextState.tr.doc.nodeSize;
        const nextPosDifference =
          nextState.tr.doc.nodeSize - prevState.tr.doc.nodeSize;
        let posAdj = 1;
        let newPos = pos;
        if (prevPosDifference > 0) {
          newattrs.from = newattrs.from - prevPosDifference;
          newattrs.to = newattrs.to - prevPosDifference;
        } else {
          if (undefined !== keyCode && ENTERKEYCODE === keyCode) {
            newPos = tr.selection.from + pos;
            posAdj = 0;
            newattrs.from = newattrs.from + 2;
            newattrs.to = newattrs.to + 2;
          } else {
            newPos = parentPos + pos;
            newattrs.from = newattrs.from + nextPosDifference;
            newattrs.to = newattrs.to + nextPosDifference;
          }
        }
        tr = tr.setNodeMarkup(newPos + posAdj, undefined, newattrs);
      }
    }
  });
  return tr;
}

function isDocChanged(transactions) {
  return transactions.some((transaction) => transaction.docChanged);
}
