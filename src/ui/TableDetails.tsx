/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import React, {PureComponent} from 'react';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';

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

const styles: Record<string, React.CSSProperties> = {
  popup: {
    background: '#2b2b2b',
    borderRadius: '6px',
    color: '#e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'sans-serif',
    fontSize: '13px',
    minWidth: '420px',
    maxWidth: '480px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  header: {
    alignItems: 'center',
    background: '#333',
    borderBottom: '1px solid #444',
    borderRadius: '6px 6px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    fontWeight: 600,
    fontSize: '14px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '14px',
    lineHeight: '1',
    padding: '2px 6px',
  },
  sizeRow: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 16px',
  },
  sizeRow2: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    background: '#1e1e1e',
    border: '1px solid #555',
    borderRadius: '4px',
    padding: '6px 10px',
  },
  sizeValue: {
    color: '#fff',
    fontWeight: 600,
  },
  divider: {
    borderTop: '1px solid #444',
    borderBottom: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    margin: '0',
  },
  section: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  subtitle: {
    color: '#aaa',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '2px',
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  inputField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    color: '#bbb',
    fontSize: '12px',
  },
  input: {
    background: '#1e1e1e',
    border: '1px solid #555',
    borderRadius: '4px',
    color: '#e0e0e0',
    fontSize: '13px',
    outline: 'none',
    padding: '6px 10px',
    width: '100%',
    boxSizing: 'border-box',
  },
  actions: {
    borderTop: '1px solid #444',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '12px 16px',
  },
  cancelBtn: {
    borderRadius: '4px',
    border: '1px solid #555',
    background: '#3a3a3a',
    color: '#ddd',
    cursor: 'pointer',
    fontSize: '13px',
    padding: '7px 20px',
  },
  applyBtn: {
    borderRadius: '4px',
    border: '1px solid #2e6bbd',
    background: '#2e6bbd',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    padding: '7px 20px',
  },
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
    placeholder = ''
  ): React.ReactElement {
    return (
      <div style={styles.inputField}>
        <label htmlFor={`table-details-${name}`} style={styles.label}>
          {label}
        </label>
        <input
          id={`table-details-${name}`}
          name={name}
          onChange={this._onInputChange}
          placeholder={placeholder}
          style={styles.input}
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
      <div style={styles.gridRow}>
        {this.renderInputField(left.name, left.label, left.placeholder || '')}
        {this.renderInputField(right.name, right.label, right.placeholder || '')}
      </div>
    );
  }

  render(): React.ReactElement {
    const {table, row, cell, close} = this.props;

    return (
      <div style={styles.popup}>
        {/* Header */}
        <div style={styles.header}>
          <span>Table Details</span>
          <button onClick={() => close?.()} style={styles.closeBtn} title="Close">
            ✕
          </button>
        </div>

        {/* Table Width + Height display rows */}
        <div style={styles.sizeRow}>
          <span>Table Width</span>
          <strong style={styles.sizeValue}>{table.width}px</strong>
        </div>
        <div style={styles.sizeRow}>
          <span>Table Height</span>
          <strong style={styles.sizeValue}>{table.height}px</strong>
        </div>

        <hr style={styles.divider} />

        {/* Table Attributes */}
        <div style={styles.section}>
          <div style={styles.subtitle}>Table Attributes</div>
          {this.renderInputPair(
            {name: 'noOfColumns', label: 'No Of Columns', placeholder: 'e.g. 4'},
            {name: 'tableHeight', label: 'Table Height', placeholder: 'e.g. 280 or 280px'}
          )}
        </div>

        {/* Row Attributes */}
        {row && (
          <>
            <hr style={styles.divider} />
            <div style={styles.section}>
              <div style={styles.subtitle}>Row Attributes</div>
              {this.renderInputField('rowHeight', 'Row Height', 'e.g. 48 or 48px')}
            </div>
          </>
        )}

        {/* Cell Attributes */}
        {cell && (
          <>
            <hr style={styles.divider} />
            <div style={styles.section}>
              <div style={styles.subtitle}>Cell Attributes</div>

              {/* Read-only Cell Width / Cell Height display */}
              <div style={styles.gridRow}>
                <div style={styles.sizeRow2}>
                  <span style={styles.label}>Cell Width</span>
                  <strong style={styles.sizeValue}>{cell.width}px</strong>
                </div>
                <div style={styles.sizeRow2}>
                  <span style={styles.label}>Cell Height</span>
                  <strong style={styles.sizeValue}>{cell.height}px</strong>
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
        <div style={styles.actions}>
          <button onClick={this._cancel} style={styles.cancelBtn} title="Cancel" type="button">
            Cancel
          </button>
          <button onClick={this._apply} style={styles.applyBtn} title="Apply" type="button">
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
