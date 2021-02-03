// @flow
// [FS] IRAD-1085 2020-10-09
// Handle custom style in local storage

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
export function getCustomStyleByName(name: string) {
  let style = null;
  if (customStyles.length > 0) {
    for (const obj of customStyles) {
      if (name === obj.styleName) {
        style = obj.styles;
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
