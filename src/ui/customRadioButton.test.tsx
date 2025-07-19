import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CustomRadioButton from './customRadioButton';
import '@testing-library/jest-dom';

describe('CustomRadioButton', () => {
  it('should apply the correct class names based on the checked and inline props', () => {
    const { container } = render(<CustomRadioButton checked={true} inline={true} />);
    
    // Check that the 'checked' and 'inline' classes are applied
    const radioButton = container.firstChild;
    expect(radioButton).toHaveClass('czi-custom-radio-button checked inline');
  });

  it('should render the radio input element', () => {
    const { getByRole } = render(<CustomRadioButton />);
    
    const input = getByRole('radio');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('czi-custom-radio-button-input');
    expect(input).toHaveAttribute('type', 'radio');
  });

  it('should disable the radio button when the disabled prop is passed', () => {
    const { getByRole } = render(<CustomRadioButton disabled={true} />);
    
    const input = getByRole('radio');
    expect(input).toBeDisabled();
  });

  it('should apply the title prop to the PointerSurface', () => {
    const { getByTitle } = render(<CustomRadioButton title="Test Title" />);
    
    const radioButton = getByTitle('Test Title');
    expect(radioButton).toBeInTheDocument();
  });

  it('should render the label correctly', () => {
    const { getByText } = render(<CustomRadioButton label="Test Label" />);
    
    const label = getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('czi-custom-radio-button-label');
  });
});
