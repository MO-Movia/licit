import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { toggleMark, wrapIn } from 'prosemirror-commands';

import * as React from 'react';
import ReactDOM from 'react-dom';
import Toolbar from './toolBar';

jest.mock('@tiptap/core');
jest.mock('prosemirror-state');
jest.mock('prosemirror-view');
jest.mock('prosemirror-commands');
jest.mock('./menu.css');
jest.mock('react');
jest.mock('react-dom');

describe('Toolbar', () => {  
    describe('Toolbar type', () => {
      it('should match the Extension', () => {
        expect(Toolbar.type).toBeDefined();
      });
    });
  });