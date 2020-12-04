// @flow

export const HEADING_NAME_DEFAULT = 'None';

// [FS] IRAD-1046 2020-09-24
// To create a style object from the customstyles to show the styles in the example piece.
export function getCustomStyle(customStyle) {
  const style = {
    float: 'right',
  };

  for (const property in customStyle) {

    switch (property) {
      case 'strong':
        style['fontWeight'] = 'bold';
        break;

      case 'em':
        style['fontStyle'] = 'italic';
        break;

      case 'color':
        style['color'] = customStyle[property];
        break;

      case 'fontsize':
        style['fontSize'] = customStyle[property];
        break;

      case 'fontname':
        style['fontName'] = customStyle[property];
        break;
      // [FS] IRAD-1042 2020-09-29
      // Fix:icluded strike through in custom styles.
      case 'strike':
        style['textDecorationLine'] = 'line-through';
        break;

      case 'super':
        style['verticalAlign'] = 'super';
        break;

      case 'text-highlight':
        style['backgroundColor'] = customStyle[property];
        break;

      case 'underline':
        style['textDecoration'] = 'underline';
        break;

      case 'text-align':
        style['textAlign'] = customStyle[property];
        break;

      case 'line-height':
        style['lineHeight'] = customStyle[property];
        break;

      default:
        break;
    }
  }
  return style;
}
