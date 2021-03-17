import React from 'react';
import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Licit from './Licit';
import RichTextEditor from '../ui/RichTextEditor';
import noop from '../noop';

configure({
  adapter: new Adapter(),
});

describe('<Licit />', () => {
  let wrapper;
  let licit;

  const fakeEditorView = {
    focus: noop,
    dispatch: noop,
    state: {
      doc: {
        content: {size: 10},
        resolve: () => ({
          min: () => 0,
          max: () => 10,
        }),
      },
      tr: {setSelection: noop},
    },
  };

  beforeEach(() => {
    const data = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{type: 'text', text: ' '}],
        },
      ],
    };
    wrapper = shallow(<Licit data={data} />);
    licit = wrapper.instance();
    // Using shallow, the underlying RichTexEditor is never really created, and
    // Licit's _onReady method is not called.
    // Call it here with the fake view created above
    licit._onReady(fakeEditorView);
  });

  it('should render <RichTextEditor /> ', () => {
    expect(wrapper.find(RichTextEditor)).toBeTruthy();
  });

  describe('editorView (getter)', () => {
    it('should return the prosemirror view', () => {
      expect(licit.editorView).toBe(fakeEditorView);
    });
  });
});
