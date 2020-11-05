// @flow
// [FS] IRAD-1085 2020-10-09
// Handle custom style in local storage

export function saveStyle(style) {
    let bOk = false;
    const itemsArray = localStorage.getItem('customStyleList') ? JSON.parse(localStorage.getItem('customStyleList')) : [];
    if (!itemsArray.includes(style)) {

        itemsArray.push(style);
        localStorage.setItem('customStyleList', JSON.stringify(itemsArray));
        bOk = true;
    } else {
        bOk = false;
    }
    return bOk;
}

// get all saved styles
export function getCustomStyles() {
    return localStorage.getItem('customStyleList') ? JSON.parse(localStorage.getItem('customStyleList')) : [];
}

// get a style by styleName
export function getCustomStyleByName(name: String) {

    const itemsArray = localStorage.getItem('customStyleList') ? JSON.parse(localStorage.getItem('customStyleList')) : [];
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
    removeFromLocalStorage(name);
}
function removeFromLocalStorage(name) {
    const existingStyle = getCustomStylesByName(name);
    const itemsArray = localStorage.getItem('customStyleList') ? JSON.parse(localStorage.getItem('customStyleList')) : [];
    if (itemsArray.includes(existingStyle)) {
        for (let i = 0; i < itemsArray.length; i++) {
            if (itemsArray[i] === existingStyle) {
                itemsArray.splice(i, 1);
            }
        }
        localStorage.setItem('customStyleList', JSON.stringify(itemsArray));
    }
}
function addToLocalStorage(style) {
    const itemsArray = localStorage.getItem('customStyleList') ? JSON.parse(localStorage.getItem('customStyleList')) : [];
    itemsArray.push(style);
    localStorage.setItem('customStyleList', JSON.stringify(itemsArray));
}
