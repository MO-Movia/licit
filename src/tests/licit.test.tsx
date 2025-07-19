import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { LicitProps } from '../licit';
import {Licit} from '../licit';
import { noop } from '@modusoperandi/licit-ui-commands';
import { Editor } from '@tiptap/core';
import { Transform } from 'prosemirror-transform';
import { JSONContent } from '@tiptap/react';
import { LAYOUT } from '../constants';
import { HISTORY_UNDO, HISTORY_REDO, HR, INDENT_LESS, INDENT_MORE, LINK_SET_URL, TEXT_ALIGN_CENTER, TEXT_ALIGN_LEFT, TEXT_ALIGN_RIGHT, TEXT_ALIGN_JUSTIFY, UL, TABLE_INSERT_TABLE } from '../editorCommands';

xdescribe('<Licit />', () => {
  const HELLO = 'Hello';
  const WORLD = 'World';

  const onReadyCB = jest.fn((ref: Editor) => {
    expect(ref).toBeTruthy();
  });

  const onChangeCB = jest.fn(
    (data: JSONContent, _isEmpty: boolean) => {
      expect(data).toBeTruthy();
    }
  );

  
  const props: LicitProps = {
    docID: '0000-0000-0000',
    plugins: [],
    onReady: onReadyCB,
    onChange: onChangeCB,
  };

  beforeEach(() => {
    props.data = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: HELLO }],
        },
      ],
    };
  });

  fit('renders the <RichTextEditor />', () => {
    render(<Licit {...props} />);
    expect(screen.getByText(HELLO)).toBeInTheDocument();
  });

  it('inserts and validates content', async () => {
    render(<Licit {...props} />);
    const editor = onReadyCB.mock.calls[0][0]; // Access the mock editor
    editor.commands.insertContent(WORLD);
    expect(editor.getText()).toBe(WORLD + HELLO);

  });

  it('toggles bold formatting', () => {
    render(<Licit {...props} />);
    const editor = onReadyCB.mock.calls[0][0];
    editor.commands.toggleBold();
    expect(editor.isActive('bold')).toBe(true);
  });

  it('handles undo and redo actions', () => {
    render(<Licit {...props} />);
    const editor = onReadyCB.mock.calls[0][0];

    editor.commands.insertContent(WORLD);
    expect(editor.getText()).toBe(WORLD + HELLO);

    HISTORY_UNDO.execute(editor.state, undefined, editor.view);
    expect(editor.getText()).toBe(HELLO);

    HISTORY_REDO.execute(editor.state, undefined, editor.view);
    expect(editor.getText()).toBe(WORLD + HELLO);
  });

  it('executes HR and aligns text', () => {
    render(<Licit {...props} />);
    const editor = onReadyCB.mock.calls[0][0];

    HR.execute(editor.state, undefined, editor.view);
    expect(editor.getHTML()).toContain('<hr>');

    TEXT_ALIGN_CENTER.execute(editor.state, undefined, editor.view);
    expect(editor.getHTML()).toContain('text-align: center');
  });

  it('inserts and manipulates tables', () => {
    render(<Licit {...props} />);
    const editor = onReadyCB.mock.calls[0][0];

    TABLE_INSERT_TABLE.executeWithUserInput(editor.state, editor.view.dispatch, editor.view, {
      rows: 1,
      cols: 1,
    });
    expect(editor.getHTML()).toContain('table');

    const table = editor.view.dom.getElementsByTagName('table')[0];
    expect(table.rows.length).toBe(1);
    expect(table.rows[0].cells.length).toBe(1);
  });
});
