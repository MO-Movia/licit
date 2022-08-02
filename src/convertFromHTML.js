// @flow

import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { Plugin } from 'prosemirror-state';

import convertFromDOMElement from './convertFromDOMElement';

export default function convertFromHTML(
  html: string,
  schema: Schema,
  plugins: Array<Plugin>
): EditorState {
  const root = document.createElement('html');
  root.innerHTML = html ? html : ' ';
  return convertFromDOMElement(root, schema, plugins);
}
