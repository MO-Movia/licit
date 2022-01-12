import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Licit from './Licit';

/**
 * Configure Jest to use react / enzyme
 */
configure({
  adapter: new Adapter(),
});

describe('<Licit />', () => {
  let wrapper;

  beforeEach(() => {
    const deps = [];
    wrapper = shallow(<Licit collabServiceURL={'http://localhost:3002'} debug={false} docID={'0000-0000-0000-0001'} height={''} plugins={deps} width={''}/>);
  });

  describe('editorView (getter)', () => {
    it('should match the snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
