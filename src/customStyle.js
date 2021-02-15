// @flow
// [FS] IRAD-1085 2020-10-09
import type {StyleProps} from './Types';
let customStyles = [];

function isValidStyleName(styleName) {
	return (name != 'None' && !name.includes('None-@#$-') && customStyles.length > 0);
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
  if (isValidStyleName(styleName)) {
    for (const obj of customStyles) {
      if (name === obj.styleName) {
        style = obj;
      }
    }
  }
  return style;
}

// store styles in cache
export function setStyle(style) {
  customStyles = style;
}
// get a style by Level
export function getCustomStyleByLevel(level: Number) {
  let style = null;
  if (customStyles.length > 0) {
    for (const obj of customStyles) {
      if (obj.styles.styleLevel && level === Number(obj.styles.styleLevel)) {
        if (null === style) {
          style = obj;
        }
      }
    }
  }
  return style;
}
