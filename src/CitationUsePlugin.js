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
import FootnoteView from './ui/FootNoteView';
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

 

export default class CitationUsePlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('CitationUsePlugin'),
      state: {
        init(config, state) {
          this.loaded = false;
          this.firstTime = true;
          this.spec.props.nodeViews[
            'FootnoteView'
          ] =FootnoteView;
        },
        apply(tr, value, oldState, newState) {
          remapCounterFlags(tr);
        },
      },
      props: {
        handleDOMEvents: {
          keydown(view, event) {
            this.view = view;
          },
        },
        nodeViews: [FootnoteView],
      },      
    });
  }

  getEffectiveSchema(schema) {
    return applyEffectiveSchema(schema);
  }
}

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
