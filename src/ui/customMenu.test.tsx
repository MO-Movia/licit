import React from 'react';
import CustomMenu from './customMenu';

describe('CustomMenu', () => {
  it('renders with default vertical layout', () => {
    const element = React.createElement(CustomMenu, {
      theme: 'light-theme',
      children: React.createElement('div', null, 'Menu Item'),
    });

    const rendered = new CustomMenu({ theme: 'light-theme', children: React.createElement('div', null, 'Menu Item') }).render();

    expect(rendered).toBeTruthy();
    expect(rendered.props.className).toContain('czi-custom-menu');
    expect(rendered.props.className).toContain('light-theme');
    expect(rendered.props.className).toContain('czi-custom-scrollbar');
    expect(rendered.props.className).not.toContain('czi-horizontal-menu');
    expect(rendered.props.children.props.children).toBe('Menu Item');
  });

  it('renders with horizontal class when isHorizontal is true', () => {
    const props = {
      theme: 'light-theme',
      isHorizontal: true,
      children: React.createElement('span', null, 'Child'),
    };

    const rendered = new CustomMenu(props).render();

    expect(rendered).toBeTruthy();
    expect(rendered.props.className).toContain('czi-custom-menu');
    expect(rendered.props.className).toContain('light-theme');
    expect(rendered.props.className).toContain('czi-custom-scrollbar');
    expect(rendered.props.className).toContain('czi-horizontal-menu');
    expect(rendered.props.children.props.children).toBe('Child');
  });
});
