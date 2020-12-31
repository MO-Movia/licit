// @flow
// [FS] IRAD-1085 2020-10-09
// Handle custom style in local storage
import {GET, POST} from './client/http';

const localStorageKey = 'moStyles';
let customStyles = null;

export function saveStyle(style: any, styleName: string) {
  let bOk = false;
  saveStyleToServer(style);
  return bOk;
}

// [FS] IRAD-1128 2020-12-29
// save the custom style to server
function saveStyleToServer(style) {
  let img;
  const url =
    window.location.protocol +
    '//' +
    window.location.hostname +
    ':3005/savecustomstyle';
  POST(url, JSON.stringify(style), 'application/json; charset=utf-8').then(
    (data) => {
      console.log(data);
      img = data;
    },
    (err) => {}
  );
}

function getStyles() {
  let style;
  if (null !== customStyles) {
    return new Promise((resolve, reject) => {
      resolve(customStyles);
    });
  }
  return new Promise((resolve, reject) => {
    // Use uploaded image URL.
    const url =
      window.location.protocol +
      '//' +
      window.location.hostname +
      ':3005/getcustomstyles';
    GET(url).then(
      (data) => {
        style = JSON.parse(data);
        resolve(style);
        customStyles = style;
      },
      (err) => {
        style = null;
        resolve(style);
      }
    );
  });
}

export async function getCustomStyles() {
  return await getStyles();
}

// [FS] IRAD-1128 2020-12-30
// get a style by styleName
export function getCustomStyleByName(name: string) {
  let style = null;
  if (null != customStyles) {
    customStyles.forEach((obj) => {
      if (name === obj.stylename) {
        style = obj.styles;
      }
    });
  } else {
    let customStyles = getCustomStyles();
    customStyles.then((result) => {
      if (null != result) {
        result.forEach((obj) => {
          if (name === obj.stylename) {
            style = obj.styles;
          }
        });
        return style;
      }
    });
  }
  return style;
}

export function editStyle(name: String, style: any) {
  removeFromLocalStorage(name);
  addToLocalStorage(style);
}
export function removeStyle(name: String) {
  removeFromLocalStorage(name);
}

// [FS] IRAD-1128 2020-12-29
// to remove the selected Custom style.
export function removeFromLocalStorage(name: string) {
  let img;
  const url =
    window.location.protocol +
    '//' +
    window.location.hostname +
    ':3005/removecustomstyle';
  POST(url, name, 'text/plain').then(
    (data) => {
      console.log(data);
    },
    (err) => {}
  ); 
}

export function removeStyleFromLocalStorage(name: String, styleList: any) {
  const itemsArray = styleList;
  for (let i = 0; i < styleList.length; i++) {
    if (itemsArray[i].stylename === name) {
      itemsArray.splice(i, 1);
    }
    // }
  }
  window.localStorage.setItem(localStorageKey, JSON.stringify(itemsArray));
}

function addToLocalStorage(style: any) {
  const itemsArray = window.localStorage.getItem(localStorageKey)
    ? JSON.parse(window.localStorage.getItem(localStorageKey))
    : [];
  itemsArray.push(style);
  window.localStorage.setItem(localStorageKey, JSON.stringify(itemsArray));
}
