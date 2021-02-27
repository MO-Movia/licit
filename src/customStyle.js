// @flow
// [FS] IRAD-1085 2020-10-09
import type {StyleProps} from './Types';
import {
  RESERVED_STYLE_NONE,
  RESERVED_STYLE_NONE_NUMBERING,
} from './ParagraphNodeSpec';
let customStyles = [];

// [FS] IRAD-1202 2021-02-15
// None & None-@#$- have same effect of None.
// None-@#$-<styleLevel> is used for numbering to set style level for None, based on the cursor level style level.
function isValidStyleName(styleName) {
  return (
    styleName &&
    styleName != RESERVED_STYLE_NONE &&
    !styleName.includes(RESERVED_STYLE_NONE_NUMBERING) &&
    customStyles.length > 0
  );
}

// [FS] IRAD-1137 2021-01-15
// check if the entered style name already exist
export function isCustomStyleExists(styleName) {
  let bOK = false;
  if (isValidStyleName(styleName)) {
    for (const style of customStyles) {
      if (styleName === style.styleName) {
        bOK = true;
        return bOK;
      }
    }
  }
  return bOK;
}

// [FS] IRAD-1128 2020-12-30
// get a style by styleName
export function getCustomStyleByName(name: string): StyleProps {
  let style: StyleProps = null;
  let has = false;
  if (isValidStyleName(name)) {
    // break the loop if find any matches
    for (let i = 0; !has && i < customStyles.length; i++) {
      if (name === customStyles[i].styleName) {
        style = customStyles[i];
        has = true;
      }
    }
  }
  return style;
}

// store styles in cache
export function setStyles(style) {
  customStyles = style;
}
// get a style by Level
export function getCustomStyleByLevel(level: Number) {
  let style = null;
  if (customStyles.length > 0) {
    for (const obj of customStyles) {
      if (
        obj.styles.hasNumbering &&
        obj.styles.styleLevel &&
        level === Number(obj.styles.styleLevel)
      ) {
        if (null === style) {
          style = obj;
        }
      }
    }
  }
  return style;
}

// [FS] IRAD-1046 2020-09-24
// To create a style object from the customstyles to show the styles in the example piece.
export function getCustomStyle(customStyle: any) {
  const style = {
    float: 'right',
  };

  for (const property in customStyle) {
    switch (property) {
      case 'strong':
        // [FS] IRAD-1137 2021-1-22
        // Deselected Bold, Italics and Underline are not removed from the example style near style name
        if (customStyle[property]) {
          style['fontWeight'] = 'bold';
        }
        break;

      case 'em':
        // [FS] IRAD-1137 2021-1-22
        // Deselected Bold, Italics and Underline are not removed from the example style near style name
        if (customStyle[property]) {
          style['fontStyle'] = 'italic';
        }
        break;

      case 'color':
        style['color'] = customStyle[property];
        break;

      case 'textHighlight':
        style['backgroundColor'] = customStyle[property];
        break;

      case 'fontSize':
        style['fontSize'] = customStyle[property];
        break;

      case 'fontName':
        style['fontName'] = customStyle[property];
        break;
      // [FS] IRAD-1042 2020-09-29
      // Fix:icluded strike through in custom styles.
      case 'strike':
        if (customStyle[property]) {
          style['textDecorationLine'] = 'line-through';
        }
        break;

      case 'super':
        style['verticalAlign'] = 'super';
        break;

      case 'underline':
        // [FS] IRAD-1137 2021-1-22
        // Deselected Bold, Italics and Underline are not removed from the example style near style name
        if (customStyle[property]) {
          style['textDecoration'] = 'underline';
        }
        break;

      case 'textAlign':
        style['textAlign'] = customStyle[property];
        break;

      case 'lineHeight':
        style['lineHeight'] = customStyle[property];
        break;

      default:
        break;
    }
  }
  return style;
}
