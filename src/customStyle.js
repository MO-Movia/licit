// @flow
// [FS] IRAD-1085 2020-10-09
// Handle custom style in local storage

const localStorageKey='moStyles';

export function saveStyle(style) {
    let bOk = false;
    const itemsArray = window.localStorage.getItem(localStorageKey) ? JSON.parse(window.localStorage.getItem(localStorageKey)) : [];
    if (!itemsArray.includes(style)) {
        removeStyleFromLocalStorage(style.stylename,itemsArray);
        itemsArray.push(style);
        window.localStorage.setItem(localStorageKey, JSON.stringify(itemsArray));
        bOk = true;
    }
    return bOk;
}

// get all saved styles
export function getCustomStyles() {
    return window.localStorage.getItem(localStorageKey) ? JSON.parse(window.localStorage.getItem(localStorageKey)) : [];
}

// get a style by styleName
export function getCustomStyleByName(name: String) {
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

export function editStyle(name, style) {
    removeFromLocalStorage(name);
    addToLocalStorage(style);
}
export function removeStyle(name, style) {
    removeFromLocalStorage(name, style);
}
export function removeFromLocalStorage(name, style) {
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

export function removeStyleFromLocalStorage(name, styleList) {
    const itemsArray = styleList;
    for (let i = 0; i < styleList.length; i++) {
        if (itemsArray[i].stylename === name) {
            itemsArray.splice(i, 1);
        }
        // }

    }
    window.localStorage.setItem(localStorageKey, JSON.stringify(itemsArray));
}

function addToLocalStorage(style) {
    const itemsArray = window.localStorage.getItem(localStorageKey) ? JSON.parse(window.localStorage.getItem(localStorageKey)) : [];
    itemsArray.push(style);
    window.localStorage.setItem(localStorageKey, JSON.stringify(itemsArray));
}
