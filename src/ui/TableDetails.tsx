/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import React, { PureComponent } from 'react';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
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
class TableDetails extends PureComponent<TableDetailsProps,TableDetailsProps> {
 declare props: TableDetailsProps;

  render(): React.ReactElement {
    const { table, cell, close } = this.props;

    return (
      <div className= {"czi-table-details-popup " + UICommand.theme}>
        <div className={"czi-table-details-header " + UICommand.theme}>
          <span>Table Details</span>

          <button
            className={"czi-table-details-close "+ UICommand.theme}
            onClick={() => close?.()}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="czi-table-details-section">
          <div className={"czi-row " + UICommand.theme}>
            <span>Table Width</span>
            <strong>{table.width}px</strong>
          </div>
          <div className={"czi-row " + UICommand.theme}>
            <span>Table Height</span>
            <strong>{table.height}px</strong>
          </div>
        </div>

        {cell && (
          <>
            <div className="czi-divider" />

            <div className="czi-table-details-section">
              <div className={"czi-row " + UICommand.theme}>
                <span>Cell Width</span>
                <strong>{cell.width}px</strong>
              </div>
              <div className={"czi-row " + UICommand.theme}>
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
