import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Licit from './Licit';
import { LicitProps } from './licit';

/**
 * Configure Jest to use react / enzyme
 */
configure({
  adapter: new Adapter(),
});

describe('<Licit />', () => {
  let wrapper;
  let props: LicitProps = {
    docID: '0000-0000-0000',
    plugins:[]
  };
  beforeEach(() => {
    wrapper = shallow(<Licit {...props}/>);
  });

  describe('editorView (getter)', () => {
    it('should match the snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
