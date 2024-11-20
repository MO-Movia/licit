import Licit, { DataType } from './Licit';
import RichTextEditor from '../ui/RichTextEditor';
import { noop } from '@modusoperandi/licit-ui-commands';

describe('<Licit />', () => {
  const data = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: ' ' }],
      },
    ],
    onReady:() => {},
    autoFocus:true,
    children:'',
    className:'licit',
    disabled:true,
  };

  const fakeEditorView = {
    focus: noop,
    dispatch: noop,
    state: {
      doc: {
        content: { size: 10 },
        resolve: () => ({
          min: () => 0,
          max: () => 10,
          parent: { inlineContent: true },
        }),
        toJSON: () => data,
      },
      tr: {
        setSelection: () => fakeEditorView.state.tr,
        scrollIntoView: noop,
      },
    },
  };

  it('should render a <RichTextEditor /> ', () => {
    const wrapper = new RichTextEditor({data});
    wrapper.props = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: ' ' }],
        },
      ],
      onReady:() => {},
      autoFocus:true,
      children:'',
      className:'licit',
      disabled:true,
    };
    expect(wrapper.render()).toBeTruthy();
  });

  describe('editorView (getter)', () => {
    it('should return the prosemirror view', () => {
      const wrapper = new RichTextEditor({data});
      wrapper.props = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: ' ' }],
          },
        ],
        onReady:() => {},
        autoFocus:true,
        children:'',
        className:'licit',
        disabled:true,
      };
      expect(wrapper._onReady(fakeEditorView)).toBeUndefined();
    });
  });
});

describe('<Licit with HTML input/>', () => {
  let wrapper;
  const HELLO = 'Hello ';
  const WORLD = 'World';
  const data =
    '<p stylename="None">' +
    HELLO +
    '<strong overridden="false">' +
    WORLD +
    '</strong></p>';

  beforeEach(() => {
    wrapper = new Licit({data},DataType.HTML);
  });

  it('should render a <RichTextEditor /> ', () => {
    expect(wrapper.render()).toBeTruthy();
  });

  it('should match state text content with the passed in text ', () => {
    expect(wrapper.state.editorState.doc.textContent).toBe('');
  });
});
