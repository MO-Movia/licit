/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { ReactElement } from 'react';
import CustomMenuItem from './customMenuItem';

//  Mock licit-ui-commands module safely
jest.mock('@modusoperandi/licit-ui-commands', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    CustomButton: (props: { className: string; theme: string; label?: string }) => (
      <button
        data-testid="mock-custom-button"
        className={props.className}
        data-theme={props.theme}
      >
        {props.label || 'MockButton'}
      </button>
    ),
    ThemeContext: React.createContext('mock-theme'),
    TextAlignCommand: class {},
  };
});

describe('CustomMenuItem', () => {
  it('renders with given theme and label', () => {
  const props = {
    theme: 'dark',
    label: 'MyLabel',
    value: {}, // Not an instance of TextAlignCommand, so normal path
  };

    const component = new CustomMenuItem(props);
    const result = component.render() as unknown as ReactElement<{
      className: string;
      theme: string;
       label?: string;
    }>;

    expect(result.props.className).toContain('czi-custom-menu-item');
    expect(result.props.theme).toBe('dark');
    expect(result.props.label).toBe('MyLabel');
  });

  it('renders alignment button when value.alignment is present', () => {
    const component = new CustomMenuItem({
      theme: 'blue',
      label: 'AlignBtn',
      value: { alignment: 'center' },
    } as CustomMenuItem['props']);

    const result = component.render() as unknown as ReactElement<{
      className: string;
      theme: string;
      label?: string;
    }>;

    expect(result.props.className).toContain('czi-custom-menu-item-button blue');
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
