import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DocLayoutEditor from './docLayoutEditor';
import {DocLayoutEditorValue} from './docLayoutEditor';
import { LAYOUT } from '../constants';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import '@testing-library/jest-dom';

describe('DocLayoutEditor', () => {
  let closeMock;

  beforeEach(() => {
    closeMock = jest.fn();
  });

  it('should render radio buttons for layout options', () => {
    const { getByText } = render(<DocLayoutEditor close={closeMock} />);

    // Check that the radio buttons are rendered for each layout option
    expect(getByText('US Letter - Portrait')).toBeInTheDocument();
    expect(getByText('US Letter - Landscape')).toBeInTheDocument();
    expect(getByText('A4 - Portrait')).toBeInTheDocument();
    expect(getByText('A4 - Landscape')).toBeInTheDocument();
    expect(getByText('4:3 Desktop Screen')).toBeInTheDocument();
    expect(getByText('16:9 Desktop Screen')).toBeInTheDocument();
  });

  it('should select the radio button based on the selectedValue', () => {
    const { getByText } = render(
      <DocLayoutEditor initialValue={{ layout: LAYOUT.A4_PORTRAIT }} close={closeMock} />
    );

    // Check that the A4 Portrait radio button is selected
    expect(getByText('A4 - Portrait')).toBeDefined();
  });

  it('should create CustomRadioButton', () => {
    const { getByText } = render(
      <DocLayoutEditor initialValue={{ layout: LAYOUT.A4_PORTRAIT, width: 500 }} close={closeMock} />
    );
    // Check that the A4 Portrait radio button is selected
    expect(getByText('A4 - Portrait')).toBeDefined();
  });

  it('_onSelect layout value should change', () => {   
    let layout = new DocLayoutEditor({initialValue: { layout: LAYOUT.A4_PORTRAIT },  close:closeMock});
    layout. _onSelect(LAYOUT.A4_PORTRAIT);
    expect(layout.state.selectedValue).toBe(LAYOUT.A4_PORTRAIT);
  });

  it('_cancel should call props close', () => {   
    let layout = new DocLayoutEditor({initialValue: { layout: LAYOUT.A4_PORTRAIT },  close:closeMock});
    layout._cancel();
    expect(closeMock).toHaveBeenCalled();
  });

  it(' _apply should call props close with LAYOUT.A4_PORTRAIT', () => {  
    let layout = new DocLayoutEditor({initialValue: { layout: LAYOUT.A4_PORTRAIT },  close:closeMock});
    layout._apply ();
    expect(closeMock).toHaveBeenCalledWith({ width: null, layout: LAYOUT.A4_PORTRAIT })
  });

  it(' _apply should call props close with LAYOUT.A4_PORTRAIT', () => {  
    let layout = new DocLayoutEditor({initialValue: { width: 500 },  close:closeMock});
    layout._apply ();
    expect(closeMock).toHaveBeenCalledWith({ width: 500, layout: null })
  });

  it(' propsTypes close should thow error if the parameter is a function', () => { 
    const propName = "close";
    const output = new Error(
        propName +
          'must be a function with 1 arg of type DocLayoutEditorValue'
      ) 
  let result =  DocLayoutEditor.propsTypes.close({initialValue: { width: 500 },  close:(val?: DocLayoutEditorValue) => {}}, "close");
  expect(result).toEqual(output);
  });
});


