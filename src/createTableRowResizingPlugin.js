/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */
import { Plugin, PluginKey } from 'prosemirror-state';
const ROW_RESIZE_HANDLE_HEIGHT = 6;
const MIN_ROW_HEIGHT = 24;
const ROW_RESIZE_HANDLE_CLASSNAME = 'czi-table-row-resize-handle';
const ROW_RESIZE_HANDLE_GRIP_CLASSNAME = 'czi-table-row-resize-grip';
const ROW_RESIZE_HANDLE_VISIBLE_CLASSNAME = 'is-visible';
const ROW_RESIZE_HANDLE_DRAGGING_CLASSNAME = 'is-dragging';
function isElement(value) {
  return value instanceof Element;
}
function findRowPosition(view, cell) {
  let pos;
  try {
    pos = view.posAtDOM(cell, 0);
  } catch {
    return null;
  }
  const $pos = view.state.doc.resolve(pos);
  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    if (node.type.spec.tableRole === 'row') {
      return $pos.before(depth);
    }
  }
  return null;
}
export function findRowResizeTarget(view, event) {
  if (!isElement(event.target)) {
    return null;
  }
  const cell = event.target.closest('td, th');
  const rowElement = cell?.closest('tr');
  if (!cell || !rowElement) {
    return null;
  }
  const rowRect = rowElement.getBoundingClientRect();
  const isNearBottom =
    Math.abs(event.clientY - rowRect.bottom) <= ROW_RESIZE_HANDLE_HEIGHT;
  if (!isNearBottom) {
    return null;
  }
  const rowPos = findRowPosition(view, cell);
  if (rowPos === null) {
    return null;
  }
  return {
    rowElement,
    rowPos,
    startHeight: rowRect.height,
  };
}
function createRowResizeHandle(view) {
  const handle = document.createElement('div');
  handle.className = ROW_RESIZE_HANDLE_CLASSNAME;
  handle.setAttribute('aria-hidden', 'true');
  handle.setAttribute('contenteditable', 'false');
  handle.appendChild(document.createElement('span')).className =
    ROW_RESIZE_HANDLE_GRIP_CLASSNAME;
  // Keep the overlay in layout while hidden. `display: none` makes
  // offsetParent null, so the first hover can be positioned against a
  // different ancestor and jump when the element becomes visible.
  handle.style.display = 'block';
  handle.style.visibility = 'hidden';
  handle.style.pointerEvents = 'none';
  handle.style.position = 'absolute';
  handle.style.zIndex = '2147483647';
  // The ProseMirror root is content DOM. Appending an overlay to it makes the
  // DOM observer parse that overlay as document content. In particular, when
  // a document starts with a table, the resulting DOM repair can wrap the
  // entire document in the first table cell. Keep the resize UI as a sibling
  // of the editable root instead.
  (view.dom.parentElement ?? document.body).appendChild(handle);
  return handle;
}
function showRowResizeHandle(handle, view, target) {
  const rowRect = target.rowElement.getBoundingClientRect();
  positionRowResizeHandle(handle, view, rowRect, rowRect.bottom);
}
function showRowResizePreview(handle, view, target) {
  const rowRect = target.rowElement.getBoundingClientRect();
  const previewBottom = rowRect.bottom + target.nextHeight - target.startHeight;
  positionRowResizeHandle(handle, view, rowRect, previewBottom);
}
function positionRowResizeHandle(handle, _view, rowRect, bottom) {
  const offsetParent =
    handle.offsetParent instanceof HTMLElement
      ? handle.offsetParent
      : handle.parentElement;
  const offsetParentRect = offsetParent?.getBoundingClientRect() ?? {
    left: 0,
    top: 0,
  };
  const offsetParentScrollLeft = offsetParent?.scrollLeft || 0;
  const offsetParentScrollTop = offsetParent?.scrollTop || 0;
  const offsetParentClientLeft = offsetParent?.clientLeft || 0;
  const offsetParentClientTop = offsetParent?.clientTop || 0;
  const left =
    rowRect.left -
    offsetParentRect.left -
    offsetParentClientLeft +
    offsetParentScrollLeft;
  const top =
    bottom -
    offsetParentRect.top -
    offsetParentClientTop +
    offsetParentScrollTop -
    ROW_RESIZE_HANDLE_HEIGHT / 2;
  handle.style.left = `${Math.round(left)}px`;
  handle.style.top = `${Math.round(top)}px`;
  handle.style.width = `${Math.round(rowRect.width)}px`;
  handle.style.visibility = 'visible';
  handle.classList.add(ROW_RESIZE_HANDLE_VISIBLE_CLASSNAME);
}
function hideRowResizeHandle(handle) {
  handle.style.visibility = 'hidden';
  handle.classList.remove(
    ROW_RESIZE_HANDLE_VISIBLE_CLASSNAME,
    ROW_RESIZE_HANDLE_DRAGGING_CLASSNAME
  );
}
function setRowHeight(view, rowPos, height) {
  const rowNode = view.state.doc.nodeAt(rowPos);
  if (rowNode?.type.spec.tableRole !== 'row') {
    return;
  }
  view.dispatch(
    view.state.tr.setNodeMarkup(rowPos, undefined, {
      ...rowNode.attrs,
      rowHeight: `${height}px`,
    })
  );
}
export default function createTableRowResizingPlugin() {
  let resizeTarget = null;
  let resizeHandle = null;
  const stopResize = () => {
    globalThis.window.removeEventListener('mousemove', onMouseMove, true);
    globalThis.window.removeEventListener('mouseup', onMouseUp, true);
    if (resizeHandle) {
      hideRowResizeHandle(resizeHandle);
    }
    resizeTarget = null;
  };
  const onMouseMove = (event) => {
    if (!resizeTarget) {
      return;
    }
    event.preventDefault();
    const delta = event.clientY - resizeTarget.startY;
    const nextHeight = Math.max(
      MIN_ROW_HEIGHT,
      Math.round(resizeTarget.startHeight + delta)
    );
    resizeTarget.nextHeight = nextHeight;
    if (resizeHandle) {
      // The guide previews the model height without mutating the editable
      // table DOM. An unmanaged style mutation is observed by ProseMirror as
      // external content; for spanning/imported tables, table normalization
      // can then add cells to repair the partially reparsed table.
      showRowResizePreview(resizeHandle, resizeTarget.view, resizeTarget);
      resizeHandle.classList.add(ROW_RESIZE_HANDLE_DRAGGING_CLASSNAME);
    }
  };
  const onMouseUp = (event) => {
    if (resizeTarget) {
      event.preventDefault();
      setRowHeight(
        resizeTarget.view,
        resizeTarget.rowPos,
        resizeTarget.nextHeight
      );
    }
    stopResize();
  };
  return new Plugin({
    key: new PluginKey('TableRowResizingPlugin'),
    props: {
      handleDOMEvents: {
        mousemove(view, event) {
          if (resizeTarget) {
            return true;
          }
          const target = findRowResizeTarget(view, event);
          view.dom.style.cursor = target ? 'row-resize' : '';
          if (resizeHandle) {
            if (target) {
              showRowResizeHandle(resizeHandle, view, target);
            } else {
              hideRowResizeHandle(resizeHandle);
            }
          }
          return false;
        },
        mouseleave(view) {
          if (!resizeTarget) {
            view.dom.style.cursor = '';
            if (resizeHandle) {
              hideRowResizeHandle(resizeHandle);
            }
          }
          return false;
        },
        mousedown(view, event) {
          const target = findRowResizeTarget(view, event);
          if (!target) {
            return false;
          }
          event.preventDefault();
          event.stopPropagation();
          resizeTarget = {
            ...target,
            startY: event.clientY,
            nextHeight: Math.round(target.startHeight),
            view,
          };
          view.dom.style.cursor = 'row-resize';
          if (resizeHandle) {
            showRowResizeHandle(resizeHandle, view, resizeTarget);
            resizeHandle.classList.add(ROW_RESIZE_HANDLE_DRAGGING_CLASSNAME);
          }
          globalThis.window.addEventListener('mousemove', onMouseMove, true);
          globalThis.window.addEventListener('mouseup', onMouseUp, true);
          return true;
        },
      },
    },
    view(view) {
      resizeHandle = createRowResizeHandle(view);
      return {
        destroy() {
          view.dom.style.cursor = '';
          resizeHandle?.remove();
          resizeHandle = null;
          stopResize();
        },
      };
    },
  });
}
