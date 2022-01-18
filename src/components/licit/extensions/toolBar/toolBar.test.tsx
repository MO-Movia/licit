import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { toggleMark, wrapIn } from 'prosemirror-commands';
import { v4 as uuidv4 } from 'uuid';

import * as React from 'react';
import ReactDOM from 'react-dom';
import Toolbar from './toolBar';
import { isAnyArrayBuffer } from 'util/types';

jest.mock('@tiptap/core');
jest.mock('prosemirror-state');
jest.mock('prosemirror-view');
jest.mock('prosemirror-commands');
jest.mock('./menu.css');
jest.mock('react');
jest.mock('react-dom');

describe('Toolbar', () => {
  // let tb = Toolbar.({
  //   name: 'LiciT-TBar-' + uuidv4(),
  // });

  describe('Toolbar type', () => {
    it('should match the Extension', () => {
      expect(Toolbar).toBeInstanceOf(Extension);
    });
  });
});