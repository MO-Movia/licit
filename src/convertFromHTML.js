// @flow

import { Schema } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import convertFromDOMElement from './convertFromDOMElement.js';

export default function convertFromHTML(
  html: string,
  schema: Schema,
  plugins: Array<Plugin>
): EditorState {
  const root = document.createElement('html');
  root.innerHTML = html || ' ';
  return convertFromDOMElement(root, schema, plugins);
}
