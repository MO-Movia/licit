import React from 'react';
import Frag from './frag';

//  Mock React.createElement to test rendering behavior
describe('Frag', () => {
  let createElementSpy: jest.SpyInstance;

  beforeEach(() => {
    createElementSpy = jest.spyOn(React, 'createElement');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(Frag).toBeDefined();
  });

  it('should extend React.Component', () => {
    const instance = new Frag({});
    expect(instance).toBeInstanceOf(React.Component);
  });

  it('should render a div with class "czi-frag"', () => {
    const frag = new Frag({ children: 'Hello World' });
    const output = frag.render() as React.ReactElement;

    // It should return a React element
    expect(React.isValidElement(output)).toBe(true);

    // Element type and props
    expect(output.type).toBe('div');
    expect(output.props.className).toBe('czi-frag');
    expect(output.props.children).toBe('Hello World');
  });

  it('should call React.createElement internally when rendering', () => {
    const frag = new Frag({ children: 'Check' });
    frag.render();

    expect(createElementSpy).toHaveBeenCalledWith(
      'div',
      { className: 'czi-frag' },
      'Check'
    );
  });
});
