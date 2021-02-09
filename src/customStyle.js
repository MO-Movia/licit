// @flow
// [FS] IRAD-1085 2020-10-09

import {applyLatestStyle} from './CustomStyleCommand';

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


function haveEligibleChildren(node, contentLen, styleName) {
return (
  node.type.name === 'paragraph' &&
  0 < contentLen &&
  styleName === node.attrs.styleName
);
}
