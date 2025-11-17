/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import type { MarkSpec } from 'prosemirror-model';
import OrderedMap from 'orderedmap';

import CodeMarkSpec from './specs/codeMarkSpec';
import EMMarkSpec from './specs/emMarkSpec';
import FontSizeMarkSpec from './specs/fontSizeMarkSpec';
import FontTypeMarkSpec from './specs/fontTypeMarkSpec';
import LinkMarkSpec from './specs/linkMarkSpec';
import {
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
} from '@modusoperandi/licit-ui-commands';
import SpacerMarkSpec from './specs/spacerMarkSpec';
import StrikeMarkSpec from './specs/strikeMarkSpec';
import StrongMarkSpec from './specs/strongMarkSpec';
import TextColorMarkSpec from './specs/textColorMarkSpec';
import TextHighlightMarkSpec from './specs/textHighlightMarkSpec';
import TextNoWrapMarkSpec from './specs/textNoWrapMarkSpec';
import TextSelectionMarkSpec from './specs/textSelectionMarkSpec';
import TextSuperMarkSpec from './specs/textSuperMarkSpec';
import TextSubMarkSpec from './specs/textSubMarkSpec';
import TextUnderlineMarkSpec from './specs/textUnderlineMarkSpec';

export function updateEditorMarks(
  specMarks: OrderedMap<MarkSpec>
): OrderedMap<MarkSpec> {
  specMarks = specMarks.addToEnd(MARK_LINK, LinkMarkSpec);
  specMarks = specMarks.addToEnd(MARK_NO_BREAK, TextNoWrapMarkSpec);
  specMarks = specMarks.addToEnd(MARK_CODE, CodeMarkSpec);
  specMarks = specMarks.addToEnd(MARK_EM, EMMarkSpec);
  specMarks = specMarks.addToEnd(MARK_FONT_SIZE, FontSizeMarkSpec);
  specMarks = specMarks.addToEnd(MARK_FONT_TYPE, FontTypeMarkSpec);
  specMarks = specMarks.addToEnd(MARK_SPACER, SpacerMarkSpec);
  specMarks = specMarks.addToEnd(MARK_STRIKE, StrikeMarkSpec);
  specMarks = specMarks.addToEnd(MARK_STRONG, StrongMarkSpec);
  specMarks = specMarks.addToEnd(MARK_SUPER, TextSuperMarkSpec);
  specMarks = specMarks.addToEnd(MARK_SUB, TextSubMarkSpec);
  specMarks = specMarks.addToEnd(MARK_TEXT_COLOR, TextColorMarkSpec);
  specMarks = specMarks.addToEnd(MARK_TEXT_HIGHLIGHT, TextHighlightMarkSpec);
  specMarks = specMarks.addToEnd(MARK_TEXT_SELECTION, TextSelectionMarkSpec);
  specMarks = specMarks.addToEnd(MARK_UNDERLINE, TextUnderlineMarkSpec);

  return specMarks;
}
