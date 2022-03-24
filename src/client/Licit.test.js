import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Licit from './Licit';
import RichTextEditor from '../ui/RichTextEditor';
import noop from '../noop';

/**
 * Configure Jest to use react / enzyme
 */
configure({
  adapter: new Adapter(),
});

describe('<Licit />', () => {
  let wrapper;
  let licit;

  // provide an empty document just to shut up that warning
  const data = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: ' ' }],
      },
    ],
  };

  // Mocking the functions used in _onReady
  const fakeEditorView = {
    focus: noop,
    dispatch: noop,
    state: {
      doc: {
        content: { size: 10 },
        resolve: () => ({ min: () => 0, max: () => 10 }),
        toJSON: () => data,
      },
      tr: {
        setSelection: () => fakeEditorView.state.tr,
        scrollIntoView: noop,
      },
    },
  };

  beforeEach(() => {
    wrapper = shallow(<Licit data={data} />);
    licit = wrapper.instance();
  });

  it('should render a <RichTextEditor /> ', () => {
    expect(wrapper.find(RichTextEditor)).toBeTruthy();
  });

  describe('editorView (getter)', () => {
    it('should return the prosemirror view', () => {
      // Using shallow, the underlying RichTexEditor is never really created,
      // and Licit's _onReady method is not called.  Call it here with the fake
      // view created above
      licit._onReady(fakeEditorView);

      // Verify that getter now returns the underlying view.
      expect(licit.editorView).toBe(fakeEditorView);
    });
  });
});
