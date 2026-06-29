import { Node } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { TableView } from 'prosemirror-tables';
import { createPopUp } from '@modusoperandi/licit-ui-commands';
import TableContextMenu from './TableContextMenu.js';
import toCSSLength from './toCSSLength.js';

const TITLE_STYLE_NAMES = new Set(['chFigureTitle', 'chTableTitle']);

// A custom table view that renders the margin-left style.
export default class TableNodeView extends TableView {
  _menu = null;
  _menuButton = null;
  _menuId = `czi-table-context-menu-${String(Math.random()).slice(2)}`;
  _tablePos = null;
  _view = null;

  constructor(
    node: Node,
    colMinWidth: number,
    view: EditorView
  ) {
    super(node, colMinWidth, view);
    this._view = view;
    this._wrapTableView();
    this._createMenuButton();
    this._updateAttrs(node);
  }

  update(node: Node): boolean {
    const updated = super.update(node);
    if (updated) {
      this._updateAttrs(node);
    }
    return updated;
  }

  ignoreMutation(record: MutationRecord): boolean {
    const target = record.target;
    if (
      target instanceof window.Node &&
      this._menuButton?.contains(target)
    ) {
      return true;
    }
    return super.ignoreMutation(record);
  }

  _updateAttrs(node: Node): void {
    // Handle marginLeft
    const marginLeft = node.attrs?.marginLeft || 0;
    this.table.style.marginLeft = marginLeft ? `${marginLeft}px` : '';
    this.table.style.height = toCSSLength(node.attrs?.tableheight);

    const wrapper = this.table?.parentElement;
    if (wrapper && this.table) {
      const computedStyle = globalThis.getComputedStyle(this.table);
      const borderWidth = (Number.parseFloat(computedStyle.borderLeftWidth) || 0) + (Number.parseFloat(computedStyle.borderRightWidth) || 0);
      const availableWidth = Math.max(0, wrapper.getBoundingClientRect().width - borderWidth);
      if (availableWidth > 0) {
        const currentWidth = Number.parseFloat(this.table.style.width);
        if (!Number.isNaN(currentWidth) && currentWidth > availableWidth) {
          this.table.style.width = `${Math.max(0, availableWidth)}px`;
        }
      }
    }

    const noOfColumns = node.attrs?.noOfColumns;
    if (typeof noOfColumns === 'number' && noOfColumns > 0) {
      this.table.setAttribute('data-no-of-columns', String(noOfColumns));
    } else {
      this.table.removeAttribute('data-no-of-columns');
    }

    // Handle vignette
    if (node.attrs?.vignette) {
      this.table.style.border = 'none';
    }

    // Handle dirty -> sets a data attribute for DOM/state sync
    if (node.attrs?.dirty) {
      this.table.setAttribute('dirty', 'true');
    } else {
      this.table.removeAttribute('dirty');
    }
    if (node.attrs?.coverPage) {
      this.table.setAttribute('data-cover-page', 'true');
    } else {
      this.table.removeAttribute('data-cover-page');
    }
  }

  stopEvent(event: Event): boolean {
    const target = event.target;
    return !!(
      target instanceof window.Node && this._menuButton?.contains(target)
    );
  }

  destroy(): void {
    this._closeMenu();
    this._removeOutsideClickHandler();
    this._menuButton?.removeEventListener(
      'pointerdown',
      this._stopMenuButtonEvent,
      true
    );
    this._menuButton?.removeEventListener(
      'mousedown',
      this._stopMenuButtonEvent,
      true
    );
    this._menuButton?.removeEventListener(
      'mouseup',
      this._stopMenuButtonEvent,
      true
    );
    this._menuButton?.removeEventListener('click', this._onMenuClick, true);
  }

  _wrapTableView(): void {
    const tableWrapper = this.dom;
    const tableControl = document.createElement('div');
    tableControl.className = 'czi-table-control';
    tableControl.appendChild(tableWrapper);
    this.dom = tableControl;
  }

  _createMenuButton(): void {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'czi-table-hover-menu';
    button.contentEditable = 'false';
    button.title = 'Table menu';
    button.setAttribute('aria-label', 'Table menu');

    const icon = document.createElement('span');
    icon.className = 'czi-icon menu';
    icon.textContent = 'menu';
    button.appendChild(icon);

    button.addEventListener('mousedown', this._stopMenuButtonEvent, true);
    button.addEventListener('pointerdown', this._stopMenuButtonEvent, true);
    button.addEventListener('mouseup', this._stopMenuButtonEvent, true);
    button.addEventListener('click', this._onMenuClick, true);
    this.dom.appendChild(button);
    this._menuButton = button;
  }

  _stopMenuButtonEvent = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  };

  _onMenuClick = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    if (this._menu) {
      this._closeMenu();
      return;
    }
    const tableDom = this.table;

    if (!tableDom) {
      return;
    }

    const view = this._view;
    const button = this._menuButton;
    if (!view || !button) {
      return;
    }
    this._tablePos = view.posAtDOM(tableDom, 0) - 1;
    button.classList.add('expanded');
    this._menu = createPopUp(
      TableContextMenu,
      { onAction: this._onMenuAction },
      {
        anchor: button,
        autoDismiss: false,
        onClose: this._onMenuClose,
        popUpId: this._menuId,
      }
    );
    window.setTimeout(this._addOutsideClickHandler, 0);
  };

  _closeMenu = (): void => {
    const menu = this._menu;
    this._menu = null;
    this._removeOutsideClickHandler();
    this._menuButton?.classList.remove('expanded');
    menu?.close();
  };

  _onMenuClose = (): void => {
    this._menu = null;
    this._removeOutsideClickHandler();
    this._menuButton?.classList.remove('expanded');
  };

  _addOutsideClickHandler = (): void => {
    if (this._menu) {
      document.addEventListener('pointerdown', this._onOutsidePointerDown, true);
    }
  };

  _removeOutsideClickHandler(): void {
    document.removeEventListener(
      'pointerdown',
      this._onOutsidePointerDown,
      true
    );
  }

  _onOutsidePointerDown = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof window.Node)) {
      return;
    }

    const menuRoot = document.getElementById(this._menuId);
    if (
      this._menuButton?.contains(target) ||
      menuRoot?.contains(target)
    ) {
      return;
    }

    this._closeMenu();
  };

  _onMenuAction = (action: string): void => {
    this._closeMenu();

    if (action === 'insert-above') {
      this._insertParagraph('above');
    } else if (action === 'insert-below') {
      this._insertParagraph('below');
    } else if (action === 'delete') {
      this._deleteTable();
    }
  };

  _getTableInfo(): ?{ pos: number, node: Node } {

    const table = this._view.state.doc.nodeAt(this._tablePos);
    if (!table || table.type.spec.tableRole !== 'table') {
      return null;
    }

    return { pos: this._tablePos, node: table };
  }

  _insertParagraph(placement: 'above' | 'below'): void {
    const view = this._view;
    const tableInfo = this._getTableInfo();
    if (!view || !tableInfo) {
      return;
    }

    const paragraph = view.state.schema.nodes.paragraph;
    if (!paragraph) {
      return;
    }

    const posAfterTable = tableInfo.pos + tableInfo.node.nodeSize;
    const insertPos =
      placement === 'above'
        ? this._getTitleAdjustedPositionBefore(tableInfo.pos - 1, tableInfo.pos)
        : this._getTitleAdjustedPositionAfter(posAfterTable);
    const paragraphNode = paragraph.createAndFill();
    if (!paragraphNode) {
      return;
    }

    const tr = view.state.tr.insert(insertPos, paragraphNode);
    const selection = TextSelection.create(tr.doc, insertPos + 1);
    view.dispatch(tr.setSelection(selection).scrollIntoView());
    view.focus();
  }

  _getTitleAdjustedPositionBefore(
    resolvePos: number,
    fallbackPos: number
  ): number {
    const view = this._view;
    const docSize = view?.state.doc.content.size;
    if (
      !view ||
      typeof docSize !== 'number' ||
      resolvePos < 0 ||
      resolvePos > docSize
    ) {
      return fallbackPos;
    }

    const $pos = view.state.doc.resolve(resolvePos);
    const styleName = $pos.parent?.attrs?.styleName;
    if (!TITLE_STYLE_NAMES.has(styleName)) {
      return fallbackPos;
    }

    return resolvePos - ($pos.parentOffset + $pos.depth);
  }

  _getTitleAdjustedPositionAfter(resolvePos: number): number {
    const view = this._view;
    const docSize = view?.state.doc.content.size;
    if (
      !view ||
      typeof docSize !== 'number' ||
      resolvePos < 0 ||
      resolvePos > docSize
    ) {
      return resolvePos;
    }

    const $pos = view.state.doc.resolve(resolvePos);
    const nodeAfter = $pos.nodeAfter;
    const styleName = nodeAfter?.attrs?.styleName;
    if (!TITLE_STYLE_NAMES.has(styleName)) {
      return resolvePos;
    }

    return resolvePos + (nodeAfter?.nodeSize || 0);
  }

  _deleteTable(): void {
    const view = this._view;
    const tableInfo = this._getTableInfo();
    if (!view || !tableInfo) {
      return;
    }

    view.dispatch(
      view.state.tr
        .delete(tableInfo.pos, tableInfo.pos + tableInfo.node.nodeSize)
        .scrollIntoView()
    );
    view.focus();
  }
}
