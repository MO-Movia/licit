// [FS] IRAD-1052 2020-10-30
// Plugin to handle custom style on load
import { Plugin, PluginKey } from 'prosemirror-state';
import { Node } from 'prosemirror-model';
import {
  updateOverrideFlag,
  applyLatestStyle,
  getMarkByStyleName,
  ATTR_OVERRIDDEN,
  getStyleLevel,
} from './CustomStyleCommand';
import {
  MARK_STRONG,
  MARK_EM,
  MARK_TEXT_COLOR,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_STRIKE,
  MARK_SUPER,
  MARK_TEXT_HIGHLIGHT,
  MARK_UNDERLINE,
} from './MarkNames';
import { getCustomStyleByName, getCustomStyleByLevel } from './customStyle';
import { RESERVED_STYLE_NONE } from './ParagraphNodeSpec';
import { getLineSpacingValue } from './ui/toCSSLineSpacing';
const ALLOWED_MARKS = [
  MARK_STRONG,
  MARK_EM,
  MARK_TEXT_COLOR,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_STRIKE,
  MARK_SUPER,
  MARK_TEXT_HIGHLIGHT,
  MARK_UNDERLINE,
];
const SPEC = 'spec';
const NEWATTRS = [ATTR_OVERRIDDEN];
const ENTERKEYCODE = 13;
const DELKEYCODE = 46;
const BACKSPACEKEYCODE = 8;
const PARA_POSITION_DIFF = 2;
const ATTR_STYLE_NAME = 'styleName';

const isNodeHasAttribute = (node, attrName) => {
  return node.attrs && node.attrs[attrName];
};
const requiredAddAttr = (node) => {
  return (
    'paragraph' === node.type.name && isNodeHasAttribute(node, ATTR_STYLE_NAME)
  );
};

export default class StylePlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('StylePlugin'),
      state: {
        init(config, state) {
          this.loaded = false;
          this.firstTime = true;
        },
        apply(tr, value, oldState, newState) {
          // [FS] IRAD-1202 2021-02-15
          remapCounterFlags(tr);
        },
      },
      props: {
        handleDOMEvents: {
          keydown(view, event) {
            this.view = view;
          },
        },
        handlePaste(view, event, slice) {
          return handlePasteCustomStyle(view, event, slice);
        },
        nodeViews: [],
      },
      appendTransaction: (transactions, prevState, nextState) => {
        let tr = null;

        if (!this.loaded) {
          this.loaded = true;
          // do this only once when the document is loaded.
          tr = applyStyles(nextState, tr);
        } else if (isDocChanged(transactions)) {
          if (!this.firstTime) {
            // when user updates
            tr = updateStyleOverrideFlag(nextState, tr);
            tr = manageHierarchyOnDelete(prevState, nextState, tr, this.view);
          }

          this.firstTime = false;
          // custom style for next line
          if (this.view && ENTERKEYCODE === this.view.lastKeyCode) {
            tr = applyStyleForNextParagraph(
              prevState,
              nextState,
              tr,
              this.view
            );
          }
        }
        return tr;
      },
    });
  }

  getEffectiveSchema(schema) {
    return applyEffectiveSchema(schema);
  }
}

// [FS] IRAD-1202 2021-02-15
function remapCounterFlags(tr) {
  // Depending on the window variables,
  // set counters for numbering.
  const cFlags = tr.doc.attrs.counterFlags;
  for (const key in cFlags) {
    if (cFlags.hasOwnProperty(key)) {
      window[key] = true;
    }
  }
}

function applyStyles(state, tr) {
  if (!tr) {
    tr = state.tr;
  }

  tr.doc.descendants(function (child, pos) {
    const contentLen = child.content.size;
    if (haveEligibleChildren(child, contentLen)) {
      // [FS] IRAD-1170 2021-02-02
      // FIX: When loading some documents on load show "Cannot read nodeSize property of undefined" error.
      const docLen = tr.doc.content.size;
      let end = pos + contentLen;
      // Validate end position.
      if (end > docLen) {
        // Can't be out of range.
        end = docLen;
      }
      tr = applyLatestStyle(child.attrs.styleName, state, tr, child, pos, end);
    }
  });

  return tr;
}
// [FS] IRAD-1130 2021-01-07
// Handle heirarchy on delete
function manageHierarchyOnDelete(prevState, nextState, tr, view) {
  const nodesAfterSelection = [];
  const nodesBeforeSelection = [];
  let selectedPos = nextState.selection.from;
  if (prevState.doc !== nextState.doc) {
    if (
      view &&
      (DELKEYCODE === view.lastKeyCode || BACKSPACEKEYCODE === view.lastKeyCode)
    ) {
      const nextNodes = nodeAssignment(nextState);
      // seperating  the nodes to two arrays, ie selection before and after
      nextNodes.forEach((element) => {
        if (element.pos >= selectedPos) {
          nodesAfterSelection.push({ pos: element.pos, node: element.node });
        } else {
          nodesBeforeSelection.push({ pos: element.pos, node: element.node });
        }
      });
      // for backspace and delete to get the correct node position
      selectedPos =
        DELKEYCODE === view.lastKeyCode ? selectedPos - 1 : selectedPos + 1;
      const selectedNode = prevState.doc.nodeAt(selectedPos);
      if (
        selectedNode &&
        selectedNode.attrs &&
        selectedNode.attrs.styleName !== 'None' &&
        0 !== Number(getStyleLevel(selectedNode.attrs.styleName))
      ) {
        if (nodesBeforeSelection.length > 0 || nodesAfterSelection.length > 0) {
          // assigning transaction if tr is null
          if (!tr) {
            tr = nextState.tr;
          }

          let subsequantLevel = 0;
          let levelCounter = 0;
          let prevNode = null;
          let prevNodeLevel = 0;

          if (nodesBeforeSelection.length > 0) {
            prevNode = nodesBeforeSelection[nodesBeforeSelection.length - 1];
            prevNodeLevel = Number(
              getStyleLevel(prevNode.node.attrs.styleName)
            );
          }

          if (nodesBeforeSelection.length > 0 && 0 !== prevNodeLevel) {
            for (
              let indexbefore = 0;
              indexbefore < nodesBeforeSelection.length;
              indexbefore++
            ) {
              const beforeitem = nodesBeforeSelection[indexbefore];
              subsequantLevel = Number(
                getStyleLevel(beforeitem.node.attrs.styleName)
              );
              if (subsequantLevel !== 0) {
                if (subsequantLevel > 1 && subsequantLevel - levelCounter > 1) {
                  subsequantLevel = subsequantLevel - 1;
                  const style = getCustomStyleByLevel(subsequantLevel);
                  const newattrs = Object.assign({}, beforeitem.node.attrs);
                  newattrs.styleName = style.styleName;
                  tr = tr.setNodeMarkup(beforeitem.pos, undefined, newattrs);
                }
                levelCounter = subsequantLevel;
              }
            }
          }

          for (let index = 0; index < nodesAfterSelection.length; index++) {
            const item = nodesAfterSelection[index];
            subsequantLevel = Number(getStyleLevel(item.node.attrs.styleName));

            if (subsequantLevel !== 0) {
              if (levelCounter !== subsequantLevel) {
                if (subsequantLevel - levelCounter > 1) {
                  subsequantLevel = Number(subsequantLevel) - 1;
                  if (subsequantLevel > 0) {
                    const style = getCustomStyleByLevel(subsequantLevel);
                    const newattrs = Object.assign({}, item.node.attrs);
                    newattrs.styleName = style.styleName;
                    tr = tr.setNodeMarkup(item.pos, undefined, newattrs);
                  }
                }
              }
              levelCounter = subsequantLevel;
            }
          }
        }
      }
    }
  }
  return tr;
}

// get all the nodes having styleName attribute
function nodeAssignment(state) {
  const nodes = [];
  state.doc.descendants((node, pos) => {
    if (requiredAddAttr(node)) {
      nodes.push({
        node,
        pos,
      });
    }
  });
  return nodes;
}

// Continious Numbering for custom style
function applyStyleForNextParagraph(prevState, nextState, tr, view) {
  let modified = false;
  if (!tr) {
    tr = nextState.tr;
  }
  if (view && isNewParagraph(prevState, nextState, view)) {
    nextState.doc.descendants((node, pos) => {
      let required = false;
      if (requiredAddAttr(node)) {
        required = true;
      }
      if (required) {
        let newattrs = Object.assign({}, node.attrs);
        const nextNodePos = pos + node.nodeSize;
        const nextNode = nextState.doc.nodeAt(nextNodePos);
        let IsActiveNode = false;
        if (
          nextNodePos > prevState.selection.from &&
          nextNodePos < nextState.selection.from
        ) {
          IsActiveNode = true;
        }
        if (
          nextNode &&
          IsActiveNode &&
          nextNode.type.name === 'paragraph' &&
          nextNode.attrs.styleName === 'None'
        ) {
          const style = getCustomStyleByName(newattrs.styleName);
          if (style && style.styles) {
            // [FS] IRAD-1217 2021-02-24
            // Select style for next line not working continuously for more that 2 paragraphs
            newattrs = setNodeAttrs(style.styles.nextLineStyleName, newattrs);
            tr = tr.setNodeMarkup(nextNodePos, undefined, newattrs);
            // [FS] IRAD-1201 2021-02-18
            // get the nextLine Style from the current style object.
            const marks = getMarkByStyleName(
              style.styles.nextLineStyleName,
              nextState.schema
            );
            node.descendants((child, pos) => {
              if (child.type.name === 'text') {
                marks.forEach((mark) => {
                  tr = tr.addStoredMark(mark);
                });
              }
            });
            if (node.content.size === 0) {
              marks.forEach((mark) => {
                tr = tr.addStoredMark(mark);
              });
            }
            modified = true;
          }
        }
      }
    });
  }

  return modified ? tr : null;
}

// [FS] IRAD-1217 2021-02-24
// get the style object using the nextlineStyleName and set the attribute values to the node.
function setNodeAttrs(nextLineStyleName, newattrs) {
  const nextLineStyle = getCustomStyleByName(nextLineStyleName);
  if (nextLineStyle && nextLineStyle.styles) {
    newattrs.styleName = nextLineStyleName;
    newattrs.indent = nextLineStyle.styles.indent;
    newattrs.align = nextLineStyle.styles.align;
    // [FS] IRAD-1223 2021-03-04
    // Line spacing not working for next line style
    newattrs.lineSpacing = getLineSpacingValue(nextLineStyle.styles.lineHeight);
  } else if (RESERVED_STYLE_NONE === nextLineStyleName) {
    // [FS] IRAD-1229 2021-03-03
    // Next line style None not applied
    newattrs = resetNodeAttrs(newattrs, nextLineStyleName);
  }
  return newattrs;
}

function resetNodeAttrs(newattrs, nextLineStyleName) {
  newattrs.styleName = nextLineStyleName;
  newattrs.indent = null;
  newattrs.lineSpacing = null;
  newattrs.align = 'left';
  return newattrs;
}

function isNewParagraph(prevState, nextState, view) {
  let bOk = false;
  if (
    ENTERKEYCODE === view.lastKeyCode &&
    PARA_POSITION_DIFF === nextState.selection.from - prevState.selection.from
  ) {
    bOk = true;
  }
  return bOk;
}

function isDocChanged(transactions) {
  return transactions.some((transaction) => transaction.docChanged);
}

function updateStyleOverrideFlag(state, tr) {
  const retObj = { modified: false };
  if (!tr) {
    tr = state.tr;
  }

  tr.doc.descendants(function (child, pos) {
    const contentLen = child.content.size;
    if (haveEligibleChildren(child, contentLen)) {
      const startPos = tr.curSelection.$anchor.pos; //pos
      const endPos = tr.curSelection.$head.pos; //pos + contentLen
      tr = updateOverrideFlag(
        child.attrs.styleName,
        tr,
        child,
        startPos,
        endPos,
        retObj
      );
    }
  });

  return retObj.modified ? tr : null;
}

function haveEligibleChildren(node, contentLen) {
  return (
    node instanceof Node &&
    0 < contentLen &&
    node.type.name === 'paragraph' &&
    RESERVED_STYLE_NONE !== node.attrs.styleName
  );
}

function createMarkAttributes(mark, markName, existingAttr) {
  if (mark) {
    const requiredAttrs = [...NEWATTRS];

    requiredAttrs.forEach((key) => {
      if (mark.attrs) {
        let newAttr = mark.attrs[key];
        if (!newAttr) {
          if (existingAttr) {
            newAttr = Object.assign(
              Object.create(Object.getPrototypeOf(existingAttr)),
              existingAttr
            );
            newAttr.default = false;
          } else {
            newAttr = {};
            newAttr.hasDefault = true;
            newAttr.default = false;
          }
          mark.attrs[key] = newAttr;
        }
      }
    });
  }
}

function getAnExistingAttribute(schema) {
  let existingAttr = null;

  try {
    existingAttr = schema['marks']['link']['attrs']['href'];
  } catch (err) {}

  return existingAttr;
}

function createNewAttributes(schema) {
  const marks = [];
  const existingAttr = getAnExistingAttribute(schema);

  ALLOWED_MARKS.forEach((name) => {
    getRequiredMarks(marks, name, schema);
  });

  for (let i = 0, name = ''; i < marks.length; i++) {
    if (i < marks.length - 1) {
      // even items are content.
      // odd items are marks.
      // Hence name is available only in the node.
      if (0 === i % 2) {
        const mark = marks[i + 1];
        if (mark) {
          name = mark.name;
        }
      }
    } else {
      name = '';
    }
    createMarkAttributes(marks[i], name, existingAttr);
  }

  return schema;
}

function getRequiredMarks(marks, markName, schema) {
  const mark = getContent(markName, schema);

  if (mark) {
    marks.push(mark);
    marks.push(schema.marks[markName]);
  }
}

function applyEffectiveSchema(schema) {
  if (schema && schema[SPEC]) {
    createNewAttributes(schema);
  }

  return schema;
}

function getContent(type, schema) {
  let content = null;
  const contentArr = schema[SPEC]['marks']['content'];
  const len = contentArr.length;
  // check even index to find the content type name
  for (let i = 0; i < len; i += 2) {
    if (type == contentArr[i]) {
      // found, so get the actual content which is in the next index.
      content = contentArr[i + 1];
      // break the loop;
      i = len;
    }
  }

  return content;
}
// Handles the styleName attribute on copy/paste
function handlePasteCustomStyle(view, event, slice) {
  const selectionHead = view.state.tr.curSelection.$head;
  if (selectionHead && slice.content.content) {
    const node = slice.content.content[0];
    const newattrs = Object.assign({}, node.attrs);
    newattrs.id = null === newattrs.id ? '' : null;
    let { tr } = view.state;
    const resPos = tr.doc.resolve(view.state.tr.curSelection.from);
    if (resPos && resPos.parentOffset === 0) {
      tr = tr.setNodeMarkup(
        view.state.tr.curSelection.from - 1,
        undefined,
        newattrs
      );
      view.dispatch(tr);
    }
  }
  return false;
}
