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
  htmlStr = htmlStr.replace(/&lt;/g, '<');
  htmlStr = htmlStr.replace(/&gt;/g, '>');
  htmlStr = htmlStr.replace(/&quot;/g, '\"');
  htmlStr = htmlStr.replace(/&#39;/g, '\'');
  htmlStr = htmlStr.replace(/&amp;/g, '&');
  return htmlStr;
}
