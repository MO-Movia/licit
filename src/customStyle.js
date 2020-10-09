// @flow
// [FS] IRAD-1085 2020-10-09
// Handle custom style in local storage

export function saveStyle(style) {
    let bOk = false;
    let itemsArray = localStorage.getItem('customStyleList') ? JSON.parse(localStorage.getItem('customStyleList')) : [];
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

// get a style by stylaName
export function getCustomStylesByName(name: String) {

    let itemsArray = localStorage.getItem('customStyleList') ? JSON.parse(localStorage.getItem('customStyleList')) : [];
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

