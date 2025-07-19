import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LinkURLEditor from './linkURLEditor';

// Mock the required components and functions
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  CustomButton: jest.fn(() => <button>Mocked CustomButton</button>),
  preventEventDefault: jest.fn(),
}));

jest.mock('../sanitizeURL', () => jest.fn((url) => `sanitized-${url}`));

describe('LinkURLEditor Component', () => {
  const closeMock = jest.fn();

  beforeEach(() => {
    closeMock.mockClear();
  });

  it('should render correctly with initial props', () => {
    render(<LinkURLEditor href="http://example.com" close={closeMock} />);

    // Check if the URL input field is rendered with the correct initial value
    const inputField = screen.getByPlaceholderText('Paste a URL');
    expect(inputField).toHaveValue('http://example.com');

    // Check if the Apply button is rendered
    const linkText = screen.getByText('Add a Link');
    expect(linkText).toBeInTheDocument();
  });

  it('should render correctly if href is empty', () => {
    render(<LinkURLEditor href="" close={closeMock} />);

    // Check if the URL input field is rendered with the correct initial value
    const inputField = screen.getByPlaceholderText('Paste a URL');
   
    expect(inputField).toHaveValue('');

    // Check if the Apply button is rendered
    const linkText = screen.getByText('Add a Link');
    expect(linkText).toBeInTheDocument();
  });

  it('should update URL state when input changes', () => {
    render(<LinkURLEditor href="http://example.com" close={closeMock} />);

    const inputField = screen.getByPlaceholderText('Paste a URL');
    fireEvent.change(inputField, { target: { value: 'http://new-url.com' } });

    // Check if the input field value has been updated
    expect(inputField).toHaveValue('http://new-url.com');
  });

  it('_onKeyDown should call _apply', () => {
    let mockCLose = closeMock;
let result = new LinkURLEditor({href: "http://example.com", close:mockCLose});
result._onKeyDown({
    key: 'Enter', code: 'Enter', charCode: 27,
    altKey: false,
    ctrlKey: false,
    preventDefault: function (): void {
    },
    timeStamp: 0,
    type: ''
} as React.KeyboardEvent);
  expect(result.props.close).toHaveBeenCalledWith("sanitized-http://example.com");
  });

  it('_cancel should call the close', () => {
let result = new LinkURLEditor({href: "http://example.com", close:closeMock});
result._cancel();
  expect(result.props.close).toHaveBeenCalled();
  });

  it(' propsTypes close should return null if its not constructor', () => { 
    const propName = "close";
    const output = new Error(
        propName +
          'must be a function with 1 arg of type string'
      ) 
      let result = LinkURLEditor.propsTypes.close({
          href: "",
          close: function (props?: any, propName?: string): Error {
              return output;
          }
      }, "close");
  expect(result).toEqual(null);
  });

  it(' propsTypes close should thow error if the parameter is a function', () => { 
    const propName = "close";
    const output = new Error(
        propName +
          'must be a function with 1 arg of type string'
      ) 
      let result = LinkURLEditor.propsTypes.close({
          href: "",
          close: (props?: any, propName?: string): Error => {
              return output;
          }
      }, "close");;
  expect(result).toEqual(output);
  });

});


