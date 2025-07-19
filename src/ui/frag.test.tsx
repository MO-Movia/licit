import { render, screen } from '@testing-library/react';
import Frag from './frag'; 
import React from 'react';
import '@testing-library/jest-dom';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

describe('Frag Component', () => {
     UICommand.theme = "dark";

  it('should render with the correct class name', () => {
    render(<Frag>Test content</Frag>);
    
    const fragDiv = screen.getAllByRole('generic'); 
    expect(fragDiv[0]).toHaveTextContent('Test content');
  });

});
