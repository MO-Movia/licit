// [FS] IRAD-1052 2020-10-30
// Plugin to handle custom style on load
import {Plugin, PluginKey} from 'prosemirror-state';
import {Node} from 'prosemirror-model';
import {
  updateOverrideFlag,
  applyLatestStyle,
  getMarkByStyleName,
  ATTR_OVERRIDDEN,
  getStyleLevel,
} from './CustomStyleCommand';
import {findParentNodeClosestToPos} from 'prosemirror-utils';
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
import {getCustomStyleByName, getCustomStyleByLevel} from './customStyle';
import {RESERVED_STYLE_NONE} from './ParagraphNodeSpec';
import {getLineSpacingValue} from './ui/toCSSLineSpacing';
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
          tr = applyLineStyle(prevState, nextState, tr);
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
  let nodes = null;
  const nodesAfterSelection = [];
  const nodesBeforeSelection = [];
  let isLast = false;
  const selectedPos = nextState.selection.from;
  if (prevState.doc !== nextState.doc) {
    if (
      view &&
      (DELKEYCODE === view.lastKeyCode || BACKSPACEKEYCODE === view.lastKeyCode)
    ) {
      const nextNodes = nodeAssignment(nextState);
      nextNodes.forEach((element) => {
        const styleLevel = getStyleLevel(element.node.attrs.styleName);
        if (styleLevel) {
          if (element.pos >= selectedPos) {
            nodesAfterSelection.push({pos: element.pos, node: element.node});
          } else {
            nodesBeforeSelection.push({pos: element.pos, node: element.node});
          }
        }
      });

      if (nodesBeforeSelection.length > 0 || nodesAfterSelection.length > 0) {
        if (!tr) {
          tr = nextState.tr;
        }
        let prevLevel = 0;
        let subsequantLevel = 0;
        let counter = 0;
        if (nodesBeforeSelection.length > 0) {
          nodes = nodesBeforeSelection[nodesBeforeSelection.length - 1];
          prevLevel = Number(getStyleLevel(nodes.node.attrs.styleName));
          if (prevLevel && prevLevel !== 1) {
            const style = getCustomStyleByLevel(prevLevel - 1);
            const newattrs = Object.assign({}, nodes.attrs);
            newattrs.styleName = style.styleName;
            tr = tr.setNodeMarkup(nodes.pos, undefined, newattrs);
          }
        }
        nodesAfterSelection.forEach((item) => {
          subsequantLevel = getStyleLevel(item.node.attrs.styleName);
          if (
            Number(prevLevel) !== Number(subsequantLevel)
            //&&
            // Number(subsequantLevel) - Number(prevLevel) > 1
          ) {
            subsequantLevel = Number(subsequantLevel) - 1;
            const style = getCustomStyleByLevel(subsequantLevel);
            const newattrs = Object.assign({}, item.node.attrs);
            newattrs.styleName = style.styleName;
            tr = tr.setNodeMarkup(item.pos, undefined, newattrs);
            prevLevel = subsequantLevel;
          } else {
            if (
              1 === selectedPos &&
              nodesBeforeSelection.length === 1 &&
              nodesBeforeSelection[0].pos === 0 &&
              Number(prevLevel) === 2 &&
              counter === 0
            ) {
              prevLevel = Number(prevLevel);
              const style = getCustomStyleByLevel(prevLevel - 1);
              const styleLevel2 = getCustomStyleByLevel(2);
              const newattrs = Object.assign({}, item.node.attrs);
              newattrs.styleName = style.styleName;
              if (counter === 0) {
                tr = tr.setNodeMarkup(0, undefined, newattrs);

                if (Number(subsequantLevel) === 3) {
                  isLast = true;
                  if (styleLevel2) {
                    newattrs.styleName = styleLevel2.styleName;
                    tr = tr.setNodeMarkup(item.pos, undefined, newattrs);
                  }
                }
              } else {
                // if (styleLevel2) {
                //   newattrs.styleName = styleLevel2.styleName;
                //   tr = tr.setNodeMarkup(item.pos, undefined, newattrs);
                // }
              }
            } else {
              if (isLast) {
                const styleLevel2 = getCustomStyleByLevel(2);
                const newattrs = Object.assign({}, item.node.attrs);
                if (styleLevel2) {
                  newattrs.styleName = styleLevel2.styleName;
                  tr = tr.setNodeMarkup(item.pos, undefined, newattrs);
                }
              }
            }
            if (!isLast)
              if (Number(subsequantLevel) - Number(prevLevel) === 1) {
                prevLevel = subsequantLevel;
              }
          }
          counter++;
        });
        if (
          nodesBeforeSelection.length === 1 &&
          nodesAfterSelection.length === 0
        ) {
          subsequantLevel = Number(prevLevel) - 1;
          const style = getCustomStyleByLevel(subsequantLevel);
          if (style) {
            const newattrs = Object.assign(
              {},
              nodesBeforeSelection[0].node.attrs
            );
            newattrs.styleName = style.styleName;
            tr = tr.setNodeMarkup(
              nodesBeforeSelection[0].pos,
              undefined,
              newattrs
            );
          }
        }
      }
    }
  }
  return tr;
}

// function addElementAfter(nodeAttrs, state, tr, startPos, nextLevel) {
//   const counter = nodeAttrs.styleLevel ? nodeAttrs.styleLevel : 1;
//   const level = nextLevel ? nextLevel - 1 : 0;

//   const paragraph = state.schema.nodes['paragraph'];

//   for (let index = level; index > counter; index--) {
//     nodeAttrs.styleLevel = index;
//     nodeAttrs.styleName = 'None';
//     nodeAttrs.customStyle = null;
//     const paragraphNode = paragraph.create(nodeAttrs, null, null);
//     tr = tr.insert(startPos, Fragment.from(paragraphNode));
//   }

//   return tr;
// }

// function setNodeAttribute(state, tr, startPos, newattrs) {
//   if (!tr) {
//     tr = state.tr;
//   }
//   tr = tr.setNodeMarkup(startPos, undefined, newattrs);
//   return tr;
// }

function nodeAssignment(state) {
  const nodes = [];
  state.doc.descendants((node, pos) => {
    if (requiredAddAttr(node)) {
      const styleLevel = getStyleLevel(node.attrs.styleName);
      if (styleLevel) {
        nodes.push({
          node,
          pos,
        });
      }
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
          if (null !== style) {
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
  if (nextLineStyle) {
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
  const retObj = {modified: false};
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

// [FS] IRAD-1145 2021-01-22
// apply first word/sentence bold style
function applyLineStyle(prevState, nextState, tr) {
  const {selection, schema} = nextState;
  const currentPos = selection.$cursor
    ? selection.$cursor.pos
    : selection.$to.pos;
  const para = findParentNodeClosestToPos(
    nextState.doc.resolve(currentPos),
    (node) => {
      return node.type === schema.nodes.paragraph;
    }
  );

  if (para) {
    const {pos, node} = para;
    // Check styleName is available for node
    if (node.attrs && node.attrs.styleName) {
      const styleProp = getCustomStyleByName(node.attrs.styleName);
      if (null !== styleProp && styleProp.styles.boldPartial) {
        if (!tr) {
          tr = nextState.tr;
        }
        tr = addMarksToLine(
          tr,
          nextState,
          node,
          pos,
          styleProp.styles.boldSentence
        );
      }
    }
  }
  return tr;
}

// get text content from selected node
function getNodeText(node: Node) {
  let textContent = '';
  node.descendants(function (child: Node, pos: number, parent: Node) {
    if ('text' === child.type.name) {
      textContent = `${textContent}${child.text}`;
    }
  });
  return textContent;
}

// add bold marks to node
function addMarksToLine(tr, state, node, pos, boldSentence) {
  const markType = state.schema.marks[MARK_STRONG];
  let textContent = getNodeText(node);
  const endPos = textContent.length;
  let content = '';
  if (boldSentence) {
    content = textContent.split('.');
  } else {
    content = textContent.split(' ');
  }
  textContent = content[0];
  tr = tr.addMark(pos, pos + textContent.length + 1, markType.create(null));
  if (content.length > 1) {
    tr = tr.removeMark(
      pos + textContent.length + 1,
      pos + endPos + 1,
      markType
    );
  }
  return tr;
}
