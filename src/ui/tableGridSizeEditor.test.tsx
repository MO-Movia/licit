import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TableGridSizeEditor, { TableGridSizeEditorState } from './tableGridSizeEditor';
import { fromHTMlElement, fromXY, isIntersected, clamp } from '@modusoperandi/licit-ui-commands';
import htmlElementToRect from '../htmlElementToRect';
import '@testing-library/jest-dom';
import ReactDOM from 'react-dom';

// Mock the dependencies
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  fromHTMlElement: jest.fn(),
  fromXY: jest.fn(),
  isIntersected: jest.fn(),
  clamp: jest.fn(),
}));

jest.mock('../htmlElementToRect', () => jest.fn());

describe('TableGridSizeEditor', () => {
  const mockClose = jest.fn();

  let componentInstance;

  beforeEach(() => {

    componentInstance = new TableGridSizeEditor({close: mockClose}); // Create a new instance of the Grid before each test

    // Clear mocks before each test
    mockClose.mockClear();
    (fromHTMlElement as jest.Mock).mockReturnValue({ x: 0, y: 0 });
    (fromXY as jest.Mock).mockReturnValue({ x: 0, y: 0 });
    (isIntersected as jest.Mock).mockReturnValue(true);
    (clamp as jest.Mock).mockImplementation((min: number, value: number, max: number) => Math.max(min, Math.min(value, max)));
    global.cancelAnimationFrame = jest.fn();
    global.requestAnimationFrame = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should render correctly and update grid size on mouse move', () => {
    const { container } = render(<TableGridSizeEditor close={mockClose} />);

    // Ensure the component renders properly
    expect(container).toBeInTheDocument();

    // Simulate mouse enter event to initialize the mouse move tracking
    const gridEditorBody = container.querySelector('.czi-table-grid-size-editor-body')!;
    if (gridEditorBody) {
      fireEvent.mouseEnter(gridEditorBody);

      // Simulate mouse move event
      fireEvent.mouseMove(gridEditorBody, {
        clientX: 100,
        clientY: 100,
      });

      
      // Check if the state is updated correctly (mocking the logic inside _updateGridSize)
      expect(requestAnimationFrame).toHaveBeenCalled();
    }

    // Simulate mouse down event to trigger the close function
    fireEvent.mouseDown(gridEditorBody);

    // Check if the close function was called with the correct state (rows and cols)
    expect(mockClose).toHaveBeenCalledWith({ rows: 1, cols: 1 }); // Adjust based on the exact behavior of your component
  });

  it('should call preventDefault if all fails elRect && mouseRect && isIntersected(elRect, mouseRect, 50)', () => {

    let mockEvent = {
      preventDefault: jest.fn(),
      stopImmediatePropagation: jest.fn(),
      screenX: 100,
      screenY: 200,
    };

    // Mock the findDOMNode method to return a test element
    ReactDOM.findDOMNode = jest.fn().mockReturnValue({
      getBoundingClientRect: jest.fn(() => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
      })),
    });

// Mock the utility functions
const elRect = { left: 0, top: 0, right: 100, bottom: 100 };
const mouseRect = { left: 50, top: 50, right: 60, bottom: 60 };

    (fromHTMlElement as jest.Mock).mockReturnValue({ x: 0, y: 0 });
    (fromXY as jest.Mock).mockReturnValue(mouseRect);
    (isIntersected as jest.Mock).mockReturnValue(true);

    (htmlElementToRect as jest.Mock).mockReturnValue(elRect);

    componentInstance._ref = {} as HTMLElement;

// Call the method
componentInstance._onMouseMove(mockEvent);

    // Check that preventDefault and stopImmediatePropagation were called
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(mockEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1);

  });

  it('should call the close function with the current grid size when mouse down is triggered', () => {
    const { container } = render(<TableGridSizeEditor close={mockClose}/>);

    const gridEditorBody = container.querySelector('.czi-table-grid-size-editor-body');
    if (gridEditorBody) {
      // Simulate mouse down event to check that close is called with the correct state
      fireEvent.mouseDown(gridEditorBody);

      // Check if close was called with the current state
      expect(mockClose).toHaveBeenCalledWith({ rows: 1, cols: 1 }); // Adjust based on initial values
    }
  });

  it('should render correctly and should create dom if we the state value changed', () => {
    componentInstance.state = {
      rows: 5,
      cols: 5,
    };

    let result = componentInstance.render();

    expect(result.props.className).toEqual('czi-table-grid-size-editor');
  });

  it('_updateGridSize should update the state', () => {

    const { container  } = render(<TableGridSizeEditor close={mockClose}/>);

    const setStateSpy = jest.fn();;
    const instance = new TableGridSizeEditor({close: mockClose});
    instance.setState = setStateSpy;
    instance._mx = 10;
    instance._my = 10;
    instance._ex = 5;
    instance._ey = 5;
    instance.state = {
        rows: 5,
        cols: 5
    };
    instance._updateGridSize();

    expect(setStateSpy).toHaveBeenCalled();
    
  });

  it('_updateGridSize should update the state if rows and cols are different', () => {

    const { container  } = render(<TableGridSizeEditor close={mockClose}/>);

    const setStateSpy = jest.fn();;
    const instance = new TableGridSizeEditor({close: mockClose});
    instance.setState = setStateSpy;
    instance._mx = 10;
    instance._my = 10;
    instance._ex = 5;
    instance._ey = 5;
    instance.state = {
        rows: 1,
        cols: 5
    };
    instance._updateGridSize();

    expect(setStateSpy).toHaveBeenCalled();
    
  });
});
