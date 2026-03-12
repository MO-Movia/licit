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
    container = null;
  });

  it('should render table details with width and height', () => {
    const props = {
      table: {
        width: 500,
        height: 300,
      },
    };

    ReactDOM.render(<TableDetails {...props} />, container);

    expect(container.querySelector('.czi-table-details-popup')).toBeTruthy();
    expect(container.querySelector('.czi-table-details-header span')?.textContent).toBe('Table Details');

    const rows = container.querySelectorAll('.czi-table-details-section .czi-row');
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector('strong')?.textContent).toBe('500px');
    expect(rows[1].querySelector('strong')?.textContent).toBe('300px');
  });

  it('should render editable fields from table row and cell attributes', () => {
    const props = {
      table: {
        width: 500,
        height: 300,
        noOfColumns: 4,
        tableHeight: '250px',
      },
      row: {
        rowHeight: '44px',
        rowWidth: '420px',
      },
      cell: {
        width: 100,
        height: 50,
        cellWidth: '120px',
        cellStyle: 'padding: 8px;',
        fontSize: '14px',
        letterSpacing: '1px',
        marginTop: '6px',
        MarginBottom: '5px',
      },
    };

    ReactDOM.render(<TableDetails {...props} />, container);

    expect(container.querySelector<HTMLInputElement>('input[name="noOfColumns"]')?.value).toBe('4');
    expect(container.querySelector<HTMLInputElement>('input[name="tableHeight"]')?.value).toBe('250px');
    expect(container.querySelector<HTMLInputElement>('input[name="rowHeight"]')?.value).toBe('44px');
    expect(container.querySelector<HTMLInputElement>('input[name="rowWidth"]')).toBeNull();
    expect(container.querySelector<HTMLInputElement>('input[name="cellWidth"]')?.value).toBe('120px');
    expect(container.querySelector<HTMLInputElement>('input[name="cellStyle"]')?.value).toBe('padding: 8px;');
    expect(container.querySelector<HTMLInputElement>('input[name="fontSize"]')?.value).toBe('14px');
    expect(container.querySelector<HTMLInputElement>('input[name="letterSpacing"]')?.value).toBe('1px');
    expect(container.querySelector<HTMLInputElement>('input[name="marginTop"]')?.value).toBe('6px');
    expect(container.querySelector<HTMLInputElement>('input[name="MarginBottom"]')?.value).toBe('5px');
  });

  it('should not render cell details when cell prop is not provided', () => {
    const props = {
      table: {
        width: 500,
        height: 300,
      },
      row: {
        rowHeight: '44px',
        rowWidth: '420px',
      },
    };

    ReactDOM.render(<TableDetails {...props} />, container);

    expect(container.textContent).not.toContain('Cell Width');
    expect(container.textContent).not.toContain('Cell Attributes');
    expect(container.querySelector('input[name="cellWidth"]')).toBeFalsy();
  });

  it('should call close callback when close button is clicked', () => {
    const closeMock = jest.fn();
    const props = {
      table: {
        width: 500,
        height: 300,
      },
      close: closeMock,
    };

    ReactDOM.render(<TableDetails {...props} />, container);

    const closeButton = container.querySelector('.czi-table-details-close');
    expect(closeButton).toBeTruthy();
    expect(closeButton['title']).toBe('Close');

    closeButton['click']();
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it('should call onApply with current form values', () => {
    const closeMock = jest.fn();
    const onApplyMock = jest.fn();
    const props = {
      table: {
        width: 500,
        height: 300,
        noOfColumns: '6',
      },
      row: {
        rowHeight: null,
        rowWidth: null,
      },
      cell: {
        width: 100,
        height: 50,
        MarginBottom: '10px',
      },
      close: closeMock,
      onApply: onApplyMock,
    };

    ReactDOM.render(<TableDetails {...props} />, container);

    const applyButton = container.querySelector('button[title="Apply"]');
    applyButton['click']();

    expect(onApplyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        noOfColumns: '6',
        MarginBottom: '10px',
      })
    );
    expect(closeMock).toHaveBeenCalled();
  });
});