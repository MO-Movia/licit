import React from 'react';
import { render } from '@testing-library/react';
import CustomMenu from './customMenu';
import '@testing-library/jest-dom';

describe('CustomMenu', () => {
  it('should render with correct class based on theme prop', () => {
    const { container } = render(<CustomMenu theme="dark">Menu Items</CustomMenu>);
    expect(container.firstChild).toHaveClass('czi-custom-menu dark');
  });

  it('should apply czi-horizontal-menu class when isHorizontal is true', () => {
    const { container } = render(
      <CustomMenu theme="light" isHorizontal={true}>Menu Items</CustomMenu>
    );
    expect(container.firstChild).toHaveClass('czi-horizontal-menu');
  });

  it('should not apply czi-horizontal-menu class when isHorizontal is false', () => {
    const { container } = render(
      <CustomMenu theme="light" isHorizontal={false}>Menu Items</CustomMenu>
    );
    expect(container.firstChild).not.toHaveClass('czi-horizontal-menu');
  });

  it('should render children inside the div', () => {
    const { getByText } = render(
      <CustomMenu theme="dark" isHorizontal={false}>
        Menu Items
      </CustomMenu>
    );
    expect(getByText('Menu Items')).toBeInTheDocument();
  });
});
