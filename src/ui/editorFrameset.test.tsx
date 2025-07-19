import { render, screen } from '@testing-library/react';
import React from 'react';
import EditorFrameset, { FRAMESET_BODY_CLASSNAME } from './editorFrameset'; 
import { ThemeContext } from '@modusoperandi/licit-ui-commands';
import '@testing-library/jest-dom';

// Mock the ThemeContext to provide a theme
const mockThemeContextValue = 'dark';

describe('EditorFrameset', () => {
  it('should render with correct classes and styles', () => {
   const {container} = render(
      <ThemeContext.Provider value={mockThemeContextValue}>
        <EditorFrameset height={50} width={80} className="custom-class" />
      </ThemeContext.Provider>
    );

    const editorFrame = container.firstChild; // Assuming it's a 'region' element
    expect(editorFrame).toHaveClass('czi-editor-frameset');
    expect(editorFrame).toHaveClass('with-fixed-layout');
    expect(editorFrame).toHaveClass('custom-class');
    expect(editorFrame).toHaveStyle('width: 80vh');
    expect(editorFrame).toHaveStyle('height: 50vh');
  });

  it('toCSS should return undefined if width is null', () => {
    const {container} = render(
       <ThemeContext.Provider value={mockThemeContextValue}>
         <EditorFrameset height={50} width={null} className="custom-class" />
       </ThemeContext.Provider>
     );
 
     const editorFrame = container.firstChild; // Assuming it's a 'region' element
     expect(editorFrame).toHaveClass('czi-editor-frameset');
     expect(editorFrame).toHaveStyle('width: undefined');
   });

   it('toCSS should return undefined if width is auto', () => {
    const {container} = render(
       <ThemeContext.Provider value={mockThemeContextValue}>
         <EditorFrameset height={50} width={'auto'} className="custom-class" />
       </ThemeContext.Provider>
     );
 
     const editorFrame = container.firstChild; // Assuming it's a 'region' element
     expect(editorFrame).toHaveClass('czi-editor-frameset');
     expect(editorFrame).toHaveStyle('width: undefined');
   });

   it('toCSS should same value if it the parameter is string', () => {
    const {container} = render(
       <ThemeContext.Provider value={mockThemeContextValue}>
         <EditorFrameset height={50} width={'500vh'} className="custom-class" />
       </ThemeContext.Provider>
     );
 
     const editorFrame = container.firstChild; // Assuming it's a 'region' element
     expect(editorFrame).toHaveClass('czi-editor-frameset');
     expect(editorFrame).toHaveStyle('width: 500vh');
   });

});

