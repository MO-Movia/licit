// @flow

import cx from 'classnames';
import * as React from 'react';

import htmlElementToRect from './htmlElementToRect.js';
import {
  clamp,
  fromHTMlElement,
  fromXY,
  isIntersected,
} from '@modusoperandi/licit-ui-commands';

export type TableGridSizeEditorValue = {
  cols: number,
  rows: number,
};

type TableGridSizeEditorState = {
  cols: number | string,
  rows: number | string,
};

const GUTTER_SIZE = 5;
const CELL_SIZE = 16;
// [FS] IRAD-1012 2020-07-14
// Fix: Limited Table Grid size from 20 to 7
const MAX_SIZE = 9;
const MAX_INPUT_SIZE = 100;

function parseDimension(value: number | string): ?number {
  const dimension = Number(value);
  return Number.isInteger(dimension) &&
    dimension >= 1 &&
    dimension <= MAX_INPUT_SIZE
    ? dimension
    : null;
}

class GridCell extends React.PureComponent<any, any> {
  render(): React.Element<any> {
    const { x, y, selected } = this.props;
    const style = {
      left: x + 'px',
      top: y + 'px',
      width: CELL_SIZE + 'px',
      height: CELL_SIZE + 'px',
    };
    const className = cx('czi-table-grid-size-editor-cell', {
      selected,
    });
    return <div className={className} style={style} />;
  }
}

class TableGridSizeEditor extends React.PureComponent<any, any> {
  _ex = 0;
  _ey = 0;
  _mx = 0;
  _my = 0;
  _rafID = 0;
  _ref = null;
  _entered = false;

  props: {
    close: (val: TableGridSizeEditorValue) => void,
  };

  state: TableGridSizeEditorState = {
    rows: 1,
    cols: 1,
  };

  componentWillUnmount(): void {
    this._stopTrackingGrid();
    this._rafID && cancelAnimationFrame(this._rafID);
  }

  render(): React.Element<any> {
    const { rows, cols } = this.state;
    const parsedRows = parseDimension(rows);
    const parsedCols = parseDimension(cols);
    const selectedRows = Math.min(MAX_SIZE, parsedRows || 0);
    const selectedCols = Math.min(MAX_SIZE, parsedCols || 0);
    let rr = Math.max(5, selectedRows);
    let cc = Math.max(5, selectedCols);
    if (rr === selectedRows) {
      rr = Math.min(MAX_SIZE, rr + 1);
    }
    if (cc === selectedCols) {
      cc = Math.min(MAX_SIZE, cc + 1);
    }
    const cells = [];
    let ii = 0;
    let y = 0;
    let w = 0;
    let h = 0;
    while (ii < rr) {
      y += GUTTER_SIZE;
      let jj = 0;
      let x = 0;
      while (jj < cc) {
        x += GUTTER_SIZE;
        const selected = ii < selectedRows && jj < selectedCols;
        cells.push(
          <GridCell
            key={`${String(ii)}-${String(jj)}`}
            selected={selected}
            x={x}
            y={y}
          />
        );
        x += CELL_SIZE;
        w = x + GUTTER_SIZE;
        jj++;
      }
      y += CELL_SIZE;
      h = y + GUTTER_SIZE;
      ii++;
    }
    const bodyStyle = { width: w + 'px', height: h + 'px' };

    return (
      <div className="czi-table-grid-size-editor" ref={this._onRef}>
        <div
          className="czi-table-grid-size-editor-body"
          onMouseDown={this._onMouseDown}
          onMouseEnter={this._onMouseEnter}
          onMouseLeave={this._onMouseLeave}
          style={bodyStyle}
        >
          {cells}
        </div>
        <div className="czi-table-grid-size-editor-footer">
          <form
            className="czi-table-grid-size-editor-form"
            onSubmit={this._onSubmit}
          >
            <label>
              Rows
              <input
                aria-label="Rows"
                max={MAX_INPUT_SIZE}
                min="1"
                onChange={this._onRowsChange}
                type="number"
                value={rows}
              />
            </label>
            <span aria-hidden="true">×</span>
            <label>
              Columns
              <input
                aria-label="Columns"
                max={MAX_INPUT_SIZE}
                min="1"
                onChange={this._onColsChange}
                type="number"
                value={cols}
              />
            </label>
            <button disabled={!parsedRows || !parsedCols} type="submit">
              Insert
            </button>
          </form>
        </div>
      </div>
    );
  }

  _onRef = (ref: any): void => {
    this._ref = ref;
  };

  _onMouseEnter = (e: MouseEvent): void => {
    const node = e.currentTarget;
    if (node instanceof HTMLElement) {
      const rect = fromHTMlElement(node);
      const mx = Math.round(e.clientX);
      const my = Math.round(e.clientY);
      this._ex = rect.x;
      this._ey = rect.y;
      this._mx = mx;
      this._my = my;
      if (!this._entered) {
        this._entered = true;
        document.addEventListener('mousemove', this._onMouseMove, true);
      }
    }
  };

  _onMouseLeave = (): void => {
    this._stopTrackingGrid();
  };

  _stopTrackingGrid = (): void => {
    if (this._entered) {
      this._entered = false;
      document.removeEventListener('mousemove', this._onMouseMove, true);
    }
  };

  _onMouseMove = (e: MouseEvent): void => {
    const el = this._ref;
    const elRect = el ? htmlElementToRect(el) : null;
    const mouseRect = fromXY(e.screenX, e.screenY, 10);

    if (elRect && mouseRect && isIntersected(elRect, mouseRect, 50)) {
      // This prevents `PopUpManager` from collapsing the editor.
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    const mx = Math.round(e.clientX);
    const my = Math.round(e.clientY);
    if (mx !== this._mx || my !== this._my) {
      this._mx = mx;
      this._my = my;
      this._rafID && cancelAnimationFrame(this._rafID);
      this._rafID = requestAnimationFrame(this._updateGridSize);
    }
  };

  _updateGridSize = (): void => {
    this._rafID = 0;
    const mx = this._mx;
    const my = this._my;
    const x = mx - this._ex;
    const y = my - this._ey;
    const rr = clamp(1, Math.ceil(y / (CELL_SIZE + GUTTER_SIZE)), MAX_SIZE);
    const cc = clamp(1, Math.ceil(x / (CELL_SIZE + GUTTER_SIZE)), MAX_SIZE);
    const rows = parseDimension(this.state.rows);
    const cols = parseDimension(this.state.cols);
    if (rows !== rr || cols !== cc) {
      this.setState({ rows: rr, cols: cc });
    }
  };

  _onMouseDown = (e: SyntheticEvent<>): void => {
    e.preventDefault();
    const { rows, cols } = this.state;
    this.props.close({
      rows: parseDimension(rows) || 1,
      cols: parseDimension(cols) || 1,
    });
  };

  _onRowsChange = (e: SyntheticInputEvent<HTMLInputElement>): void => {
    this.setState({ rows: e.currentTarget.value });
  };

  _onColsChange = (e: SyntheticInputEvent<HTMLInputElement>): void => {
    this.setState({ cols: e.currentTarget.value });
  };

  _onSubmit = (e: SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const rows = parseDimension(this.state.rows);
    const cols = parseDimension(this.state.cols);
    if (rows && cols) {
      this.props.close({ rows, cols });
    }
  };
}

export default TableGridSizeEditor;
