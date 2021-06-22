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
  let runtime;

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

  beforeEach(() => {
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

  describe('loadStyles', () => {
    let warn;

    beforeEach(() => (warn = jest.spyOn(console, 'warn').mockReturnValue()));
    afterEach(() => warn.mockRestore());

    describe('when props does not contain a runtime', () => {
      it('should invoke initialize', async () => {
        // Mock runtime to not use styles.
        runtime = {};
        wrapper = shallow(<Licit runtime={runtime} />);
        const spy = jest.spyOn(wrapper.instance(), 'initialize');

        // wait 100ms for setTimeout inside constructor to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(spy).toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
      });
    });

    describe('when styles are fetched successfully', () => {
      it('should invoke initialize', async () => {
        // Mock runtime to succeed.
        runtime = { getStylesAsync: jest.fn().mockResolvedValue([]) };
        wrapper = shallow(<Licit runtime={runtime} />);
        const spy = jest.spyOn(wrapper.instance(), 'initialize');

        // wait 100ms for setTimeout inside constructor to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(runtime.getStylesAsync).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
      });
    });

    describe('when style request fails', () => {
      it('should invoke initialize', async () => {
        // Mock runtime to fail.
        runtime = { getStylesAsync: jest.fn().mockRejectedValue('boom') };
        wrapper = shallow(<Licit runtime={runtime} />);
        const spy = jest.spyOn(wrapper.instance(), 'initialize');

        // wait 100ms for setTimeout inside constructor to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(runtime.getStylesAsync).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
      });
    });
  });
});
