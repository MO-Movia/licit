// @flow
// [FS] IRAD-1085 2020-10-09
// Handle custom style in local storage

const localStorageKey = 'moStyles';

export function saveStyle(style: any, styleName: string) {
    let bOk = false;
    const itemsArray = window.localStorage.getItem(localStorageKey) ? JSON.parse(window.localStorage.getItem(localStorageKey)) : [];
    if (!itemsArray.includes(style)) {
        removeStyleFromLocalStorage(styleName, itemsArray);
        itemsArray.push(style);
        window.localStorage.setItem(localStorageKey, JSON.stringify(itemsArray));
        bOk = true;
    }
    return bOk;
}

// get all saved styles
export function getCustomStyles() {
    const styleNames=  window.localStorage.getItem(localStorageKey) ? JSON.parse(window.localStorage.getItem(localStorageKey)) : [];
    // to sort stylenames alphabetically.
    styleNames.sort(function (a, b) {
        var styleA = a.stylename.toUpperCase();
        var styleB = b.stylename.toUpperCase();
      
        return styleA.localeCompare(styleB);
      });
    return styleNames;
}

// get a style by styleName
export function getCustomStyleByName(name: string) {
    const itemsArray = window.localStorage.getItem(localStorageKey) ? JSON.parse(window.localStorage.getItem(localStorageKey)) : [];
    let style = null;
    if (itemsArray.length > 0) {
        itemsArray.forEach(obj => {
            if (name === obj.stylename) {
                style = obj.styles;
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
export function removeFromLocalStorage(name: String) {
    const itemsArray = window.localStorage.getItem(localStorageKey) ? JSON.parse(window.localStorage.getItem(localStorageKey)) : [];
    const styles = itemsArray;
    for (let i = 0; i < itemsArray.length; i++) {
        if (itemsArray[i].stylename === name) {
            styles.splice(i, 1);
        }
        // }
        window.localStorage.setItem(localStorageKey, JSON.stringify(styles));
    }
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
    const itemsArray = window.localStorage.getItem(localStorageKey) ? JSON.parse(window.localStorage.getItem(localStorageKey)) : [];
    itemsArray.push(style);
    window.localStorage.setItem(localStorageKey, JSON.stringify(itemsArray));
}
