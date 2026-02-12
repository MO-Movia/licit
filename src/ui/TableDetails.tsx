/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import * as React from 'react';
type TableDetailsProps = {
  close?: () => void;
  table: {
    width: number;
    height: number;
  };
  cell?: {
    width: number;
    height: number;
  };
};
class TableDetails extends React.PureComponent<TableDetailsProps,TableDetailsProps> {
 declare props: TableDetailsProps;

  render(): React.ReactElement {
    const { table, cell, close } = this.props;

    return (
      <div className="czi-table-details-popup">
        <div className="czi-table-details-header">
          <span>Table Details</span>

          <button
            className="czi-table-details-close"
            onClick={() => close && close()}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="czi-table-details-section">
          <div className="czi-row">
            <span>Table Width</span>
            <strong>{table.width}px</strong>
          </div>
          <div className="czi-row">
            <span>Table Height</span>
            <strong>{table.height}px</strong>
          </div>
        </div>

        {cell && (
          <>
            <div className="czi-divider" />

            <div className="czi-table-details-section">
              <div className="czi-row">
                <span>Cell Width</span>
                <strong>{cell.width}px</strong>
              </div>
              <div className="czi-row">
                <span>Cell Height</span>
                <strong>{cell.height}px</strong>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

}

export default TableDetails;
