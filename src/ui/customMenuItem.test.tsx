import React from 'react';
import { render } from '@testing-library/react';
import CustomMenuItem from './customMenuItem';
import '@testing-library/jest-dom';

describe('CustomMenuItem', () => {
  it('should apply correct class name based on theme prop', () => {
    const { container } = render(
      <CustomMenuItem theme="dark">Test Button</CustomMenuItem>
    );
    expect(container.firstChild).toHaveClass('czi-tooltip-surface');
  });

  it('should apply czi-custom-menu-item-button class if value.alignment exists', () => {
    const { container } = render(
      <CustomMenuItem theme="light" value={{ alignment: true }}>
        Test Button
      </CustomMenuItem>
    );
    expect(container.firstChild).toHaveClass('czi-tooltip-surface');
  });

  it('should render the Separator component correctly', () => {
    const { container } = render(
      <CustomMenuItem.Separator />
    );
    const separator = container.querySelector('.czi-custom-menu-item-separator');
    expect(separator).toBeInTheDocument();
  });
});
