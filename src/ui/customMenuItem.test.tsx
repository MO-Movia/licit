import * as React from 'react';
import CustomMenuItem from './customMenuItem';

//  Mock licit-ui-commands module safely
jest.mock('@modusoperandi/licit-ui-commands', () => {
  const React = require('react');
  return {
    CustomButton: (props: any) => (
      <button
        data-testid="mock-custom-button"
        className={props.className}
        data-theme={props.theme}
      >
        {props.label || 'MockButton'}
      </button>
    ),
    ThemeContext: React.createContext('mock-theme'),
  };
});

describe('CustomMenuItem', () => {
  it('renders with given theme and label', () => {
    const component = new CustomMenuItem({
      theme: 'dark',
      label: 'MyLabel',
      value: {},
    } as any);

    const result = component.render() as any;

    expect(result.props.className).toContain('czi-custom-menu-item');
    expect(result.props.theme).toBe('dark');
    expect(result.props.label).toBe('MyLabel');
  });

  it('renders alignment button when value.alignment is present', () => {
    const component = new CustomMenuItem({
      theme: 'blue',
      label: 'AlignBtn',
      value: { alignment: 'center' },
    } as any);

    const result = component.render() as any;

    expect(result.props.className).toContain('czi-custom-menu-item-button');
    expect(result.props.theme).toBe('blue');
    expect(result.props.label).toBe('AlignBtn');
  });

  it('renders Separator correctly', () => {
    const Separator = CustomMenuItem.Separator;
    //  Always pass props (even if empty) to class-based React components
    const separator = new Separator({}); 
    const rendered = separator.render();

    expect(rendered.type).toBe('div');
    expect(rendered.props.className).toBe('czi-custom-menu-item-separator');
  });
});
