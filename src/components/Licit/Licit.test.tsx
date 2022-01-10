import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Licit from './Licit';
//import RichTextEditor from '../ui/RichTextEditor';

const noop: any = function () {};
/**
 * Configure Jest to use react / enzyme
 */
configure({
  adapter: new Adapter(),
});

describe('<Licit />', () => {
  let wrapper;
  let licit;

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
    wrapper = shallow(<Licit instanceId="001"/>);
    licit = wrapper.instance();
  });

  describe('editorView (getter)', () => {
    it('should match the snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
