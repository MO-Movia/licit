// @flow
// [FS] IRAD-1085 2020-10-09
// Handle custom style in local storage
import { GET, POST } from './client/http';

function buildRoute(...path) {
  const root = `${window.location.protocol}//${window.location.hostname}:3005`;
  // const root = '/style-service';
  return [root, ...path].join('/');
}


let customStyles = [];

// [FS] IRAD-1128 2020-12-29
// save the custom style to server
export function saveStyle(style) {
  customStyles = [];
  let styles;
  const url = buildRoute('savecustomstyle');
  POST(url, JSON.stringify(style), 'application/json; charset=utf-8').then(
    (data) => {
      styles = JSON.parse(data);
      customStyles = styles;
    },
    (err) => { }
  );
}

// [FS] IRAD-1133 2021-01-05
// update and save the custom style to server
export function updateStyle(style) {
  let styles;
  return new Promise((resolve, reject) => {
    const url = buildRoute('savecustomstyle');
    POST(url, JSON.stringify(style), 'application/json; charset=utf-8').then(
      (data) => {
        styles = JSON.parse(data);
        resolve(styles);
        customStyles = styles;
      },
      (err) => {
        styles = null;
        resolve(styles);
      }
    );
  });
}

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

function getStyles() {
  let style;
  if (customStyles.length > 0) {
    return new Promise((resolve, reject) => {
      resolve(customStyles);
    });
  }
  return new Promise((resolve, reject) => {
    const url = buildRoute('getcustomstyles');
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
  if (customStyles.length > 0) {
    for (const obj of customStyles) {
      if (name === obj.styleName) {
        style = obj.styles;
      }
    }
  } else {
    const customStyles = getCustomStyles();
    customStyles.then((result) => {
      if (null != result) {
        result.forEach((obj) => {
          if (name === obj.styleName) {
            style = obj.styles;
          }
        });
        return style;
      }
      return style;
    });
  }
  return style;
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
  } else {
    const customStyles = getCustomStyles();
    customStyles.then((result) => {
      if (null != result) {
        for (const obj of customStyles) {
          if (obj.styles.styleLevel && level === Number(obj.styles.styleLevel)) {
            if (null === style) {
              style = obj;
            }
          }
        }
      }
      return style;
    });
  }
  return style;
}

// [FS] IRAD-1128 2020-12-29
// to remove the selected Custom style.
export function removeStyle(name: string) {
  customStyles = [];
  const url = buildRoute('removecustomstyle');
  POST(url, name, 'text/plain').then(
    (data) => {
      customStyles = data;
      console.log(data);
    },
    (err) => { }
  ); 
}

// [FS] IRAD-1128 2020-12-29
// save the custom style to server
export function renameStyle(oldStyleName, newStyleName) {
  customStyles = [];
  let styles = null;
  const obj = {
    styleName: oldStyleName,
    modifiedStyleName: newStyleName,
  };

  return new Promise((resolve, reject) => {
    const url = buildRoute('renamecustomstyle');
    POST(url, JSON.stringify(obj), 'application/json; charset=utf-8').then(
      (data) => {
        styles = JSON.parse(data);
        resolve(styles);
        customStyles = styles;
      },
      (err) => {
        styles = null;
        resolve(styles);
      }
    );
  });
}

