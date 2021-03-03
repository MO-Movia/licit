// @flow
import {EditorState, TextSelection} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import {Node, Fragment, Schema} from 'prosemirror-model';
import UICommand from './ui/UICommand';
import {atViewportCenter} from './ui/PopUpPosition';
import createPopUp from './ui/createPopUp';
import CustomStyleEditor from './ui/CustomStyleEditor';
import MarkToggleCommand from './MarkToggleCommand';
import TextColorCommand from './TextColorCommand';
import TextHighlightCommand from './TextHighlightCommand';
import TextAlignCommand from './TextAlignCommand';
import FontTypeCommand from './FontTypeCommand';
import FontSizeCommand from './FontSizeCommand';
import TextLineSpacingCommand from './TextLineSpacingCommand';
import {setTextAlign} from './TextAlignCommand';
import ParagraphSpacingCommand from './ParagraphSpacingCommand';
import IndentCommand from './IndentCommand';
import {
  removeTextAlignAndLineSpacing,
  clearCustomStyleAttribute,
} from './clearCustomStyleMarks';
import {getCustomStyleByName, getCustomStyleByLevel} from './customStyle';
import type {StyleProps} from './Types';
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
import {PARAGRAPH} from './NodeNames';
import {getLineSpacingValue} from './ui/toCSSLineSpacing';
import {
  RESERVED_STYLE_NONE,
  RESERVED_STYLE_NONE_NUMBERING,
} from './ParagraphNodeSpec';

export const STRONG = 'strong';
export const EM = 'em';
export const COLOR = 'color';
export const FONTSIZE = 'fontSize';
export const FONTNAME = 'fontName';
export const STRIKE = 'strike';
export const SUPER = 'super';
export const TEXTHL = 'textHighlight';
export const UNDERLINE = 'underline';
export const ALIGN = 'align';
export const LHEIGHT = 'lineHeight';
export const SAFTER = 'paragraphSpacingAfter';
export const SBEFORE = 'paragraphSpacingBefore';
export const ATTR_OVERRIDDEN = 'overridden';
export const INDENT = 'indent';
export const NUMBERING = 'hasNumbering';
export const LEVELBASEDINDENT = 'isLevelbased';
export const LEVEL = 'styleLevel';
export const BOLDPARTIAL = 'boldPartial';
const MISSED_HEIRACHY_ELEMENT = {};
const nodesAfterSelection = [];
// [FS] IRAD-1042 2020-10-01
// Creates commands based on custom style JSon object
export function getCustomStyleCommands(customStyle: any) {
  const commands = [];
  for (const property in customStyle) {
    switch (property) {
      case STRONG:
        // [FS] IRAD-1043 2020-10-23
        // Issue fix : unselect a style when creating a new style
        // and that unselected styles also applied in selected paragraph
        if (customStyle[property])
          commands.push(new MarkToggleCommand('strong'));
        break;

      case EM:
        // [FS] IRAD-1043 2020-10-23
        // Issue fix : unselect a style when creating a new style
        // and that unselected styles also applied in selected paragrapgh
        if (customStyle[property]) commands.push(new MarkToggleCommand('em'));
        break;

      case COLOR:
        commands.push(new TextColorCommand(customStyle[property]));
        break;

      case FONTSIZE:
        commands.push(new FontSizeCommand(Number(customStyle[property])));
        break;

      case FONTNAME:
        commands.push(new FontTypeCommand(customStyle[property]));
        break;

      case STRIKE:
        // [FS] IRAD-1043 2020-10-23
        // Issue fix : unselect a style when creating a new style
        // and that unselected styles also applied in selected paragrapgh
        if (customStyle[property])
          commands.push(new MarkToggleCommand('strike'));
        break;

      case SUPER:
        commands.push(new MarkToggleCommand('super'));
        break;

      case TEXTHL:
        commands.push(new TextHighlightCommand(customStyle[property]));
        break;

      case UNDERLINE:
        // [FS] IRAD-1043 2020-12-15
        // Issue fix: user unselect Underline from a existing custom style, it didn't reflect in editor
        if (customStyle[property])
          commands.push(new MarkToggleCommand('underline'));
        break;

      case ALIGN:
        commands.push(new TextAlignCommand(customStyle[property]));
        break;

      case LHEIGHT:
        commands.push(new TextLineSpacingCommand(customStyle[property]));
        break;

      // [FS] IRAD-1100 2020-11-05
      // Add in leading and trailing spacing (before and after a paragraph)
      case SAFTER:
        commands.push(new ParagraphSpacingCommand(customStyle[property], true));
        break;

      case SBEFORE:
        commands.push(
          new ParagraphSpacingCommand(customStyle[property], false)
        );
        break;
      case INDENT:
        if (0 < customStyle[property]) {
          commands.push(new IndentCommand(customStyle[property]));
        }
        break;

      case LEVELBASEDINDENT:
        // [FS] IRAD-1162 2021-1-25
        // Bug fix: indent not working along with level
        if (customStyle[LEVEL] && Number(customStyle[LEVEL]) > 0) {
          commands.push(new IndentCommand(customStyle[LEVEL]));
        }
        break;
      default:
        break;
    }
  }
  return commands;
}

class CustomStyleCommand extends UICommand {
  _customStyleName: string;
  _customStyle = [];
  _popUp = null;

  constructor(customStyle: any, customStyleName: string) {
    super();
    this._customStyle = customStyle;
    this._customStyleName = customStyleName;
  }

  renderLabel = (state: EditorState): any => {
    return this._customStyleName;
  };

  getTheInlineStyles = (isInline: boolean) => {
    let attrs = {};
    let propsCopy = [];
    propsCopy = Object.assign(propsCopy, this._customStyle);

    propsCopy.forEach((style) => {
      attrs = Object.assign(attrs, style);
      Object.entries(style).forEach(([key, value]) => {
        if (isInline && typeof value === 'boolean') {
          delete attrs[key];
        } else if (!isInline && typeof value != 'boolean') {
          delete attrs[key];
        }
      });
    });
    return attrs;
  };

  isEmpty = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  };

  isEnabled = (
    state: EditorState,
    view: EditorView,
    menuTitle: string
  ): boolean => {
    // [FS] IRAD-1053 2020-10-22
    // Disable the Clear style menu when no styles applied to a paragraph
    return !(
      'clearstyle' == menuTitle &&
      RESERVED_STYLE_NONE == this.isCustomStyleApplied(state)
    );
  };

  // [FS] IRAD-1053 2020-10-22
  // returns the applied style of a paragraph
  isCustomStyleApplied(editorState: EditorState) {
    const {selection, doc} = editorState;
    const {from, to} = selection;
    let customStyleName = RESERVED_STYLE_NONE;
    doc.nodesBetween(from, to, (node, pos) => {
      if (node.attrs.styleName) {
        customStyleName = node.attrs.styleName;
      }
    });
    return customStyleName;
  }

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    let {tr} = state;
    const {selection} = state;
    const startPos = selection.$from.before(1);
    const endPos = selection.$to.after(1);
    const node = getNode(state, startPos, endPos, tr);
    const newattrs = Object.assign({}, node.attrs);
    let isValidated = true;

    if ('newstyle' === this._customStyle) {
      this.editWindow(state, view, 0);
      return false;
    } else if ('editall' === this._customStyle) {
      this.editWindow(state, view, 3);
      return false;
    }
    // [FS] IRAD-1053 2020-10-08
    // to remove the custom styles applied in the selected paragraph
    else if (
      'clearstyle' === this._customStyle ||
      RESERVED_STYLE_NONE === this._customStyle
    ) {
      tr = this.clearCustomStyles(state.tr.setSelection(selection), state);
      tr = removeTextAlignAndLineSpacing(tr, state.schema);
      hasMismatchHeirarchy(state, tr, node, startPos, endPos);
      tr = createEmptyElement(state, tr, node, startPos, endPos, newattrs);
      const currentNodeAttrs = Object.assign({}, newattrs);
      currentNodeAttrs.styleName = 'None';
      currentNodeAttrs.id = 0;
      tr = tr.setNodeMarkup(startPos, undefined, currentNodeAttrs);
      if (dispatch && tr.docChanged) {
        dispatch(tr);
        return true;
      }
      return false;
    }

    // [FS] IRAD-1213 2020-02-23
    // validating the appropariate styles with corresponding levels are defined
    // if no levels are defined no operation
    //
    if (
      hasMismatchHeirarchy(
        state,
        tr,
        node,
        startPos,
        endPos,
        this._customStyle.styleName
      )
    ) {
      isValidated = checkLevlsAvailable();
    }
    if (isValidated) {
      tr = applyStyle(
        this._customStyle,
        this._customStyle.styleName,
        state,
        tr
      );
      if (tr.docChanged || tr.storedMarksSet) {
        // view.focus();
        dispatch && dispatch(tr);
        return true;
      }
    } else {
      // TODO: need to show alert with popup UI
      window.alert(
        'This Numberings breaks heirarchy, Previous levels are missing '
      );
    }

    return false;
  };

  // [FS] IRAD-1053 2020-12-17
  // to clear the custom styles in the selected paragrapgh
  clearCustomStyles(tr, editorState: EditorState) {
    const {selection, doc} = editorState;
    const {from, to} = selection;
    let customStyleName = RESERVED_STYLE_NONE;
    doc.nodesBetween(from, to, (node, pos) => {
      if (node.attrs.styleName) {
        customStyleName = node.attrs.styleName;
        const storedmarks = getMarkByStyleName(
          customStyleName,
          editorState.schema
        );
        tr = this.removeMarks(storedmarks, tr, node);
        return tr;
      }
      return tr;
    });
    return tr;
  }

  removeMarks(marks, tr: Transform, node: Node) {
    const {selection} = tr;
    let {from, to} = selection;
    const {empty} = selection;
    if (empty) {
      from = selection.$from.before(1);
      to = selection.$to.after(1);
    }

    // reset the custom style name to NONE after remove the styles
    clearCustomStyleAttribute(node);
    marks.forEach((mark) => {
      tr = tr.removeMark(from, to, mark.type);
    });
    return tr;
  }

  // shows the create style popup
  editWindow(state: EditorState, view: EditorView, mode) {
    const {dispatch} = view;
    let tr = state.tr;
    const doc = state.doc;

    this._popUp = createPopUp(
      CustomStyleEditor,
      this.createCustomObject(view, mode),
      {
        autoDismiss: false,
        position: atViewportCenter,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            //handle save style object part here
            if (undefined !== val) {
              // [FS] IRAD-1231 2021-03-02
              // Issue fix: The edited styles are not affected the document
              if (3 === mode) {
                // edit All
                val.forEach((style) => {
                  this.getCustomStyles(view.runtime, style, view);
                });
              } else {
                if (
                  view.runtime &&
                  typeof view.runtime.saveStyle === 'function'
                ) {
                  delete val.editorView;
                  view.runtime.saveStyle(val).then((result) => {
                    // Issue fix: Created custom style Numbering not applied to paragraph.
                    tr = tr.setSelection(TextSelection.create(doc, 0, 0));
                    // Apply created styles to document
                    const {selection} = state;
                    const startPos = selection.$from.before(1);
                    const endPos = selection.$to.after(1);
                    const node = getNode(state, startPos, endPos, tr);
                    if (
                      !hasMismatchHeirarchy(
                        state,
                        tr,
                        node,
                        startPos,
                        endPos,
                        val.styleName
                      )
                    ) {
                      tr = applyStyle(val, val.styleName, state, tr);
                      dispatch(tr);
                    } else {
                      window.alert(
                        'This Numberings breaks heirarchy, Previous levels are missing '
                      );
                    }
                  });
                }
              }
              if (
                view.runtime &&
                typeof view.runtime.saveStyle === 'function'
              ) {
                delete val.editorView;
                view.runtime.saveStyle(val).then((result) => {
                  // Issue fix: Created custom style Numbering not applied to paragraph.
                  tr = tr.setSelection(TextSelection.create(doc, 0, 0));
                  // Apply created styles to document
                  const {selection} = state;
                  const startPos = selection.$from.before(1);
                  const endPos = selection.$to.after(1);
                  const node = getNode(state, startPos, endPos, tr);
                  if (
                    !hasMismatchHeirarchy(
                      state,
                      tr,
                      node,
                      startPos,
                      endPos,
                      val.styleName
                    )
                  ) {
                    tr = applyStyle(val, val.styleName, state, tr);
                    dispatch(tr);
                  } else {
                    window.alert(
                      'This Numberings breaks heirarchy, Previous levels are missing '
                    );
                  }
                });
              }
            }
          }
        },
      }
    );
  }

  // [FS] IRAD-1231 2021-03-02
  // update the document with the edited styles list.
  getCustomStyles(runtime, styleName, editorView) {
    if (runtime && typeof runtime.getStylesAsync === 'function') {
      runtime.getStylesAsync().then((result) => {
        if (styleName) {
          const {dispatch, state} = editorView;
          let tr;
          result.forEach((obj) => {
            if (styleName === obj.styleName) {
              tr = updateDocument(state, state.tr, styleName, obj.styles);
            }
          });
          if (tr) {
            dispatch(tr);
          }
        }
      });
    }
  }

  // creates a sample style object
  createCustomObject(editorView, mode) {
    return {
      styleName: '',
      mode: mode, //0 = new , 1- modify, 2- rename, 3- editall
      styles: {},
      // runtime: runtime,
      editorView: editorView,
    };
  }
}

function compareMarkWithStyle(mark, style, tr, startPos, endPos, retObj) {
  let same = false;
  let overridden = false;

  switch (mark.type.name) {
    case MARK_STRONG:
      same = undefined != style[STRONG];
      break;
    case MARK_EM:
      same = undefined != style[EM];
      break;
    case MARK_TEXT_COLOR:
      same = mark.attrs['color'] == style[COLOR];
      break;
    case MARK_FONT_SIZE:
      same = mark.attrs['pt'] == style[FONTSIZE];
      break;
    case MARK_FONT_TYPE:
      same = mark.attrs['name'] == style[FONTNAME];
      break;
    case MARK_STRIKE:
      same = undefined != style[STRIKE];
      break;
    case MARK_SUPER:
      break;
    case MARK_TEXT_HIGHLIGHT:
      break;
    case MARK_UNDERLINE:
      same = undefined != style[UNDERLINE];
      break;
    default:
      break;
  }

  overridden = !same;

  if (
    undefined != mark.attrs[ATTR_OVERRIDDEN] &&
    mark.attrs[ATTR_OVERRIDDEN] != overridden &&
    tr.curSelection
  ) {
    mark.attrs[ATTR_OVERRIDDEN] = overridden;

    tr = tr.removeMark(startPos, endPos, mark);
    tr = tr.addMark(startPos, endPos, mark);
    retObj.modified = true;
  }
  /*
    case SUPER:
    case TEXTHL:
    case ALIGN:
    case LHEIGHT:*/

  return tr;
}

export function updateOverrideFlag(
  styleName: string,
  tr: Transform,
  node: Node,
  startPos: Number,
  endPos: Number,
  retObj: any
) {
  const styleProp = getCustomStyleByName(styleName);
  if (styleProp && styleProp.styles) {
    node.descendants(function (child: Node, pos: number, parent: Node) {
      if (child instanceof Node) {
        child.marks.forEach(function (mark, index) {
          tr = compareMarkWithStyle(
            mark,
            styleProp.styles,
            tr,
            startPos,
            endPos,
            retObj
          );
        });
      }
    });
  }
  return tr;
}

function onLoadRemoveAllMarksExceptOverridden(
  node: Node,
  schema: Schema,
  from: number,
  to: number,
  tr: Transform
) {
  const tasks = [];
  node.descendants(function (child: Node, pos: number, parent: Node) {
    if (child instanceof Node) {
      child.marks.forEach(function (mark, index) {
        if (!mark.attrs[ATTR_OVERRIDDEN]) {
          tasks.push({
            child,
            pos,
            mark,
          });
        }
      });
    }
  });

  return handleRemoveMarks(tr, tasks, from, to, schema);
}

export function getMarkByStyleName(styleName: string, schema: Schema) {
  const styleProp = getCustomStyleByName(styleName);
  const marks = [];
  let markType = null;
  let attrs = null;
  if (styleProp) {
    for (const property in styleProp.styles) {
      switch (property) {
        case STRONG:
        case BOLDPARTIAL:
          if (styleProp.styles[property]) {
            markType = schema.marks[MARK_STRONG];
            marks.push(markType.create(attrs));
          }
          break;

        case EM:
          markType = schema.marks[MARK_EM];
          if (styleProp.styles[property]) marks.push(markType.create(attrs));
          break;

        case COLOR:
          markType = schema.marks[MARK_TEXT_COLOR];
          attrs = styleProp.styles[property]
            ? {color: styleProp.styles[property]}
            : null;
          marks.push(markType.create(attrs));
          break;

        case FONTSIZE:
          markType = schema.marks[MARK_FONT_SIZE];
          attrs = styleProp.styles[property]
            ? {pt: styleProp.styles[property]}
            : null;
          marks.push(markType.create(attrs));
          break;

        case FONTNAME:
          markType = schema.marks[MARK_FONT_TYPE];
          attrs = styleProp.styles[property]
            ? {name: styleProp.styles[property]}
            : null;
          marks.push(markType.create(attrs));
          break;

        case TEXTHL:
          markType = schema.marks[MARK_TEXT_HIGHLIGHT];
          attrs = styleProp.styles[property]
            ? {highlightColor: styleProp.styles[property]}
            : null;
          marks.push(markType.create(attrs));
          break;

        case UNDERLINE:
          markType = schema.marks[MARK_UNDERLINE];
          marks.push(markType.create(attrs));
          break;

        default:
          break;
      }
    }
  }
  return marks;
}
function applyStyleEx(
  styleProp: StyleProps,
  styleName: string,
  state: EditorState,
  tr: Transform,
  node: Node,
  startPos: number,
  endPos: number
) {
  const loading = !styleProp;
  if (loading) {
    styleProp = getCustomStyleByName(styleName);
  }
  const _commands = getCustomStyleCommands(styleProp.styles);

  if (loading) {
    tr = onLoadRemoveAllMarksExceptOverridden(
      node,
      state.schema,
      startPos,
      endPos,
      tr
    );
  } else {
    // [FS] IRAD-1087 2020-11-02
    // Issue fix: applied link is missing after applying a custom style.
    tr = removeAllMarksExceptLink(startPos, endPos, tr, state.schema);
  }

  const newattrs = Object.assign({}, node.attrs);
  // [FS] IRAD-1074 2020-10-22
  // Issue fix on not removing center alignment when switch style with center
  // alignment to style with left alignment
  newattrs['align'] = null;
  newattrs['lineSpacing'] = null;

  // [FS] IRAD-1131 2021-01-12
  // Indent overriding not working on a paragraph where custom style is applied
  newattrs['indent'] = null;
  newattrs['styleName'] = styleName;

  _commands.forEach((element) => {
    // to set the node attribute for text-align
    if (element instanceof TextAlignCommand) {
      newattrs['align'] = styleProp.styles.align;
      // to set the node attribute for line-height
    } else if (element instanceof TextLineSpacingCommand) {
      // [FS] IRAD-1104 2020-11-13
      // Issue fix : Linespacing Double and Single not applied in the sample text paragrapgh
      newattrs['lineSpacing'] = getLineSpacingValue(
        styleProp.styles.lineHeight
      );
    } else if (element instanceof ParagraphSpacingCommand) {
      // [FS] IRAD-1100 2020-11-05
      // Add in leading and trailing spacing (before and after a paragraph)
      newattrs['paragraphSpacingAfter'] = styleProp.styles.paragraphSpacingAfter
        ? styleProp.styles.paragraphSpacingAfter
        : null;
      newattrs['paragraphSpacingBefore'] = styleProp.styles
        .paragraphSpacingBefore
        ? styleProp.styles.paragraphSpacingBefore
        : null;
    } else if (element instanceof IndentCommand) {
      // [FS] IRAD-1162 2021-1-25
      // Bug fix: indent not working along with level
      newattrs['indent'] = styleProp.styles.isLevelbased
        ? styleProp.styles.styleLevel
        : styleProp.styles.indent;
    }
    // to set the marks for the node
    if (typeof element.executeCustom == 'function') {
      tr = element.executeCustom(state, tr, startPos, endPos);
    }
  });

  // to set custom styleName attribute for node
  newattrs['styleName'] = styleName;
  tr = applyLineStyle(node, styleProp.styles, state, tr, startPos, endPos);
  const storedmarks = getMarkByStyleName(styleName, state.schema);
  tr = _setNodeAttribute(state, tr, startPos, endPos, newattrs);
  tr = createEmptyElement(state, tr, node, startPos, endPos, newattrs);
  tr.storedMarks = storedmarks;
  return tr;
}

// [FS] IRAD-1213 2020-02-23
// Loop the whole document
// if  any heirachy misses return true and keep the object in a global object
function hasMismatchHeirarchy(
  state: EditorState,
  tr: Transform,
  node: Node /* The current node */,
  startPos: number,
  endPos: number,
  styleName /* New style to be applied */
) {
  const styleLevel = getStyleLevel(styleName);
  const currentLevel = getStyleLevel(node.attrs.styleName);

  const attrs = Object.assign({}, node.attrs);
  attrs['styleLevel'] = Number(styleLevel);

  let previousLevel = null;
  let levelDiff = 0;
  let nextLevel = null;
  const nodesBeforeSelection = [];

  let hasHeirarchyBroken = false;
  // Manage heirachy for nodes of previous  position
  if (startPos !== 0) {
    // Fix: document Load Error- Instead of state doc here give transaction doc,because when we apply changes
    // dynamically through transactions the node position  get affected,
    // so depending on state doc nodes' positions is incorrect.
    tr.doc.descendants((node, pos) => {
      if (isAllowedNode(node)) {
        if (pos < startPos) {
          nodesBeforeSelection.push({pos, node});
        } else if (pos >= endPos) {
          const nodeStyleLevel = getStyleLevel(node.attrs.styleName);
          if (nodeStyleLevel) {
            nodesAfterSelection.push({pos, node});
          }
        }
      }
      return true;
    });

    nodesBeforeSelection.reverse();
    nodesBeforeSelection.every((item) => {
      previousLevel = getStyleLevel(item.node.attrs.styleName);
      return previousLevel === 0 ? true : false;
    });

    if (null === previousLevel && null == currentLevel) {
      // No levels established before.
      if (styleLevel !== 1) {
        setNewElementObject(attrs, startPos, null, false);
        hasHeirarchyBroken = true;
      }
    } else {
      //	If this is the first level, identify the level difference with previous level.
      levelDiff = previousLevel ? styleLevel - previousLevel : styleLevel;

      if (1 < levelDiff || 0 > levelDiff) {
        // If NOT applying (same level OR adjacent level)
        setNewElementObject(attrs, startPos, previousLevel, false);
        hasHeirarchyBroken = true;
      }
    }
  } else {
    if (styleLevel !== 1) {
      for (let index = 1; index < Number(styleLevel); index++) {
        if (null === getCustomStyleByLevel(index)) {
          hasHeirarchyBroken = true;
          index = Number(styleLevel) + 1;
        }
      }
      setNewElementObject(attrs, startPos, null, false);
    } else {
      setNewElementObject(attrs, startPos, previousLevel, false);
    }
  }

  if (0 < nodesAfterSelection.length) {
    const selectedLevel = styleLevel;
    let currentLevel = 0;
    nodesAfterSelection.every((item) => {
      nextLevel = getStyleLevel(item.node.attrs.styleName);
      levelDiff = nextLevel - selectedLevel;
      if (nextLevel === styleLevel || levelDiff === 1) {
        // do nothing
      } else if (0 == styleLevel) {
        // No level style
        // adjustElementAfter(attrs, endPos, nodesAfterSelection, nextLevel);
        currentLevel = nextLevel - 1;
        const style = getCustomStyleByLevel(currentLevel);
        const newattrs = Object.assign({}, item.node.attrs);
        newattrs.styleName = style.styleName;
        setNewElementObject(newattrs, item.pos, 0, true);
        hasHeirarchyBroken = false;
      } else {
        // setNewElementObject(attrs, endPos, nextLevel);
        // hasHeirarchyBroken = true;
      }
    });
  }
  // return tr;
  return hasHeirarchyBroken;
}

// add new blank element and apply curresponding styles
function createEmptyElement(
  state: EditorState,
  tr: Transform,
  node: Node /* The current node */,
  startPos: number,
  endPos: number,
  attrs /* New style to be applied */
) {
  if (
    null !== MISSED_HEIRACHY_ELEMENT &&
    undefined !== MISSED_HEIRACHY_ELEMENT.attrs
  ) {
    if (!MISSED_HEIRACHY_ELEMENT.isAfter) {
      tr = addElement(
        MISSED_HEIRACHY_ELEMENT.attrs,
        state,
        tr,
        startPos,
        MISSED_HEIRACHY_ELEMENT.previousLevel
      );
    } else {
      let nextLevel = getStyleLevel(MISSED_HEIRACHY_ELEMENT.attrs.styleName);
      let subsequantLevel = 0;
      let counter = 0;
      nodesAfterSelection.forEach((item) => {
        if (0 === counter) {
          delete MISSED_HEIRACHY_ELEMENT.attrs.styleLevel;
          tr = setNodeMarkup(
            tr,
            MISSED_HEIRACHY_ELEMENT.startPos,
            MISSED_HEIRACHY_ELEMENT.attrs
          );
        } else {
          subsequantLevel = getStyleLevel(item.node.attrs.styleName);
          if (nextLevel !== subsequantLevel) {
            subsequantLevel = Number(subsequantLevel) - 1;
            const style = getCustomStyleByLevel(subsequantLevel);
            const newattrs = Object.assign({}, item.node.attrs);
            newattrs.styleName = style.styleName;
            tr = setNodeMarkup(tr, item.pos, newattrs);
            nextLevel = subsequantLevel;
          }
        }
        counter++;
      });
    }
  } else {
    tr = addElement(attrs, state, tr, startPos, 0);
  }
  nodesAfterSelection.splice(0);
  setNewElementObject(undefined, 0, null, false);
  return tr;
}

// check the styles with specified levels are defined
function checkLevlsAvailable() {
  let isAvailable = true;
  for (
    let index = 1;
    index < MISSED_HEIRACHY_ELEMENT.attrs.styleLevel;
    index++
  ) {
    const styleLevel = getCustomStyleByLevel(index);
    if (!styleLevel) {
      isAvailable = false;
      index = 11;
    }
  }
  return isAvailable;
}
// keep the position and node details in a global variable
function setNewElementObject(attrs, startPos, previousLevel, isAfter) {
  MISSED_HEIRACHY_ELEMENT.isAfter = isAfter;
  MISSED_HEIRACHY_ELEMENT.attrs = attrs;
  MISSED_HEIRACHY_ELEMENT.startPos = startPos;
  MISSED_HEIRACHY_ELEMENT.previousLevel = previousLevel;
}

function setNodeMarkup(tr, pos, attrs): Transform {
  tr = tr.setNodeMarkup(pos, undefined, attrs);
  return tr;
}
function insertParagraph(nodeAttrs, startPos, tr, index, state) {
  const paragraph = state.schema.nodes[PARAGRAPH];
  // [FS] IRAD-1202 2021-02-15
  // Handle Numbering case for None styles.
  // Use the styleName to hold the style level.
  nodeAttrs.styleName = getCustomStyleByLevel(index).styleName;
  const paragraphNode = paragraph.create(nodeAttrs, null, null);
  tr = tr.insert(startPos, Fragment.from(paragraphNode));
  return tr;
}

function addElementEx(nodeAttrs, state, tr, startPos, after, previousLevel) {
  const styleLevel = nodeAttrs.styleLevel;
  let level = 0;
  let counter = 0;
  const nextLevel = 0;
  if (after) {
    // level = nextLevel ? nextLevel - 1 : 0;
    counter = styleLevel ? styleLevel : 1;
    //TODO: Need to check this code it wont work
    addElementAfter(nodeAttrs, state, tr, startPos, nextLevel);
  } else {
    level = styleLevel ? styleLevel - 1 : 0;
    counter = previousLevel ? previousLevel : 0;
  }

  for (let index = level; index > counter; index--) {
    tr = insertParagraph(nodeAttrs, startPos, tr, index, state);
  }
  return {tr, level, counter};
}

function addElement(nodeAttrs, state, tr, startPos, previousLevel) {
  return addElementEx(nodeAttrs, state, tr, startPos, false, previousLevel).tr;
}

function addElementAfter(nodeAttrs, state, tr, startPos, nextLevel) {
  const {element} = addElementEx(
    nodeAttrs,
    state,
    tr,
    startPos,
    true,
    nextLevel
  );
  let {trx} = element;
  const {counter, level} = element;
  if (level === counter) {
    trx = insertParagraph(nodeAttrs, startPos, trx, 1);
  }
  return trx;
}

export function getStyleLevel(styleName) {
  let styleLevel = 0;
  if (undefined !== styleName && styleName) {
    const styleProp = getCustomStyleByName(styleName);
    if (
      null !== styleProp &&
      styleProp.styles.styleLevel &&
      styleProp.styles.hasNumbering
    ) {
      styleLevel = styleProp.styles.styleLevel;
    } else {
      if (styleName.includes(RESERVED_STYLE_NONE_NUMBERING)) {
        const indices = styleName.split(RESERVED_STYLE_NONE_NUMBERING);

        if (indices && 2 == indices.length) {
          styleLevel = parseInt(indices[1]);
        }
      }
    }
  }
  return styleLevel;
}

function applyLineStyle(node, style, state, tr, startPos, endPos) {
  if (style && style.boldPartial) {
    let textContent = '';
    let separator = '';
    const markType = state.schema.marks[MARK_STRONG];
    separator = style.boldSentence ? '.' : ' ';

    // [FS] IRAD-1181 2021-02-09
    // Issue fix: Multi-selecting several paragraphs and applying a style is only partially successfull
    tr.doc.nodesBetween(startPos, endPos, (node, pos) => {
      if ('text' === node.type.name) {
        textContent = `${textContent}${node.text}`;
        textContent = textContent.split(separator)[0];
        tr = tr.addMark(
          pos,
          pos + textContent.length + 1,
          markType.create(null)
        );
        textContent = '';
      }
    });
  }
  return tr;
}

export function executeCommands(
  state: EditorState,
  tr: Transform,
  styleName: string,
  startPos: number,
  endPos: number
) {
  const style = getCustomStyleByName(styleName);
  const _commands = getCustomStyleCommands(style);
  _commands.forEach((element) => {
    if (typeof element.executeCustom == 'function') {
      tr = element.executeCustom(state, tr, startPos, endPos);
    }
  });
  return tr;
}

// Need to change this function code duplicates with applyStyle()
export function applyLatestStyle(
  styleName: string,
  state: EditorState,
  tr: Transform,
  node: Node,
  startPos: number,
  endPos: number,
  style = null
) {
  return applyStyleEx(style, styleName, state, tr, node, startPos, endPos);
}

function isAllowedNode(node) {
  return node.type.name === 'paragraph';
}

// [FS] IRAD-1088 2020-10-05
// set custom style for node
function _setNodeAttribute(
  state: EditorState,
  tr: Transform,
  from: number,
  to: number,
  attribute: any
) {
  tr.doc.nodesBetween(from, to, (node, startPos) => {
    if (isAllowedNode(node)) {
      tr = tr.setNodeMarkup(startPos, undefined, attribute);
    }
  });
  return tr;
}

// [FS] IRAD-1087 2020-11-02
// Issue fix: Missing the applied link after applying a style
function removeAllMarksExceptLink(
  from: number,
  to: number,
  tr: Transform,
  schema: Schema
) {
  const {doc} = tr;
  const tasks = [];
  doc.nodesBetween(from, to, (node, pos) => {
    if (node.marks && node.marks.length) {
      node.marks.some((mark) => {
        if ('link' !== mark.type.name) {
          tasks.push({
            node,
            pos,
            mark,
          });
        }
      });
      return true;
    }
    return true;
  });
  return handleRemoveMarks(tr, tasks, from, to, schema);
}

function handleRemoveMarks(
  tr: Transform,
  tasks: any,
  from: Number,
  to: Number,
  schema: Schema
) {
  tasks.forEach((job) => {
    const {mark} = job;
    tr = tr.removeMark(from, to, mark.type);
  });
  tr = setTextAlign(tr, schema, null);
  return tr;
}

// [FS] IRAD-1087 2020-10-14
// Apply selected styles to document
export function applyStyle(
  style: StyleProps,
  styleName: string,
  state: EditorState,
  tr: Transform
) {
  const {selection} = state;
  const startPos = selection.$from.before(1);
  const endPos = selection.$to.after(1);
  return applyStyleToEachNode(state, startPos, endPos, tr, style, styleName);
}

// apply style to each selected node (when style applied to multiple paragraphs)
function applyStyleToEachNode(
  state: EditorState,
  from: Number,
  to: Number,
  tr: Transform,
  style: StyleProps,
  styleName: string
) {
  tr.doc.nodesBetween(from, to, (node, startPos) => {
    if (node.type.name === 'paragraph') {
      // [FS] IRAD-1182 2021-02-11
      // Issue fix: When style applied to multiple paragraphs, some of the paragraph's objectId found in deletedObjectId's
      tr = applyStyleEx(style, styleName, state, tr, node, startPos, to);
    }
  });
  return tr;
}

//to get the selected node
export function getNode(
  state: EditorState,
  from: Number,
  to: Number,
  tr: Transform
) {
  let selectedNode = null;
  tr.doc.nodesBetween(from, to, (node, startPos) => {
    if (node.type.name === 'paragraph') {
      selectedNode = node;
    }
  });
  return selectedNode;
}

// [FS] IRAD-1176 2021-02-08
// update the editor doc with the modified style changes.
export function updateDocument(state, tr, styleName, style) {
  const {doc} = state;
  doc.descendants(function (child, pos) {
    const contentLen = child.content.size;
    if (haveEligibleChildren(child, contentLen, styleName)) {
      tr = applyLatestStyle(
        child.attrs.styleName,
        state,
        tr,
        child,
        pos,
        pos + contentLen + 1,
        style
      );
    }
  });
  return tr;
}

// [FS] IRAD-1223 2021-03-01
// To check if the custom style have numbering and also used in the document
export function isCustomStyleAlreadyApplied(styleName, editorState) {
  let found = false;
  const {doc} = editorState;
  doc.nodesBetween(0, doc.nodeSize - 2, (node, pos) => {
    if (node.content && node.content.content && node.content.content.length) {
      const styleLevel = getStyleLevel(styleName);
      if (!found && 0 < styleLevel && node.attrs.styleName === styleName) {
        found = true;
      }
    }
  });
  return found;
}

function haveEligibleChildren(node, contentLen, styleName) {
  return (
    node.type.name === 'paragraph' &&
    0 < contentLen &&
    styleName === node.attrs.styleName
  );
}

export default CustomStyleCommand;
