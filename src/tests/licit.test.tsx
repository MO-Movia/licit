import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { LicitProps } from '../licit';
import { noop } from '@modusoperandi/licit-ui-commands';
import Licit from '../licit';
import RichTextEditor from '../ui/RichTextEditor';
import { Editor } from '@tiptap/core';
import { EditorView } from 'prosemirror-view';
import { Transform } from 'prosemirror-transform';
import { JSONContent } from '@tiptap/react';
import { LAYOUT } from '../constants';
import {
  DOC_LAYOUT,
  HISTORY_REDO,
  HISTORY_UNDO,
  HR,
  INDENT_LESS,
  INDENT_MORE,
  LINK_SET_URL,
  TABLE_ADD_COLUMN_AFTER,
  TABLE_ADD_COLUMN_BEFORE,
  TABLE_ADD_ROW_AFTER,
  TABLE_ADD_ROW_BEFORE,
  TABLE_BACKGROUND_COLOR,
  TABLE_BORDER_COLOR,
  TABLE_DELETE_COLUMN,
  TABLE_DELETE_ROW,
  TABLE_DELETE_TABLE,
  TABLE_INSERT_TABLE,
  TABLE_MOVE_TO_PREV_CELL,
  TEXT_ALIGN_CENTER,
  TEXT_ALIGN_JUSTIFY,
  TEXT_ALIGN_LEFT,
  TEXT_ALIGN_RIGHT,
  UL,
} from '../editorCommands';

/**
 * Configure Jest to use react / enzyme
 */
configure({
  adapter: new Adapter(),
});

describe('<Licit />', () => {
  let wrapper;
  let licit;
  const onReadyCB = (ref: Editor): void => {
    expect(ref).toBeTruthy();
  };

  const onChangeCB = (
    data: JSONContent,
    _isEmpty: boolean,
    _view: EditorView
  ): void => {
    expect(data).toBeTruthy();
  };

  const props: LicitProps = {
    docID: '0000-0000-0000',
    plugins: [],
    onReady: onReadyCB,
    onChange: onChangeCB,
  };

  const HELLO = 'Hello';
  let editor: Editor;

  // Mocking the functions used in _onReady
  const fakeEditorView = {
    focus: noop,
    dispatch: noop,
    state: {
      doc: {
        content: { size: 10 },
        resolve: () => ({ min: () => 0, max: () => 10 }),
      },
      tr: {
        setSelection: () => fakeEditorView.state.tr,
        scrollIntoView: noop,
      },
    },
  };

  document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = jest.fn().mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
    });

    range.getClientRects = () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: jest.fn(),
      };
    };

    return range;
  };

  beforeEach(async () => {
    // provide an empty document just to shut up that warning
    const data = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: HELLO }],
        },
      ],
    };
    props.data = data;

    wrapper = shallow(<Licit {...props} />);
    licit = wrapper.childAt(0).dive().instance();
    editor = wrapper.children(RichTextEditor).prop('editor');
  });

  it('should render a <RichTextEditor /> ', () => {
    expect(wrapper.find(RichTextEditor)).toBeTruthy();
  });

  describe('editorView (getter)', () => {
    it('should match the snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });

    it('should return the prosemirror view', () => {
      // Using shallow, the underlying RichTexEditor is never really created,
      // and Licit's _onReady method is not called.  Call it here with the fake
      // view created above
      expect(licit).toBeTruthy();

      // Verify that getter now returns the underlying view.
      //expect(licit.editorView).toBe(fakeEditorView);
    });

    it('should return the passed content', () => {
      expect(editor.getText()).toEqual(HELLO);
    });

    it('should match the inserted content', () => {
      const WORLD = 'World';
      editor.commands.insertContent(WORLD);
      expect(editor.getText()).toEqual(WORLD + HELLO);
    });

    it('should match the bold content', () => {
      editor.commands.toggleBold();
      expect(editor.isActive('bold'));
    });

    it('should match the undo content', () => {
      const WORLD = 'World';
      editor.commands.insertContent(WORLD);
      expect(editor.getText()).toEqual(WORLD + HELLO);
      HISTORY_UNDO.execute(editor.state, undefined, editor.view);
      expect(editor.getText()).toEqual(HELLO);
    });

    it('should match the redo content', () => {
      const WORLD = 'World';
      editor.commands.insertContent(WORLD);
      expect(editor.getText()).toEqual(WORLD + HELLO);
      HISTORY_UNDO.execute(editor.state, undefined, editor.view);
      expect(editor.getText()).toEqual(HELLO);
      HISTORY_REDO.execute(editor.state, undefined, editor.view);
      expect(editor.getText()).toEqual(WORLD + HELLO);
    });

    it('should match the hr content', () => {
      const hr = '<hr>';
      expect(editor.getHTML()).not.toContain(hr);
      HR.execute(editor.state, undefined, editor.view);
      expect(editor.getHTML()).toContain(hr);
    });

    it('should match the indent less more content', () => {
      const less = 'style="margin-left: 0px';
      const more = 'style="margin-left: 24px';
      expect(editor.getHTML()).toContain(less);
      INDENT_MORE.execute(editor.state, undefined, editor.view);
      expect(editor.getHTML()).toContain(more);
      INDENT_LESS.execute(editor.state, undefined, editor.view);
      expect(editor.getHTML()).toContain(less);
    });

    it('should match the text aligned content', () => {
      let align = 'left';
      const left = `style="text-align: ${align}`;
      expect(editor.getHTML()).not.toContain(left);
      align = 'center';
      const center = `style="text-align: ${align}`;
      TEXT_ALIGN_CENTER.execute(editor.state, undefined, editor.view);
      expect(editor.getHTML()).toContain(center);
      align = 'right';
      const right = `style="text-align: ${align}`;
      TEXT_ALIGN_RIGHT.execute(editor.state, undefined, editor.view);
      expect(editor.getHTML()).toContain(right);
      align = 'justify';
      const justify = `style="text-align: ${align}`;
      TEXT_ALIGN_JUSTIFY.execute(editor.state, undefined, editor.view);
      expect(editor.getHTML()).toContain(justify);
      align = 'left';
      TEXT_ALIGN_LEFT.execute(editor.state, undefined, editor.view);
      expect(editor.getHTML()).not.toContain('style="text-align:');
    });

    it('should match the doc layout content', () => {
      const attrs = {};
      Object.assign(attrs, editor.getJSON().attrs);
      expect(attrs['layout']).toEqual(undefined);
      DOC_LAYOUT.executeWithUserInput(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view,
        {
          layout: LAYOUT.US_LETTER_PORTRAIT,
          width: 0,
        }
      );
      Object.assign(attrs, editor.getJSON().attrs);
      expect(attrs['layout']).toEqual(LAYOUT.US_LETTER_PORTRAIT);
    });

    it('should match the link content', () => {
      const url = 'http://www.google.com';
      const link = `<a href="${url}"`;
      expect(editor.getHTML()).not.toContain(link);
      editor.commands.selectAll();
      LINK_SET_URL.executeWithUserInput(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view,
        url
      );
      expect(editor.getHTML()).toContain(link);
    });

    it('should match the list content', () => {
      const ul = '<ul type="disc"';
      expect(editor.getHTML()).not.toContain(ul);
      UL.execute(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view
      );
      expect(editor.getHTML()).toContain(ul);
    });

    it('should match the table content', () => {
      const match = 'table';
      expect(editor.getHTML()).not.toContain(match);
      TABLE_INSERT_TABLE.executeWithUserInput(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view,
        {
          rows: 1,
          cols: 1,
        }
      );
      const table = editor.view.dom.getElementsByTagName(
        match
      )[0] as HTMLTableElement;
      expect(editor.getHTML()).toContain(match);
      expect(table.rows.length).toEqual(1);
      expect(table.rows[0].cells.length).toEqual(1);

      TABLE_ADD_COLUMN_AFTER.execute(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view
      );
      expect(table.rows[0].cells.length).toEqual(2);

      TABLE_ADD_COLUMN_BEFORE.execute(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view
      );
      expect(table.rows[0].cells.length).toEqual(3);

      TABLE_ADD_ROW_AFTER.execute(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view
      );
      expect(table.rows.length).toEqual(2);

      TABLE_MOVE_TO_PREV_CELL.execute(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view
      );

      const background = 'rgb(242, 13, 13)';
      TABLE_BACKGROUND_COLOR.executeWithUserInput(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view,
        background
      );
      expect(table.rows[0].cells[0].style.backgroundColor).toEqual(background);

      const border = '#0df269';
      TABLE_BORDER_COLOR.executeWithUserInput(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view,
        border
      );
      expect(table.rows[0].cells[0].style.borderColor).toEqual(border);

      TABLE_ADD_ROW_BEFORE.execute(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view
      );
      expect(table.rows.length).toEqual(3);

      TABLE_DELETE_ROW.execute(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view
      );
      expect(table.rows.length).toEqual(2);

      TABLE_DELETE_COLUMN.execute(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view
      );
      expect(table.rows[0].cells.length).toEqual(2);

      TABLE_DELETE_TABLE.execute(
        editor.state,
        editor.view.dispatch as (tr: Transform) => void,
        editor.view
      );
      expect(editor.getHTML()).not.toContain(match);
    });
  });
});
