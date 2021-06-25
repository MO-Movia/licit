// @flow
import { EditorState, TextSelection, Selection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import { Node, Fragment, Schema } from 'prosemirror-model';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { atViewportCenter } from './ui/PopUpPosition';
import createPopUp from './ui/createPopUp';
import AlertInfo from './ui/AlertInfo';
import CustomStyleEditor from './ui/CustomStyleEditor';
import MarkToggleCommand from './MarkToggleCommand';
import TextColorCommand from './TextColorCommand';
import TextHighlightCommand from './TextHighlightCommand';
import TextAlignCommand from './TextAlignCommand';
import FontTypeCommand from './FontTypeCommand';
import FontSizeCommand from './FontSizeCommand';
import TextLineSpacingCommand from './TextLineSpacingCommand';
import { setTextAlign } from './TextAlignCommand';
import ParagraphSpacingCommand from './ParagraphSpacingCommand';
import IndentCommand from './IndentCommand';
import {
  removeTextAlignAndLineSpacing,
  clearCustomStyleAttribute,
} from './clearCustomStyleMarks';
import {
  getCustomStyleByName,
  getCustomStyleByLevel,
  isPreviousLevelExists,
} from './customStyle';
import type { StyleProps, EditorRuntime } from './Types';
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
import { PARAGRAPH } from './NodeNames';
import { getLineSpacingValue } from './ui/toCSSLineSpacing';
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
const nodesBeforeSelection = [];
const selectedNodes = [];

function getCustomStyleCommandsEx(
  customStyle: any,
  property: string,
  commands: UICommand[]
): UICommand[] {
  switch (property) {
    case STRONG:
      // [FS] IRAD-1043 2020-10-23
      // Issue fix : unselect a style when creating a new style
      // and that unselected styles also applied in selected paragraph
      if (customStyle[property]) commands.push(new MarkToggleCommand('strong'));
      break;

    case EM:
      // [FS] IRAD-1043 2020-10-23
      // Issue fix : unselect a style when creating a new style
      // and that unselected styles also applied in selected paragraph
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
      // and that unselected styles also applied in selected paragraph
      if (customStyle[property]) commands.push(new MarkToggleCommand('strike'));
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
      commands.push(new ParagraphSpacingCommand(customStyle[property], false));
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

  return commands;
}

// [FS] IRAD-1042 2020-10-01
// Creates commands based on custom style JSon object
export function getCustomStyleCommands(customStyle: any) {
  let commands: UICommand[] = [];
  for (const property in customStyle) {
    commands = getCustomStyleCommandsEx(customStyle, property, commands);
  }
  return commands;
}

class CustomStyleCommand extends UICommand {
  _customStyleName: string;
  _customStyle: any;
  _popUp = null;

  constructor(customStyle: any, customStyleName: string) {
    super();
    this._customStyle = customStyle;
    this._customStyleName = customStyleName;
  }

  renderLabel = (state: EditorState): any => {
    return this._customStyleName;
  };

  isEmpty = (obj: Object) => {
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
      'clearstyle' === menuTitle &&
      RESERVED_STYLE_NONE === this.isCustomStyleApplied(state)
    );
  };

  // [FS] IRAD-1053 2020-10-22
  // returns the applied style of a paragraph
  isCustomStyleApplied(editorState: EditorState) {
    const { selection, doc } = editorState;
    const { from, to } = selection;
    let customStyleName = RESERVED_STYLE_NONE;
    doc.nodesBetween(from, to, (node, pos) => {
      if (node.attrs.styleName) {
        customStyleName = node.attrs.styleName;
      }
    });
    return customStyleName;
  }

  executeClearStyle(
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    node: any,
    startPos: number,
    endPos: number,
    newattrs: any,
    selection: Selection
  ) {
    let done = false;
    let tr = this.clearCustomStyles(state.tr.setSelection(selection), state);

    hasMismatchHeirarchy(state, tr, node, startPos, endPos);
    // [FS] IRAD-1480 2021-06-25
    // Indenting not remove when clear style is applied
    newattrs = Object.assign({}, node ? node.attrs : {});
    newattrs['styleName'] = RESERVED_STYLE_NONE;
    newattrs['id'] = '';
    tr = tr.setNodeMarkup(startPos, undefined, newattrs);
    tr = removeTextAlignAndLineSpacing(tr, state.schema);
    tr = createEmptyElement(
      state,
      tr,
      node,
      startPos,
      endPos,
      node ? node.attrs : {}
    );
    if (dispatch && tr.docChanged) {
      dispatch(tr);
      done = true;
    }
    return done;
  }

  execute = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView
  ): boolean => {
    let { tr } = state;
    const { selection } = state;
    const startPos = selection.$from.before(1);
    const endPos = selection.$to.after(1) - 1;
    const node = getNode(state, startPos, endPos, tr);
    const newattrs = Object.assign({}, node ? node.attrs : {});
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
      return this.executeClearStyle(
        state,
        dispatch,
        node,
        startPos,
        endPos,
        newattrs,
        selection
      );
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
        this._customStyle ? this._customStyle.styleName : ''
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
        dispatch && dispatch(tr);
        return true;
      }
    } else {
      this.showAlert();
    }

    return false;
  };

  showAlert() {
    const anchor = null;
    this._popUp = createPopUp(
      AlertInfo,
      {
        content:
          'This Numberings breaks heirarchy, Previous levels are missing ',
        title: 'Style Error!!!',
      },
      {
        anchor,
        position: atViewportCenter,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
          }
        },
      }
    );
  }

  // [FS] IRAD-1053 2020-12-17
  // to clear the custom styles in the selected paragraph
  clearCustomStyles(tr: Transform<any>, editorState: EditorState) {
    const { selection, doc } = editorState;
    const { from, to } = selection;
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

  removeMarks(marks: [], tr: Transform, node: Node) {
    const { selection } = tr;
    let { from, to } = selection;
    const { empty } = selection;
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
  editWindow(state: EditorState, view: EditorView, mode: number) {
    const { dispatch } = view;
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

                  // [FS] IRAD-1415 2021-06-02
                  // Issue: Allow to create custom style numbering level 2 without level 1
                  if (
                    styleHasNumbering(val) &&
                    !isValidHeirarchy(
                      val.styleName,
                      parseInt(val.styles.styleLevel)
                    )
                  ) {
                    this.showAlert();
                  } else {
                    view.runtime.saveStyle(val).then((result) => {
                      // Issue fix: Created custom style Numbering not applied to paragraph.
                      tr = tr.setSelection(TextSelection.create(doc, 0, 0));
                      // Apply created styles to document
                      const { selection } = state;
                      const startPos = selection.$from.before(1);
                      const endPos = selection.$to.after(1);
                      const node = getNode(state, startPos, endPos, tr);
                      // [FS] IRAD-1238 2021-03-08
                      // Fix: Shows alert message 'This Numberings breaks hierarchy, Previous levels are missing' on create styles
                      // if a numbering applied in editor.
                      if (
                        !styleHasNumbering(val) ||
                        isValidHeirarchy(val.styleName, 0)
                      ) {
                        // to add previous heirarchy levels
                        hasMismatchHeirarchy(
                          state,
                          tr,
                          node,
                          startPos,
                          endPos,
                          val.styleName
                        );
                        tr = applyStyle(val, val.styleName, state, tr);
                        dispatch(tr);
                      }
                    });
                  }
                }
              }
            }
          }
          view.focus();
        },
      }
    );
  }

  // [FS] IRAD-1231 2021-03-02
  // update the document with the edited styles list.
  getCustomStyles(
    runtime: EditorRuntime,
    styleName: string,
    editorView: EditorView
  ) {
    if (runtime && typeof runtime.getStylesAsync === 'function') {
      runtime.getStylesAsync().then((result) => {
        if (styleName) {
          const { dispatch, state } = editorView;
          let tr;
          result.forEach((obj) => {
            if (styleName === obj.styleName) {
              tr = updateDocument(state, state.tr, styleName, obj);
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
  createCustomObject(editorView: EditorView, mode: number) {
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

  if (style) {
    switch (mark.type.name) {
      case MARK_STRONG:
        same = undefined !== style[STRONG];
        break;
      case MARK_EM:
        same = undefined !== style[EM];
        break;
      case MARK_TEXT_COLOR:
        same = mark.attrs['color'] === style[COLOR];
        break;
      case MARK_FONT_SIZE:
        same = mark.attrs['pt'] === style[FONTSIZE];
        break;
      case MARK_FONT_TYPE:
        same = mark.attrs['name'] === style[FONTNAME];
        break;
      case MARK_STRIKE:
      case MARK_SUPER:
      case MARK_TEXT_HIGHLIGHT:
        break;
      case MARK_UNDERLINE:
        same = undefined !== style[UNDERLINE];
        break;
      default:
        break;
    }
  }

  overridden = !same;

  if (
    undefined !== mark.attrs[ATTR_OVERRIDDEN] &&
    mark.attrs[ATTR_OVERRIDDEN] !== overridden &&
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
        // [FS] IRAD-1311 2021-05-06
        // Issue fix: Applied URL is removed when applying number style and refresh.
        if (!mark.attrs[ATTR_OVERRIDDEN] && 'link' !== mark.type.name) {
          // [FS] IRAD-1292 2021-06-03
          // Issue fix: On reload citation word not showing highlighted with custom style applied.
          if (!(mark.attrs && mark.attrs.hasCitation)) {
            tasks.push({
              child,
              pos,
              mark,
            });
          }
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
  if (styleProp && styleProp.styles) {
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
            ? { color: styleProp.styles[property] }
            : null;
          marks.push(markType.create(attrs));
          break;

        case FONTSIZE:
          markType = schema.marks[MARK_FONT_SIZE];
          attrs = styleProp.styles[property]
            ? { pt: styleProp.styles[property] }
            : null;
          marks.push(markType.create(attrs));
          break;

        case FONTNAME:
          markType = schema.marks[MARK_FONT_TYPE];
          attrs = styleProp.styles[property]
            ? { name: styleProp.styles[property] }
            : null;
          marks.push(markType.create(attrs));
          break;

        case TEXTHL:
          markType = schema.marks[MARK_TEXT_HIGHLIGHT];
          attrs = styleProp.styles[property]
            ? { highlightColor: styleProp.styles[property] }
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
  styleProp: ?StyleProps,
  styleName: string,
  state: EditorState,
  tr: Transform,
  node: Node,
  startPos: number,
  endPos: number
) {
  const loading = !styleProp;

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

  if (loading) {
    styleProp = getCustomStyleByName(styleName);
  }

  if (styleProp && styleProp.styles) {
    const _commands = getCustomStyleCommands(styleProp.styles);
    const newattrs = Object.assign({}, node.attrs);
    // [FS] IRAD-1074 2020-10-22
    // Issue fix on not removing center alignment when switch style with center
    // alignment to style with left alignment
    newattrs.align = null;
    newattrs.lineSpacing = null;

    // [FS] IRAD-1131 2021-01-12
    // Indent overriding not working on a paragraph where custom style is applied
    newattrs.indent = null;
    newattrs.styleName = styleName;

    _commands.forEach((element) => {
      if (styleProp && styleProp.styles) {
        // to set the node attribute for text-align
        if (element instanceof TextAlignCommand) {
          newattrs.align = styleProp.styles.align;
          // to set the node attribute for line-height
        } else if (element instanceof TextLineSpacingCommand) {
          // [FS] IRAD-1104 2020-11-13
          // Issue fix : Linespacing Double and Single not applied in the sample text paragraph
          newattrs.lineSpacing = getLineSpacingValue(
            styleProp.styles.lineHeight || ''
          );
        } else if (element instanceof ParagraphSpacingCommand) {
          // [FS] IRAD-1100 2020-11-05
          // Add in leading and trailing spacing (before and after a paragraph)
          newattrs.paragraphSpacingAfter =
            styleProp.styles.paragraphSpacingAfter || null;
          newattrs.paragraphSpacingBefore =
            styleProp.styles.paragraphSpacingBefore || null;
        } else if (element instanceof IndentCommand) {
          // [FS] IRAD-1162 2021-1-25
          // Bug fix: indent not working along with level
          newattrs.indent = styleProp.styles.isLevelbased
            ? styleProp.styles.styleLevel
            : styleProp.styles.indent;
        }
      }

      // to set the marks for the node
      if (
        element.executeCustom &&
        typeof element.executeCustom === 'function'
      ) {
        tr = element.executeCustom(state, tr, startPos, endPos);
      }
    });
    const storedmarks = getMarkByStyleName(styleName, state.schema);
    newattrs.id = null === newattrs.id ? '' : null;
    tr = _setNodeAttribute(state, tr, startPos, endPos, newattrs);
    tr.storedMarks = storedmarks;
  }
  return tr;
}

// [FS] IRAD-1238 2021-03-08
// Fix: Shows alert message 'This Numberings breaks hierarchy, Previous levels are missing' on create styles
// if a numbering applied in editor.
function styleHasNumbering(style) {
  let hasNumbering = false;
  hasNumbering = style.styles.hasNumbering ? style.styles.hasNumbering : false;
  return hasNumbering;
}

// [FS] IRAD-1238 2021-03-08
// Check for the style with previous numbering level exists
function isValidHeirarchy(
  styleName /* New style to be applied */,
  level: number
) {
  const styleLevel = level > 0 ? level : getStyleLevel(styleName);
  // to find if the previous level of this level present
  const previousLevel = styleLevel - 1;
  return isPreviousLevelExists(previousLevel);
}

// [FS] IRAD-1213 2020-02-23
// Loop the whole document
// if any heirachy misses return true and keep the object in a global object
function hasMismatchHeirarchy(
  state: EditorState,
  tr: Transform,
  node: Node /* The current node */,
  startPos: number,
  endPos: number,
  styleName /* New style to be applied */
) {
  const styleLevel = Number(getStyleLevel(styleName ? styleName : ''));
  const currentLevel = getStyleLevel(node.attrs.styleName);
  nodesBeforeSelection.splice(0);
  nodesAfterSelection.splice(0);
  const attrs = Object.assign({}, node.attrs);
  attrs['styleName'] = styleName;
  let previousLevel = null;
  let levelDiff = 0;
  let isAfter = false;

  let hasHeirarchyBroken = false;

  // Manage heirachy for nodes of previous  position
  // if (startPos !== 0) {
  // Fix: document Load Error- Instead of state doc here give transaction doc,because when we apply changes
  // dynamically through transactions the node position  get affected,
  // so depending on state doc nodes' positions is incorrect.
  tr.doc.descendants((node, pos) => {
    if (isAllowedNode(node)) {
      const nodeStyleLevel = getStyleLevel(node.attrs.styleName);
      if (nodeStyleLevel) {
        if (pos < startPos) {
          nodesBeforeSelection.push({ pos, node });
        } else if (pos >= endPos) {
          nodesAfterSelection.push({ pos, node });
        }
      }
    }
    return true;
  });
  if (nodesBeforeSelection.length === 0 && nodesAfterSelection.length === 0) {
    setNewElementObject(attrs, startPos, 0, false);
    hasHeirarchyBroken = true;
  }

  nodesBeforeSelection.forEach((item) => {
    previousLevel = Number(getStyleLevel(item.node.attrs.styleName));
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

    if (0 > levelDiff) {
      // If NOT applying (same level OR adjacent level)

      if (nodesAfterSelection.length === 0) {
        isAfter = true;
        previousLevel = Number(
          getStyleLevel(
            nodesBeforeSelection[nodesBeforeSelection.length - 1].node.attrs
              .styleName
          )
        );
      }
      setNewElementObject(attrs, startPos, previousLevel, isAfter);
      hasHeirarchyBroken = true;
    }
    if (levelDiff > 0) {
      if (selectedNodes.length !== 1) {
        previousLevel = Number(
          getStyleLevel(selectedNodes[0].node.attrs.styleName)
        );
      }
      setNewElementObject(attrs, startPos, previousLevel, false);
    }
  }

  if (0 < nodesAfterSelection.length) {
    const selectedLevel = styleLevel;
    let currentLevel = 0;
    let found = false;
    nodesAfterSelection.every((item) => {
      if (!found) {
        currentLevel = Number(getStyleLevel(item.node.attrs.styleName));
        levelDiff = selectedLevel - currentLevel;

        if (styleLevel > 1 && levelDiff >= 0) {
          if (
            nodesBeforeSelection.length > 0 &&
            nodesBeforeSelection[nodesBeforeSelection.length - 1].node.attrs
              .styleName !== RESERVED_STYLE_NONE
          ) {
            // do nothing
          } else {
            setNewElementObject(attrs, item.pos, 0, false);
            found = true;
            hasHeirarchyBroken = false;
          }

          // do nothing
        } else if (0 === styleLevel) {
          setNewElementObject(attrs, endPos, previousLevel, true);
          hasHeirarchyBroken = false;
        } else {
          if (levelDiff < 0) {
            setNewElementObject(attrs, endPos, selectedLevel, true);
            found = true;
          }
          hasHeirarchyBroken = true;
        }
      }
    });
  }
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
  /* Validate the missed heirachy object details are availale */
  if (undefined !== MISSED_HEIRACHY_ELEMENT.attrs) {
    if (!MISSED_HEIRACHY_ELEMENT.isAfter) {
      const appliedLevel = Number(
        getStyleLevel(MISSED_HEIRACHY_ELEMENT.attrs.styleName)
      );
      let hasNodeAfter = false;
      let subsequantLevel = 0;
      let posArray = [];
      let counter = 0;
      let newattrs = null;

      if (nodesBeforeSelection.length > 0) {
        nodesBeforeSelection.forEach((item) => {
          subsequantLevel = Number(getStyleLevel(item.node.attrs.styleName));
          if (0 === startPos && 0 === counter) {
            if (0 === subsequantLevel && 1 === appliedLevel) {
              // needEmptyElement = false;
            } else {
              if (subsequantLevel !== appliedLevel) {
                newattrs = Object.assign({}, item.node.attrs);
                posArray.push({
                  pos: startPos,
                  appliedLevel: appliedLevel,
                  currentLevel: subsequantLevel,
                });
              }
            }
          } else {
            if (startPos >= item.pos) {
              if (
                startPos !== 0 &&
                RESERVED_STYLE_NONE !== item.node.attrs.styleName &&
                Number(getStyleLevel(item.node.attrs.styleName)) > 0
              ) {
                if (appliedLevel - subsequantLevel > 1) {
                  newattrs = Object.assign({}, item.node.attrs);
                  posArray = [];
                  posArray.push({
                    pos: startPos,
                    appliedLevel: appliedLevel,
                    currentLevel: subsequantLevel,
                  });
                } else if (1 === appliedLevel - subsequantLevel) {
                  posArray = [];
                  hasNodeAfter = true;
                }
              } else {
                if (startPos !== 0 && RESERVED_STYLE_NONE === item.node.attrs.styleName) {
                  newattrs = Object.assign({}, item.node.attrs);
                  posArray.push({
                    pos: startPos,
                    appliedLevel: appliedLevel,
                    currentLevel: subsequantLevel,
                  });
                }
              }
            }
          }
          counter++;
        });
      }
      if (nodesAfterSelection.length > 0 && !hasNodeAfter) {
        nodesAfterSelection.forEach((item) => {
          if (startPos === item.pos) {
            newattrs = MISSED_HEIRACHY_ELEMENT.attrs;
            posArray.push({
              pos: startPos,
              appliedLevel: appliedLevel,
              currentLevel: 0,
            });
          } else if (startPos < item.pos) {
            newattrs = MISSED_HEIRACHY_ELEMENT.attrs;
            posArray.push({
              pos: startPos,
              appliedLevel: appliedLevel,
              currentLevel: 0,
            });
          } else if (startPos > item.pos) {
            posArray.push({
              pos: startPos,
              appliedLevel: appliedLevel,
              currentLevel: 0,
            });
          }
        });
      }
      // }
      if (
        nodesBeforeSelection.length === 0 &&
        nodesAfterSelection.length === 0
      ) {
        newattrs = MISSED_HEIRACHY_ELEMENT.attrs;
        posArray.push({
          pos: startPos,
          appliedLevel: appliedLevel,
          currentLevel: 0,
        });
      }

      if (posArray.length > 0) {
        tr = addElement(
          newattrs,
          state,
          tr,
          posArray[0].pos,
          false,
          posArray[0].appliedLevel,
          posArray[0].currentLevel
        );
      }
    } else {
      tr = manageElementsAfterSelection(
        nodesAfterSelection.length > 0
          ? nodesAfterSelection
          : nodesBeforeSelection,
        state,
        tr
      );
    }
  }

  nodesAfterSelection.splice(0);
  nodesBeforeSelection.splice(0);
  setNewElementObject(undefined, 0, null, false);
  return tr;
}

// [FS] IRAD-1387 2021-05-25
// Indent/deindent without heirachy break
export function allowCustomLevelIndent(
  tr: Transform,
  startPos: number,
  styleName: string,
  delta: number
) {
  const styleLevel = Number(getStyleLevel(styleName));
  let allowIndent = false;
  startPos = startPos < 2 ? 2 : startPos - 1;
  if (delta > 0) {
    for (let index = startPos; index >= 0; index--) {
      const element = tr.doc.resolve(index);
      if (element && element.parent) {
        const node = element.parent;
        if (isAllowedNode(node)) {
          if (RESERVED_STYLE_NONE !== node.attrs.styleName) {
            const nodeStyleLevel = Number(getStyleLevel(node.attrs.styleName));
            if (
              nodeStyleLevel >= styleLevel ||
              styleLevel - nodeStyleLevel === 1
            ) {
              allowIndent = true;
              break;
            } else {
              index = index - node.nodeSize || 0;
            }
          }
        } else {
          index = index - node.nodeSize || 0;
        }
      }
    }
  } else {
    startPos = startPos + 1;
    for (let index = startPos; index < tr.doc.nodeSize - 2; index++) {
      const element = tr.doc.resolve(index);
      if (element && element.parent) {
        const node = element.parent;
        if (isAllowedNode(node)) {
          if (RESERVED_STYLE_NONE !== node.attrs.styleName) {
            const nodeStyleLevel = Number(getStyleLevel(node.attrs.styleName));
            if (nodeStyleLevel >= styleLevel) {
              allowIndent = true;
              index = index - node.nodeSize;
              break;
            } else {
              index = index + node.nodeSize;
            }
          }
        } else {
          index = index + node.nodeSize;
        }
      }
    }
  }

  return allowIndent;
}

// Mange heirarchy for the elements after selection
function manageElementsAfterSelection(nodeArray, state, tr) {
  let selectedLevel = Number(MISSED_HEIRACHY_ELEMENT.previousLevel);
  let subsequantLevel = 0;
  let counter = 0;

  for (let index = 0; index < nodeArray.length; index++) {
    const item = nodeArray[index];
    subsequantLevel = Number(getStyleLevel(item.node.attrs.styleName));
    if (subsequantLevel !== 0 && selectedLevel !== subsequantLevel) {
      if (subsequantLevel - selectedLevel > 1) {
        subsequantLevel = subsequantLevel - 1;
        const style = getCustomStyleByLevel(subsequantLevel);
        if (style) {
          const newattrs = Object.assign({}, item.node.attrs);
          newattrs.styleName = style.styleName;
          tr = tr.setNodeMarkup(item.pos, undefined, newattrs);
          selectedLevel = subsequantLevel;
        }
        counter++;
      } else {
        index = nodeArray.length + 1;
      }
    } else {
      if (subsequantLevel !== 0 && counter === 0 && nodeArray.length === 0) {
        const style = getCustomStyleByLevel(1);
        if (style) {
          const newattrs = Object.assign({}, item.node.attrs);
          newattrs.styleName = style.styleName;
          tr = addElement(newattrs, state, tr, item.pos, false, 2, 0);
        }
      }
    }
  }
  return tr;
}
// check the styles with specified levels are defined
function checkLevlsAvailable() {
  let isAvailable = true;
  if (MISSED_HEIRACHY_ELEMENT.attrs) {
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

function insertParagraph(nodeAttrs, startPos, tr, index, state) {
  if (state && state.schema && nodeAttrs) {
    const paragraph = state.schema.nodes[PARAGRAPH];
    // [FS] IRAD-1202 2021-02-15
    // Handle Numbering case for None styles.
    // Use the styleName to hold the style level.
    const customStyle = getCustomStyleByLevel(index);
    nodeAttrs = resetNodeAttrs(nodeAttrs, customStyle);
    const paragraphNode = paragraph.create(nodeAttrs, null, null);
    tr = tr.insert(startPos, Fragment.from(paragraphNode));
  }
  return tr;
}

// [FS] IRAD-1243 2021-05-05
// To reset the previous numbering custom style attribute values.
function resetNodeAttrs(nodeAttrs, customStyle) {
  nodeAttrs.styleName = customStyle ? customStyle.styleName : '';
  nodeAttrs.indent = null;
  nodeAttrs.lineSpacing = null;
  nodeAttrs.paddingBottom = null;
  nodeAttrs.paddingTop = null;
  return nodeAttrs;
}

function addElementEx(
  nodeAttrs,
  state,
  tr,
  startPos,
  after,
  previousLevel,
  currentLevel
) {
  let level = 0;
  let counter = 0;
  const nextLevel = 0;
  if (after) {
    //TODO: Need to check this code it wont work
    addElementAfter(nodeAttrs, state, tr, startPos, nextLevel);
  } else {
    level = previousLevel ? previousLevel - 1 : 0;
    counter = currentLevel ? currentLevel : 0;
  }

  for (let index = level; index > counter; index--) {
    tr = insertParagraph(nodeAttrs, startPos, tr, index, state);
  }
  return { tr, level, counter };
}

function addElement(
  nodeAttrs,
  state,
  tr,
  startPos,
  isAfter,
  appliedLevel,
  currentLevel
) {
  return addElementEx(
    nodeAttrs,
    state,
    tr,
    startPos,
    isAfter,
    appliedLevel,
    currentLevel
  ).tr;
}

function addElementAfter(nodeAttrs, state, tr, startPos, nextLevel) {
  const element = addElementEx(nodeAttrs, state, tr, startPos, true, nextLevel);
  if (element) {
    tr = element.tr;
    const { counter, level } = element;
    if (level === counter) {
      tr = insertParagraph(nodeAttrs, startPos, tr, 1);
    }
  }
  return tr;
}

export function getStyleLevel(styleName: string) {
  let styleLevel = 0;
  if (undefined !== styleName && styleName) {
    const styleProp = getCustomStyleByName(styleName);
    if (
      null !== styleProp &&
      styleProp.styles &&
      styleProp.styles.styleLevel &&
      styleProp.styles.hasNumbering
    ) {
      styleLevel = styleProp.styles.styleLevel;
    } else {
      if (styleName.includes(RESERVED_STYLE_NONE_NUMBERING)) {
        const indices = styleName.split(RESERVED_STYLE_NONE_NUMBERING);

        if (indices && 2 === indices.length) {
          styleLevel = parseInt(indices[1]);
        }
      }
    }
  }
  return styleLevel;
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
  style: ?StyleProps
) {
  tr = applyStyleEx(style, styleName, state, tr, node, startPos, endPos);
  // apply bold first word/sentence custom style
  tr = applyLineStyle(state, tr, node, startPos);
  return tr;
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
  const { doc } = tr;
  const tasks = [];
  doc.nodesBetween(from, to, (node, pos) => {
    if (node.marks && node.marks.length) {
      node.marks.some((mark) => {
        if ('link' !== mark.type.name) {
          if (!(mark.attrs && mark.attrs.hasCitation)) {
            tasks.push({
              node,
              pos,
              mark,
            });
          }
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
  from: number,
  to: number,
  schema: Schema
) {
  tasks.forEach((job) => {
    const { mark } = job;
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
  const { selection } = state;
  const startPos = selection.$from.before(1);
  const endPos = selection.$to.after(1) - 1;
  return applyStyleToEachNode(state, startPos, endPos, tr, style, styleName);
}

// apply style to each selected node (when style applied to multiple paragraphs)
export function applyStyleToEachNode(
  state: EditorState,
  from: number,
  to: number,
  tr: Transform,
  style: StyleProps,
  styleName: string
) {
  let _node = null;
  tr.doc.nodesBetween(from, to, (node, startPos) => {
    if (node.type.name === 'paragraph') {
      // [FS] IRAD-1182 2021-02-11
      // Issue fix: When style applied to multiple paragraphs, some of the paragraph's objectId found in deletedObjectId's
      tr = applyStyleEx(style, styleName, state, tr, node, startPos, to);
      _node = node;
    }
  });
  const newattrs = Object.assign({}, _node ? _node.attrs : {});
  newattrs['styleName'] = styleName;
  tr = createEmptyElement(state, tr, _node, from, to, newattrs);
  tr = applyLineStyle(state, tr, null, 0);
  return tr;
}
// [FS] IRAD-1468 2021-06-18
// Fix: bold first sentence custom style not showing after reload editor.
function applyLineStyle(state, tr, node, startPos) {
  if (node) {
    if (node.attrs && node.attrs.styleName && RESERVED_STYLE_NONE !== node.attrs.styleName) {
      const styleProp = getCustomStyleByName(node.attrs.styleName);
      if (
        null !== styleProp &&
        styleProp.styles &&
        styleProp.styles.boldPartial
      ) {
        if (!tr) {
          tr = state.tr;
        }
        tr = addMarksToLine(
          tr,
          state,
          node,
          startPos,
          styleProp.styles.boldSentence
        );
      }
    }
  } else {
    const { selection } = state;
    const from = selection.$from.before(1);
    const to = selection.$to.after(1);
    // [FS] IRAD-1168 2021-06-21
    // FIX: multi-select paragraphs and apply a style with the bold the first sentence,
    // only the last selected paragraph have bold first sentence.
    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (node.content && node.content.content && node.content.content.length) {
        // Check styleName is available for node
        if (
          node.attrs &&
          node.attrs.styleName &&
          RESERVED_STYLE_NONE !== node.attrs.styleName
        ) {
          const styleProp = getCustomStyleByName(node.attrs.styleName);
          if (
            null !== styleProp &&
            styleProp.styles &&
            styleProp.styles.boldPartial
          ) {
            if (!tr) {
              tr = state.tr;
            }
            tr = addMarksToLine(
              tr,
              state,
              node,
              pos,
              styleProp.styles.boldSentence
            );
          }
        }
      }
    });
  }
  return tr;
}
// add bold marks to node
function addMarksToLine(tr, state, node, pos, boldSentence) {
  const markType = state.schema.marks[MARK_STRONG];
  let textContent = getNodeText(node);
  const endPos = textContent.length;
  let content = '';
  let counter = 0;
  if (boldSentence) {
    content = textContent.split('.');
  } else {
    content = textContent.split(' ');
  }
  if ('' !== content[0]) {
    textContent = content[0];
  } else {
    if (content.length > 1) {
      for (let index = 0; index < content.length; index++) {
        if ('' === content[index]) {
          counter++;
        } else {
          textContent = content[index];
          index = content.length;
        }
      }
    }
  }
  tr = tr.addMark(
    pos,
    pos + textContent.length + 1 + counter,
    markType.create(null)
  );
  if (content.length > 1) {
    tr = tr.removeMark(
      pos + textContent.length + 1 + counter,
      pos + endPos + 1,
      markType
    );
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

//to get the selected node
export function getNode(
  state: EditorState,
  from: number,
  to: number,
  tr: Transform
): Node {
  let selectedNode = null;
  selectedNodes.splice(0);
  tr.doc.nodesBetween(from, to, (node, startPos) => {
    if (node.type.name === 'paragraph') {
      if (null == selectedNode) {
        selectedNode = node;
      }
      selectedNodes.push({ pos: startPos, node });
    }
  });
  return selectedNode;
}

// [FS] IRAD-1176 2021-02-08
// update the editor doc with the modified style changes.
export function updateDocument(
  state: EditorState,
  tr: Transform,
  styleName: string,
  style: StyleProps
) {
  const { doc } = state;
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
export function isCustomStyleAlreadyApplied(
  styleName: string,
  editorState: EditorState
) {
  let found = false;
  const { doc } = editorState;
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

function haveEligibleChildren(
  node: Node,
  contentLen: number,
  styleName: string
) {
  return (
    node.type.name === 'paragraph' &&
    0 < contentLen &&
    styleName === node.attrs.styleName
  );
}

// [FS] IRAD-1350 2021-05-19
// To check the style have numbering
// blocks edit if the style is already applied in editor
export function isLevelUpdated(
  state: EditorState,
  styleName: string,
  style: StyleProps
) {
  let bOK = false;
  // [FS] IRAD-1478 2021-06-24
  // this custom style (with numbering) already applied in editor
  if (isCustomStyleAlreadyApplied(styleName, state)) {
    // now need to check if user edits the numbering level , if yes then block modify the style
    const currentLevel = getStyleLevel(styleName);
    if (style.styles && (undefined === style.styles.styleLevel ||
      style.styles.styleLevel !== currentLevel)) {
      bOK = true;
    }
  }
  return bOK;
}

export default CustomStyleCommand;
