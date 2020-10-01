// @flow

import { EditorState } from 'prosemirror-state';
// import { HEADING } from '../NodeNames';
export const HEADING_NAME_DEFAULT = 'Normal';
// [FS] IRAD-1042 2020-09-15
// To find the selected heading

export function findActiveHeading(state: EditorState): number {
  // const { schema } = state;
  // const markType = schema.nodes[HEADING];

  // if (!markType) {
  return HEADING_NAME_DEFAULT;
  // }

}

// [FS] IRAD-1046 2020-09-24
// To create a style object from the customstyles to show the styles in the example piece.
export function getTheCustomStyles(customStyles) {
  const style = {
    float: 'right'
  };

  for (const property in customStyles) {

    switch (property) {
      case 'strong':
        style['fontWeight'] = 'bold';
        break;

      case 'em':
        style['fontStyle'] = 'italic';
        break;

      case 'color':
        style['color'] = customStyles[property];
        break;

      case 'fontsize':
        style['fontSize'] = customStyles[property];
        break;

      case 'fontname':
        style['fontName'] = customStyles[property];
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
        style['backgroundColor'] = customStyles[property];
        break;

      case 'underline':
        style['textDecoration'] = 'underline';
        break;

      default:
        break;
    }
  }
  return style;
}
