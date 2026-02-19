/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TableDetails from './TableDetails';

describe('TableDetails', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null ;
  });

  it('should render table details with width and height', () => {
    const props = {
      table: {
        width: 500,
        height: 300
      }
    };

    ReactDOM.render(<TableDetails {...props} />, container);

    expect(container.querySelector('.czi-table-details-popup')).toBeTruthy();
    expect(container.querySelector('.czi-table-details-header span')?.textContent).toBe('Table Details');
    
    const rows = container.querySelectorAll('.czi-table-details-section .czi-row');
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector('strong')?.textContent).toBe('500px');
    expect(rows[1].querySelector('strong')?.textContent).toBe('300px');
  });

  it('should render cell details when cell prop is provided', () => {
    const props = {
      table: {
        width: 500,
        height: 300
      },
      cell: {
        width: 100,
        height: 50
      }
    };

    ReactDOM.render(<TableDetails {...props} />, container);

    const sections = container.querySelectorAll('.czi-table-details-section');
    expect(sections.length).toBe(2);
    
    const cellRows = sections[1].querySelectorAll('.czi-row');
    expect(cellRows.length).toBe(2);
    expect(cellRows[0].querySelector('strong')?.textContent).toBe('100px');
    expect(cellRows[1].querySelector('strong')?.textContent).toBe('50px');
    
    expect(container.querySelector('.czi-divider')).toBeTruthy();
  });

  it('should not render cell details when cell prop is not provided', () => {
    const props = {
      table: {
        width: 500,
        height: 300
      }
    };

    ReactDOM.render(<TableDetails {...props} />, container);

    const sections = container.querySelectorAll('.czi-table-details-section');
    expect(sections.length).toBe(1);
    expect(container.querySelector('.czi-divider')).toBeFalsy();
  });

  it('should call close callback when close button is clicked', () => {
    const closeMock = jest.fn();
    const props = {
      table: {
        width: 500,
        height: 300
      },
      close: closeMock
    };

    ReactDOM.render(<TableDetails {...props} />, container);

    const closeButton = container.querySelector('.czi-table-details-close') ;
    expect(closeButton).toBeTruthy();
    expect(closeButton['title']).toBe('Close');

    closeButton['click']();
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
  
});