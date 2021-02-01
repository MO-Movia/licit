// @flow

export const HEADING_NAME_DEFAULT = 'None';

// [FS] IRAD-1046 2020-09-24
// To create a style object from the customstyles to show the styles in the example piece.
export function getCustomStyle(customStyle: any) {
  const style = {
    float: 'right',
  };

  for (const property in customStyle) {
    switch (property) {
      case 'strong':
        // [FS] IRAD-1137 2021-1-22
        // Deselected Bold, Italics and Underline are not removed from the example style near style name
        if (customStyle[property]) {
          style['fontWeight'] = 'bold';
        }
        break;

      case 'em':
        // [FS] IRAD-1137 2021-1-22
        // Deselected Bold, Italics and Underline are not removed from the example style near style name
        if (customStyle[property]) {
          style['fontStyle'] = 'italic';
        }
        break;

      case 'color':
        style['color'] = customStyle[property];
        break;

      case 'textHighlight':
        style['backgroundColor'] = customStyle[property];
        break;

      case 'fontSize':
        style['fontSize'] = customStyle[property];
        break;

      case 'fontName':
        style['fontName'] = customStyle[property];
        break;
      // [FS] IRAD-1042 2020-09-29
      // Fix:icluded strike through in custom styles.
      case 'strike':
        if (customStyle[property]) {
          style['textDecorationLine'] = 'line-through';
        }
        break;

      case 'super':
        style['verticalAlign'] = 'super';
        break;

      case 'underline':
        // [FS] IRAD-1137 2021-1-22
        // Deselected Bold, Italics and Underline are not removed from the example style near style name
        if (customStyle[property]) {
          style['textDecoration'] = 'underline';
        }
        break;

      case 'textAlign':
        style['textAlign'] = customStyle[property];
        break;

      case 'lineHeight':
        style['lineHeight'] = customStyle[property];
        break;

      default:
        break;
    }
  }
  return style;
}
