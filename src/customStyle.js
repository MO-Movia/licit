// @flow
// [FS] IRAD-1085 2020-10-09
// Handle custom style in local storage

export function saveStyle(style) {
    let bOk = false;
    // Custom style should save as key-value pair in local storage
    const item= window.localStorage.getItem(style.stylename);
    if(null===item) {
        window.localStorage.setItem(style.stylename, JSON.stringify(style.styles));
        bOk = true;
    }
    else{
        window.localStorage[style.stylename] = JSON.stringify(style.styles);
        bOk = true;
    }
    return bOk;
}

// get all saved styles
export function getCustomStyles() {
   const keys = Object.keys(localStorage);
    return keys;
}

export function removeCustomStyle(key){
    window.localStorage.removeItem(key);
}

// Custom style should save as key-value pair in local storage
export function getCustomStylesByKey(key) {
     return JSON.parse(window.localStorage.getItem(key));
 }

// get a style by styleName
export function getCustomStyleByName(name: String) {
    const itemsArray = window.localStorage.getItem(name) ? JSON.parse(window.localStorage.getItem(name)) : [];
    const style = itemsArray;
    return style;
}

export function editStyle(name, style) {
    removeFromLocalStorage(name);
    addToLocalStorage(style);
}
export function removeStyle(name, style) {
    removeFromLocalStorage(name, style);
}
function removeFromLocalStorage(name, style) {
    const itemsArray = window.localStorage.getItem('customStyleList') ? JSON.parse(window.localStorage.getItem('customStyleList')) : [];
    // if (itemsArray.includes(style)) {
    for (let i = 0; i < itemsArray.length; i++) {
        if (itemsArray[i].stylename === name) {
            itemsArray.splice(i, 1);
        }
        // }
        window.localStorage.setItem('customStyleList', JSON.stringify(itemsArray));
    }
}
function addToLocalStorage(style) {
    const itemsArray = window.localStorage.getItem('customStyleList') ? JSON.parse(window.localStorage.getItem('customStyleList')) : [];
    itemsArray.push(style);
    window.localStorage.setItem('customStyleList', JSON.stringify(itemsArray));
}
