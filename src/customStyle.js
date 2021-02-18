// @flow
// [FS] IRAD-1085 2020-10-09
import type {StyleProps} from './Types';
let customStyles = [];

// [FS] IRAD-1137 2021-01-15
// check if the entered style name already exist
export function isCustomStyleExists(styleName) {
  let bOK = false;
  if (customStyles.length > 0) {
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
  if (customStyles.length > 0) {
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
export function setStyles(styles) {
  customStyles = styles;
}
// get a style by Level
export function getCustomStyleByLevel(level: Number) {
  let style = null;
  if (customStyles.length > 0) {
    for (const obj of customStyles) {
      if (obj.styles.styleLevel && level === Number(obj.styles.styleLevel)) {
        if (null === style) {
          style = obj;
          return style;
        }
      }
    }
  }
  return style;
}
