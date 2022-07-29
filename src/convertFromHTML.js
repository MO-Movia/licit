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
  root.innerHTML = unEscape(html);
  return convertFromDOMElement(root, schema, plugins);
}

function unEscape(htmlStr) {
  if (htmlStr) {
    htmlStr = htmlStr
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }
  return htmlStr;
}
