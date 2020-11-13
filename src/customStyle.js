// @flow
// [FS] IRAD-1085 2020-10-09
// Handle custom style in local storage

export function saveStyle(style) {
    let bOk = false;
    const itemsArray = window.localStorage.getItem('customStyleList') ? JSON.parse(window.localStorage.getItem('customStyleList')) : [];
    if (!itemsArray.includes(style)) {

        itemsArray.push(style);
        window.localStorage.setItem('customStyleList', JSON.stringify(itemsArray));
        bOk = true;
    }
    return bOk;
}

// get all saved styles
export function getCustomStyles() {
    return window.localStorage.getItem('customStyleList') ? JSON.parse(window.localStorage.getItem('customStyleList')) : [];
}

// get a style by styleName
export function getCustomStyleByName(name: String) {

    const itemsArray = window.localStorage.getItem('customStyleList') ? JSON.parse(window.localStorage.getItem('customStyleList')) : [];
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
