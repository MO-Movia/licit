import { Schema } from 'prosemirror-model';

import CodeMarkSpec from './CodeMarkSpec.js';
import DocNodeSpec from './DocNodeSpec.js';
import EMMarkSpec from './EMMarkSpec.js';
import FontSizeMarkSpec from './FontSizeMarkSpec.js';
import FontTypeMarkSpec from './FontTypeMarkSpec.js';
import LinkMarkSpec from './LinkMarkSpec.js';
import * as MarkNames from './MarkNames.js';
import { DOC, PARAGRAPH, TEXT } from './NodeNames.js';
import ParagraphNodeSpec from './ParagraphNodeSpec.js';
import SpacerMarkSpec from './SpacerMarkSpec.js';
import StrikeMarkSpec from './StrikeMarkSpec.js';
import StrongMarkSpec from './StrongMarkSpec.js';
import TextColorMarkSpec from './TextColorMarkSpec.js';
import TextHighlightMarkSpec from './TextHighlightMarkSpec.js';
import TextNoWrapMarkSpec from './TextNoWrapMarkSpec.js';
import TextNodeSpec from './TextNodeSpec.js';
import TextSelectionMarkSpec from './TextSelectionMarkSpec.js';
import TextSuperMarkSpec from './TextSuperMarkSpec.js';
import TextSubMarkSpec from './TextSubMarkSpec.js';
import TextUnderlineMarkSpec from './TextUnderlineMarkSpec.js';
import OverrideMarkSpec from './OverrideMarkSpec.js';

const {
  MARK_CODE,
  MARK_EM,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_LINK,
  MARK_NO_BREAK,
  MARK_STRIKE,
  MARK_STRONG,
  MARK_SUPER,
  MARK_SUB,
  MARK_TEXT_COLOR,
  MARK_TEXT_HIGHLIGHT,
  MARK_TEXT_SELECTION,
  MARK_UNDERLINE,
  MARK_SPACER,
  MARK_OVERRIDE
} = MarkNames;

// These nodes are required to build basic marks.
const nodes = {
  [DOC]: DocNodeSpec,
  [PARAGRAPH]: ParagraphNodeSpec,
  [TEXT]: TextNodeSpec,
};

const marks = {
  // Link mark should be rendered first.
  // https://discuss.prosemirror.net/t/prevent-marks-from-breaking-up-links/401/5
  [MARK_LINK]: LinkMarkSpec,
  [MARK_NO_BREAK]: TextNoWrapMarkSpec,
  [MARK_CODE]: CodeMarkSpec,
  [MARK_EM]: EMMarkSpec,
  [MARK_FONT_SIZE]: FontSizeMarkSpec,
  [MARK_FONT_TYPE]: FontTypeMarkSpec,
  [MARK_SPACER]: SpacerMarkSpec,
  [MARK_STRIKE]: StrikeMarkSpec,
  [MARK_STRONG]: StrongMarkSpec,
  [MARK_SUPER]: TextSuperMarkSpec,
  [MARK_SUB]: TextSubMarkSpec,
  [MARK_TEXT_COLOR]: TextColorMarkSpec,
  [MARK_TEXT_HIGHLIGHT]: TextHighlightMarkSpec,
  [MARK_TEXT_SELECTION]: TextSelectionMarkSpec,
  [MARK_UNDERLINE]: TextUnderlineMarkSpec,
  [MARK_OVERRIDE]: OverrideMarkSpec,
};

const schema = new Schema({ nodes, marks });
const EditorMarks = schema.spec.marks;
export default EditorMarks;
