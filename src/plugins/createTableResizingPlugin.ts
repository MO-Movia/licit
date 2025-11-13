/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Plugin } from 'prosemirror-state';
import { columnResizing } from 'prosemirror-tables';
import { EditorView } from 'prosemirror-view';

const TABLE_HANDLE_WIDTH = 10;
const TABLE_CELL_MINWIDTH = 25;
const TABLE_VIEW = undefined;

const columnResizingProps = {
  handleWidth: TABLE_HANDLE_WIDTH,
  cellMinWidth: TABLE_CELL_MINWIDTH,
  View: TABLE_VIEW,
};
export function lookUpTableWrapper(event: Event): HTMLElement | null {
  const target = event.target;
  if (!target || !(target as Element).closest) {
    return null;
  }
  return (target as Element).closest('.tableWrapper');
}

export function dispatchMouseEvent(type: string, clientX: number): void {
  requestAnimationFrame(() => {
    const event = new MouseEvent(type, {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX,
    });
    window.dispatchEvent(event);
  });
}

export function calculateMaxClientX(
  event: MouseEvent,
  targetTable: HTMLElement
): number {
  const { clientX } = event;
  const { left, width } = targetTable.getBoundingClientRect();
  const offsetX = clientX - left;
  const colgroup = targetTable.querySelector('colgroup');
  const colsCount = colgroup ? colgroup.querySelectorAll('col').length : 0;
  const cx = width - offsetX - colsCount * TABLE_CELL_MINWIDTH;
  return Math.round(clientX + Math.max(0, cx));
}

export default function createTableResizingPlugin(): Plugin {
  let maxClientX = 0;

  // https://github.com/ProseMirror/prosemirror-tables/blob/master/src/columnresizing.js
  const plugin = columnResizing(columnResizingProps);

  const captureMouse = (event): void => {
    if (event.clientX > maxClientX) {
      // Current mouse event will make table too wide. Stop it and
      // fires a simulated event instead.
      event.stopImmediatePropagation();
      dispatchMouseEvent(event.type, maxClientX);
    } else if (event.type === 'mouseup') {
      window.removeEventListener('mousemove', captureMouse, true);
      window.removeEventListener('mouseup', captureMouse, true);
    }
  };

  const { mousedown } = plugin.props.handleDOMEvents;

  // This is a workaround to constraint the mousemove to prevent
  // the table become too wide.
  Object.assign(plugin.props.handleDOMEvents, {
    mousedown(view: EditorView, event: MouseEvent): boolean {
      const targetTable = lookUpTableWrapper(event);
      maxClientX = targetTable
        ? calculateMaxClientX(event, targetTable)
        : Number.MAX_VALUE;
      window.addEventListener('mousemove', captureMouse, true);
      window.addEventListener('mouseup', captureMouse, true);
      mousedown.call(this, view, event);
      return false;
    },
  });

  return plugin;
}
