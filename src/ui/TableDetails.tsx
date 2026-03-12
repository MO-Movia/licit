/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import React, {PureComponent} from 'react';

export type TableDetailsInput = {
  noOfColumns: string;
  tableHeight: string;
  rowHeight: string;
  rowWidth: string;
  cellWidth: string;
  cellStyle: string;
  fontSize: string;
  letterSpacing: string;
  marginTop: string;
  MarginBottom: string;
};

type TableDetailsProps = {
  close?: () => void;
  onApply?: (values: TableDetailsInput) => void;
  table: {
    width: number;
    height: number;
    noOfColumns?: string | number | null;
    tableHeight?: string | null;
  };
  row?: {
    rowHeight?: string | null;
    rowWidth?: string | null;
  };
  cell?: {
    width: number;
    height: number;
    cellWidth?: string | null;
    cellStyle?: string | null;
    fontSize?: string | null;
    letterSpacing?: string | null;
    marginTop?: string | null;
    MarginBottom?: string | null;
  };
};

const toInputValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

class TableDetails extends PureComponent<TableDetailsProps, TableDetailsInput> {
  declare props: TableDetailsProps;

  constructor(props: TableDetailsProps) {
    super(props);

    this.state = {
      noOfColumns: toInputValue(props.table.noOfColumns),
      tableHeight: toInputValue(props.table.tableHeight),
      rowHeight: toInputValue(props.row?.rowHeight),
      rowWidth: toInputValue(props.row?.rowWidth),
      cellWidth: toInputValue(props.cell?.cellWidth),
      cellStyle: toInputValue(props.cell?.cellStyle),
      fontSize: toInputValue(props.cell?.fontSize),
      letterSpacing: toInputValue(props.cell?.letterSpacing),
      marginTop: toInputValue(props.cell?.marginTop),
      MarginBottom: toInputValue(props.cell?.MarginBottom),
    };
  }

  renderInputField(
    name: keyof TableDetailsInput,
    label: string,
    placeholder = '',
    className = ''
  ): React.ReactElement {
    return (
      <div className={`czi-input-row ${className} ${UICommand.theme}`}>
        <label htmlFor={`table-details-${name}`}>{label}</label>
        <input
          id={`table-details-${name}`}
          name={name}
          onChange={this._onInputChange}
          placeholder={placeholder}
          type="text"
          value={this.state[name]}
        />
      </div>
    );
  }

  renderInputPair(
    left: {name: keyof TableDetailsInput; label: string; placeholder?: string},
    right: {name: keyof TableDetailsInput; label: string; placeholder?: string}
  ): React.ReactElement {
    return (
      <div className="czi-input-grid-row">
        {this.renderInputField(left.name, left.label, left.placeholder || '', 'grid-item')}
        {this.renderInputField(right.name, right.label, right.placeholder || '', 'grid-item')}
      </div>
    );
  }

  render(): React.ReactElement {
    const {table, row, cell, close} = this.props;

    return (
      <div className={'czi-table-details-popup ' + UICommand.theme}>
        {/* Header */}
        <div className={'czi-table-details-header ' + UICommand.theme}>
          <span>Table Details</span>
          <button
            className={'czi-table-details-close ' + UICommand.theme}
            onClick={() => close?.()}
            title="Close"
          >
            X
          </button>
        </div>

        {/* Table Width / Table Height — two separate read-only rows */}
        <div className={'czi-row ' + UICommand.theme}>
          <span>Table Width</span>
          <strong>{table.width}px</strong>
        </div>
        <div className={'czi-row ' + UICommand.theme}>
          <span>Table Height</span>
          <strong>{table.height}px</strong>
        </div>

        <div className="czi-divider" />

        {/* Table Attributes */}
        <div className="czi-table-details-section">
          <div className={'czi-table-details-subtitle ' + UICommand.theme}>Table Attributes</div>
          {this.renderInputPair(
            {name: 'noOfColumns', label: 'No Of Columns', placeholder: 'e.g. 4'},
            {name: 'tableHeight', label: 'Table Height', placeholder: 'e.g. 280 or 280px'}
          )}
        </div>

        {/* Row Attributes */}
        {row && (
          <>
            <div className="czi-divider" />
            <div className="czi-table-details-section">
              <div className={'czi-table-details-subtitle ' + UICommand.theme}>Row Attributes</div>
              {/* Full-width single input */}
              {this.renderInputField('rowHeight', 'Row Height', 'e.g. 48 or 48px')}
            </div>
          </>
        )}

        {/* Cell Attributes */}
        {cell && (
          <>
            <div className="czi-divider" />
            <div className="czi-table-details-section">
              <div className={'czi-table-details-subtitle ' + UICommand.theme}>Cell Attributes</div>

              {/* Read-only Cell Width / Cell Height display */}
              <div className="czi-input-grid-row">
                <div className={'czi-row czi-row--inset ' + UICommand.theme}>
                  <span>Cell Width</span>
                  <strong>{cell.width}px</strong>
                </div>
                <div className={'czi-row czi-row--inset ' + UICommand.theme}>
                  <span>Cell Height</span>
                  <strong>{cell.height}px</strong>
                </div>
              </div>

              {this.renderInputPair(
                {name: 'cellWidth', label: 'Cell Width', placeholder: 'e.g. 120 or 120px'},
                {name: 'fontSize', label: 'Font Size', placeholder: 'e.g. 14 or 14px'}
              )}
              {this.renderInputPair(
                {name: 'letterSpacing', label: 'Letter Spacing', placeholder: 'e.g. 1 or 1px'},
                {name: 'cellStyle', label: 'Cell Style', placeholder: 'e.g. padding: 8px;'}
              )}
              {this.renderInputPair(
                {name: 'marginTop', label: 'Margin Top', placeholder: 'e.g. 8 or 8px'},
                {name: 'MarginBottom', label: 'Margin Bottom', placeholder: 'e.g. 8 or 8px'}
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="czi-table-details-actions">
          <button
            className={'czi-table-details-button ' + UICommand.theme}
            onClick={this._cancel}
            title="Cancel"
            type="button"
          >
            Cancel
          </button>
          <button
            className={'czi-table-details-button primary ' + UICommand.theme}
            onClick={this._apply}
            title="Apply"
            type="button"
          >
            Apply
          </button>
        </div>
      </div>
    );
  }

  _cancel = (): void => {
    this.props.close?.();
  };

  _apply = (): void => {
    this.props.onApply?.({...this.state});
    this.props.close?.();
  };

  _onInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {name, value} = event.target;
    this.setState({
      [name]: value,
    } as Pick<TableDetailsInput, keyof TableDetailsInput>);
  };
}

export default TableDetails;
