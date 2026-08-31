/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */
import { TextSelection } from 'prosemirror-state';
import { findParentNodeOfType } from 'prosemirror-utils';
import { createPopUp } from '@modusoperandi/licit-ui-commands';
import {
  MARK_EM,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_LETTER_SPACING,
  MARK_STRONG,
  MARK_TEXT_COLOR,
  MARK_UNDERLINE,
} from './MarkNames.js';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { TableMap } from 'prosemirror-tables';
import Color from 'color';
import TableDetails from './ui/TableDetails.js';
const CELL_LEVEL_TYPOGRAPHY_KEYS = new Set([
  'backgroundColor',
  'verticalAlign',
]);
const ABSOLUTE_CSS_UNIT_TO_PX = {
  px: 1,
  pt: 96 / 72,
  pc: 16,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  q: 96 / 101.6,
};
const DEFAULT_BORDER = {
  style: 'solid',
  width: '1px',
  color: '#555555',
};
const DEFAULT_TYPOGRAPHY = {
  fontFamily: 'inherit',
  fontSize: '14pt',
  bold: false,
  italic: false,
  underline: false,
  textColor: '#000000',
  backgroundColor: 'transparent',
  letterSpacing: '0px',
  lineHeight: 'normal',
  textAlign: 'left',
  verticalAlign: 'middle',
};
const DEFAULT_LAYOUT = {
  paddingTop: '4px',
  paddingRight: '4px',
  paddingBottom: '4px',
  paddingLeft: '4px',
  paddingLocked: true,
};
const FONT_TYPE_NAMES = [
  'Aclonica',
  'Acme',
  'Alegreya',
  'Arial',
  'Arial Black',
  'Georgia',
  'Tahoma',
  'Times New Roman',
  'Times',
  'Verdana',
  'Courier New',
];
const EDGE_ATTRS = {
  top: {
    border: 'borderTop',
    width: 'borderTopWidth',
    color: 'borderTopColor',
    style: 'borderTopStyle',
  },
  bottom: {
    border: 'borderBottom',
    width: 'borderBottomWidth',
    color: 'borderBottomColor',
    style: 'borderBottomStyle',
  },
  left: {
    border: 'borderLeft',
    width: 'borderLeftWidth',
    color: 'borderLeftColor',
    style: 'borderLeftStyle',
  },
  right: {
    border: 'borderRight',
    width: 'borderRightWidth',
    color: 'borderRightColor',
    style: 'borderRightStyle',
  },
};
const OPPOSITE_EDGE = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};
class TableDetailsCommand extends UICommand {
  constructor() {
    super(...arguments);
    this._popUp = null;
    this.execute = (state, _dispatch, view) => {
      if (!view) {
        return false;
      }
      const { selection, schema } = state;
      const tableType = this.getNodeTypeByTableRole(schema, 'table');
      const rowType = this.getNodeTypeByTableRole(schema, 'row');
      const cellTypes = this.getNodeTypesByTableRole(schema, [
        'cell',
        'header_cell',
      ]);
      const tableNode = this.getParentNodeRef(selection, tableType);
      if (!tableNode) {
        return false;
      }
      const rowNode = this.getParentNodeRef(selection, rowType);
      const cellNode = this.getParentNodeRefByTypes(selection, cellTypes);
      const selectedCells = this.getSelectedCellRefs(selection, cellNode);
      const tableDOM = this.findTableDOM(view, tableNode.start);
      if (!tableDOM) {
        return false;
      }
      const tableRect = tableDOM.getBoundingClientRect();
      const cellDOM = this.getSelectedCellDOM(view);
      const cellRect = cellDOM?.getBoundingClientRect();
      const runtime = this.getTableEditorRuntime(view);
      if (!runtime?.openTableEditorDialog) {
        return this.openLegacyDetails(view, tableRect, cellRect);
      }
      const dialogData = this.buildTableEditorDialogData(
        {
          table: tableNode,
          row: rowNode,
          cell: cellNode,
          cells: selectedCells,
        },
        tableRect,
        cellRect,
        cellDOM
      );
      runtime.openTableEditorDialog(
        dialogData,
        (result) => {
          this.applyTableEditorResult(
            view,
            {
              table: tableNode,
              row: rowNode,
              cell: cellNode,
              cells: selectedCells,
            },
            result,
            dialogData
          );
        },
        () => {
          view.focus();
        }
      );
      return true;
    };
    this.isActive = (_state) => {
      return false;
    };
    this.isEnabled = (state) => {
      const { $from } = state.selection;
      for (let depth = $from.depth; depth > 0; depth--) {
        if ($from.node(depth).type.spec.tableRole === 'table') {
          return true;
        }
      }
      return false;
    };
    this.waitForUserInput = (_state, _dispatch, _view, _event) => {
      return Promise.resolve(undefined);
    };
    this.executeWithUserInput = (_state, _dispatch, _view, _inputs) => {
      return false;
    };
    this.getTableEditorRuntime = (view) => {
      return view?.runtime ?? null;
    };
  }
  executeCustom(_state, tr, _from, _to) {
    return tr;
  }
  executeCustomStyleForTable(_state, tr) {
    return tr;
  }
  openLegacyDetails(view, tableRect, cellRect) {
    this.cancel();
    this._popUp = createPopUp(
      TableDetails,
      {
        close: () => this.cancel(),
        editorView: view,
        table: {
          width: Math.round(tableRect.width),
          height: Math.round(tableRect.height),
        },
        cell: cellRect
          ? {
              width: Math.round(cellRect.width),
              height: Math.round(cellRect.height),
            }
          : null,
      },
      {
        modal: true,
        onClose: () => {
          this._popUp = null;
          view.focus();
        },
      }
    );
    return true;
  }
  findTableDOM(view, pos) {
    const dom = view.domAtPos(pos);
    if (dom.node instanceof HTMLElement) {
      return dom.node.closest('table');
    }
    return null;
  }
  getSelectedCellDOM(view) {
    const { selection } = view.state;
    if (!(selection instanceof TextSelection)) {
      const cellSelection = selection;
      const node = cellSelection.$anchorCell
        ? view.nodeDOM(cellSelection.$anchorCell.pos)
        : null;
      return node instanceof HTMLElement ? node.closest('td, th') : null;
    }
    const { node } = view.domAtPos(selection.from);
    let element = null;
    if (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        element = node.parentElement;
      } else if (node instanceof HTMLElement) {
        element = node;
      }
    }
    if (!element) {
      return null;
    }
    return element.closest('td, th');
  }
  getNodeTypeByTableRole(schema, tableRole) {
    return this.getNodeTypesByTableRole(schema, [tableRole])[0] ?? null;
  }
  getNodeTypesByTableRole(schema, tableRoles) {
    const acceptedRoles = new Set(tableRoles);
    return Object.values(schema.nodes).filter((nodeType) =>
      acceptedRoles.has(nodeType.spec.tableRole ?? '')
    );
  }
  getParentNodeRef(selection, nodeType) {
    if (!nodeType) {
      return null;
    }
    const parentNodeRef = findParentNodeOfType(nodeType)(selection);
    if (!parentNodeRef) {
      return null;
    }
    return {
      pos: parentNodeRef.pos,
      start: parentNodeRef.start,
      node: parentNodeRef.node,
    };
  }
  getParentNodeRefByTypes(selection, nodeTypes) {
    if (!nodeTypes.length) {
      return null;
    }
    const parentNodeRef = findParentNodeOfType(nodeTypes)(selection);
    if (!parentNodeRef) {
      return null;
    }
    return {
      pos: parentNodeRef.pos,
      start: parentNodeRef.start,
      node: parentNodeRef.node,
    };
  }
  getSelectedCellRefs(selection, fallbackCell) {
    const selectedCells = [];
    const cellSelection = selection;
    cellSelection.forEachCell?.((node, pos) => {
      selectedCells.push({
        pos,
        start: pos + 1,
        node,
      });
    });
    if (!selectedCells.length && fallbackCell) {
      selectedCells.push(fallbackCell);
    }
    return selectedCells;
  }
  buildTableEditorDialogData(nodes, tableRect, cellRect, cellDOM) {
    const tableMap = TableMap.get(nodes.table.node);
    const selectedCells = nodes.cells ?? [];
    const selectedCell = nodes.cell ?? selectedCells[0] ?? null;
    const cellAttrs = selectedCell?.node.attrs ?? {};
    const computedStyle = cellDOM ? getComputedStyle(cellDOM) : null;
    const typographyResolution = this.getSelectedCellsTypography(
      selectedCells.length ? selectedCells : selectedCell ? [selectedCell] : [],
      computedStyle
    );
    return {
      table: {
        tableWidth: String(Math.round(tableRect.width)),
        tableHeight: String(Math.round(tableRect.height)),
        tableWidthPx: Math.round(tableRect.width),
        tableHeightPx: Math.round(tableRect.height),
        selectedCellWidth: cellRect
          ? String(Math.round(cellRect.width))
          : undefined,
        selectedCellHeight: cellRect
          ? String(Math.round(cellRect.height))
          : undefined,
        selectedCellWidthPx: cellRect ? Math.round(cellRect.width) : undefined,
        selectedCellHeightPx: cellRect
          ? Math.round(cellRect.height)
          : undefined,
        pageOrientation: 'portrait',
      },
      borders: this.getBorderDialogData(cellAttrs),
      typography: typographyResolution.typography,
      mixed: { typography: typographyResolution.mixed },
      layout: this.getLayoutDialogData(cellAttrs, computedStyle),
      metadata: {
        totalRows: tableMap.height,
        totalColumns: tableMap.width,
      },
      selectionMode: selectedCells.length > 1 ? 'range' : 'single',
      fontOptions: this.getFontOptions(
        typographyResolution.typography.fontFamily
      ),
    };
  }
  getBorderDialogData(attrs) {
    const top = this.getEdgeStyle(attrs, 'top');
    return {
      targetEdges: [],
      border: top,
      edgeStyles: {
        top,
        bottom: this.getEdgeStyle(attrs, 'bottom'),
        left: this.getEdgeStyle(attrs, 'left'),
        right: this.getEdgeStyle(attrs, 'right'),
      },
      applyMode: 'selection',
    };
  }
  getTypographyDialogData(attrs, computedStyle, cellNode) {
    return this.getCellTypographyResolution(attrs, computedStyle, cellNode)
      .typography;
  }
  getSelectedCellsTypography(cells, computedStyle) {
    if (!cells.length) {
      return { typography: DEFAULT_TYPOGRAPHY, mixed: {} };
    }
    // Empty structural cells do not contribute text styling. They still own
    // cell-level properties such as fill and vertical alignment, though, so a
    // blank cell with a different fill must be reported as mixed.
    const cellsWithText = cells.filter((cell) => cell.node.textContent.trim());
    const textTypographyCells = cellsWithText.length ? cellsWithText : cells;
    const allResolutions = cells.map((cell) =>
      this.getCellTypographyResolution(
        cell.node.attrs,
        // One anchor DOM style cannot represent every cell in a range. For a
        // range, rely on each node's imported attrs/content so mixed values are
        // not accidentally hidden by the anchor cell's computed style.
        cells.length === 1 ? computedStyle : null,
        cell.node
      )
    );
    const textResolutions = textTypographyCells.map((cell) => {
      const cellIndex = cells.indexOf(cell);
      return cellIndex >= 0
        ? allResolutions[cellIndex]
        : this.getCellTypographyResolution(cell.node.attrs, null, cell.node);
    });
    const typography = { ...allResolutions[0].typography };
    const mixed = { ...allResolutions[0].mixed };
    const keys = Object.keys(typography);
    for (const key of keys) {
      const resolutions = CELL_LEVEL_TYPOGRAPHY_KEYS.has(key)
        ? allResolutions
        : textResolutions;
      const firstResolution = resolutions[0];
      typography[key] = firstResolution.typography[key];
      mixed[key] = firstResolution.mixed[key];
      if (
        resolutions.some(
          (resolution) =>
            resolution.mixed[key] ||
            !this.sameTypographyValue(
              key,
              firstResolution.typography[key],
              resolution.typography[key]
            )
        )
      ) {
        mixed[key] = true;
        typography[key] = this.emptyTypographyValue(key);
      }
    }
    return { typography, mixed };
  }
  getCellTypographyResolution(attrs, computedStyle, cellNode) {
    const fontWeight =
      this.toStringValue(attrs.fontWeight) ??
      this.toStringValue(computedStyle?.fontWeight);
    const textDecoration =
      this.toStringValue(attrs.textDecoration) ??
      this.toStringValue(computedStyle?.textDecorationLine);
    const cellTypography = {
      fontFamily:
        this.normalizeFontFamily(
          this.toStringValue(attrs.fontName) ??
            this.toStringValue(computedStyle?.fontFamily)
        ) ?? DEFAULT_TYPOGRAPHY.fontFamily,
      fontSize:
        this.normalizeFontSizeForDialog(
          this.toStringValue(attrs.fontSize) ??
            this.toStringValue(computedStyle?.fontSize)
        ) ?? DEFAULT_TYPOGRAPHY.fontSize,
      bold: this.isBold(fontWeight),
      italic: this.isItalic(
        this.toStringValue(attrs.fontStyle) ??
          this.toStringValue(computedStyle?.fontStyle)
      ),
      underline: this.isUnderlined(textDecoration),
      textColor:
        this.toColorValue(attrs.textColor) ??
        this.toStringValue(computedStyle?.color) ??
        DEFAULT_TYPOGRAPHY.textColor,
      backgroundColor:
        this.normalizeTransparentColor(
          this.toColorValue(attrs.backgroundColor) ??
            this.toColorValue(attrs.background) ??
            this.toStringValue(computedStyle?.backgroundColor)
        ) ?? DEFAULT_TYPOGRAPHY.backgroundColor,
      letterSpacing:
        this.toStringValue(attrs.letterSpacing) ??
        this.toStringValue(computedStyle?.letterSpacing) ??
        DEFAULT_TYPOGRAPHY.letterSpacing,
      lineHeight:
        this.toStringValue(attrs.lineHeight) ??
        this.toStringValue(computedStyle?.lineHeight) ??
        DEFAULT_TYPOGRAPHY.lineHeight,
      textAlign: this.toTextAlign(
        this.toStringValue(attrs.textAlign) ??
          this.toStringValue(computedStyle?.textAlign)
      ),
      verticalAlign: this.toVerticalAlign(
        this.toStringValue(attrs.verticalAlign) ??
          this.toStringValue(attrs.vAlign) ??
          this.toStringValue(computedStyle?.verticalAlign)
      ),
    };
    return this.getCellContentTypography(cellNode, cellTypography);
  }
  getCellContentTypography(cellNode, fallback) {
    const typography = { ...fallback };
    const mixed = {};
    if (!cellNode) {
      return { typography, mixed };
    }
    const textNodes = [];
    const textBlocks = [];
    cellNode.descendants((node) => {
      if (node.isTextblock) {
        textBlocks.push(node);
      }
      if (node.isText && node.text?.trim()) {
        textNodes.push(node);
      }
      return true;
    });
    if (textNodes.length) {
      const stringValues = [
        {
          key: 'fontFamily',
          values: textNodes.map(
            (node) =>
              this.normalizeFontFamily(
                this.toStringValue(
                  this.getNodeMark(node, MARK_FONT_TYPE)?.attrs.name
                )
              ) ?? fallback.fontFamily
          ),
          same: (first, second) => this.sameNormalizedString(first, second),
        },
        {
          key: 'fontSize',
          values: textNodes.map(
            (node) =>
              this.normalizeFontSizeForDialog(
                this.toMarkedFontSize(
                  this.getNodeMark(node, MARK_FONT_SIZE)?.attrs.pt
                )
              ) ?? fallback.fontSize
          ),
          same: (first, second) => this.sameCssNumericValue(first, second),
        },
        {
          key: 'textColor',
          values: textNodes.map(
            (node) =>
              this.toStringValue(
                this.getNodeMark(node, MARK_TEXT_COLOR)?.attrs.color
              ) ?? fallback.textColor
          ),
          same: (first, second) => this.sameColorValue(first, second),
        },
        {
          key: 'letterSpacing',
          values: textNodes.map(
            (node) =>
              this.toStringValue(
                this.getNodeMark(node, MARK_LETTER_SPACING)?.attrs.letterSpacing
              ) ?? fallback.letterSpacing
          ),
          same: (first, second) => this.sameCssNumericValue(first, second),
        },
      ];
      for (const { key, values, same } of stringValues) {
        const value = this.getUniformStringValue(values, same);
        if (value === null) {
          mixed[key] = true;
          typography[key] = '';
        } else {
          typography[key] = value;
        }
      }
      for (const [key, markName] of [
        ['bold', MARK_STRONG],
        ['italic', MARK_EM],
        ['underline', MARK_UNDERLINE],
      ]) {
        const values = textNodes.map(
          (node) => fallback[key] || Boolean(this.getNodeMark(node, markName))
        );
        if (values.some((value) => value !== values[0])) {
          mixed[key] = true;
          typography[key] = false;
        } else {
          typography[key] = values[0] ?? fallback[key];
        }
      }
    }
    if (textBlocks.length) {
      const textAlignments = textBlocks.map((node) =>
        this.toTextAlign(
          this.toStringValue(node.attrs.align) ??
            this.toStringValue(node.attrs.textAlign) ??
            this.toStringValue(node.attrs.overriddenAlignValue),
          fallback.textAlign
        )
      );
      const lineHeights = textBlocks.map(
        (node) =>
          this.toStringValue(node.attrs.lineSpacing) ??
          this.toStringValue(node.attrs.lineHeight) ??
          this.toStringValue(node.attrs.overriddenLineSpacingValue) ??
          fallback.lineHeight
      );
      const textAlignment = this.getUniformStringValue(textAlignments);
      const lineHeight = this.getUniformStringValue(
        lineHeights,
        (first, second) => this.sameCssNumericValue(first, second)
      );
      if (textAlignment === null) {
        mixed.textAlign = true;
        typography.textAlign = '';
      } else {
        typography.textAlign = this.toTextAlign(textAlignment, '');
      }
      if (lineHeight === null) {
        mixed.lineHeight = true;
        typography.lineHeight = '';
      } else {
        typography.lineHeight = lineHeight;
      }
    }
    return { typography, mixed };
  }
  getNodeMark(node, markName) {
    return node.marks.find((mark) => mark.type.name === markName);
  }
  getUniformStringValue(
    values,
    sameValue = (first, second) => first === second
  ) {
    const first = values[0];
    if (first === undefined) {
      return null;
    }
    return values.every((value) => sameValue(first, value)) ? first : null;
  }
  sameTypographyValue(key, first, second) {
    if (key === 'fontSize' || key === 'letterSpacing' || key === 'lineHeight') {
      return this.sameCssNumericValue(String(first), String(second));
    }
    if (key === 'textColor' || key === 'backgroundColor') {
      return this.sameColorValue(String(first), String(second));
    }
    if (key === 'fontFamily') {
      return this.sameNormalizedString(String(first), String(second));
    }
    return first === second;
  }
  emptyTypographyValue(key) {
    return key === 'bold' || key === 'italic' || key === 'underline'
      ? false
      : '';
  }
  getLayoutDialogData(attrs, computedStyle) {
    return {
      paddingTop:
        this.toStringValue(attrs.paddingTop) ??
        computedStyle?.paddingTop ??
        DEFAULT_LAYOUT.paddingTop,
      paddingRight:
        this.toStringValue(attrs.paddingRight) ??
        computedStyle?.paddingRight ??
        DEFAULT_LAYOUT.paddingRight,
      paddingBottom:
        this.toStringValue(attrs.paddingBottom) ??
        computedStyle?.paddingBottom ??
        DEFAULT_LAYOUT.paddingBottom,
      paddingLeft:
        this.toStringValue(attrs.paddingLeft) ??
        computedStyle?.paddingLeft ??
        DEFAULT_LAYOUT.paddingLeft,
      paddingLocked: DEFAULT_LAYOUT.paddingLocked,
    };
  }
  getEdgeStyle(attrs, edge) {
    const edgeAttrs = EDGE_ATTRS[edge];
    return {
      style:
        this.toBorderLineStyle(
          this.getEffectiveBorderPart(attrs, edgeAttrs, 'style')
        ) ?? DEFAULT_BORDER.style,
      width:
        this.getEffectiveBorderPart(attrs, edgeAttrs, 'width') ??
        DEFAULT_BORDER.width,
      color:
        this.getEffectiveBorderPart(attrs, edgeAttrs, 'color') ??
        DEFAULT_BORDER.color,
    };
  }
  getEffectiveBorderPart(attrs, edgeAttrs, part) {
    const direct =
      part === 'color'
        ? this.toColorValue(attrs[edgeAttrs[part]])
        : this.toStringValue(attrs[edgeAttrs[part]]);
    if (direct) {
      return direct;
    }
    const aggregateName = `border${part[0].toUpperCase()}${part.slice(1)}`;
    const aggregate =
      part === 'color'
        ? this.toColorValue(attrs[aggregateName])
        : this.toStringValue(attrs[aggregateName]);
    const sideShorthand = this.toStringValue(attrs[edgeAttrs.border]);
    if (typeof document === 'undefined') {
      return aggregate;
    }
    const probe = document.createElement('div');
    if (aggregate) {
      probe.style[aggregateName] = aggregate;
    }
    if (sideShorthand) {
      probe.style[edgeAttrs.border] = sideShorthand;
    }
    return this.toStringValue(probe.style[edgeAttrs[part]]) ?? aggregate;
  }
  toStringValue(value) {
    return typeof value === 'string' && value.trim().length ? value : null;
  }
  toColorValue(value) {
    if (typeof value === 'object' && value !== null && 'color' in value) {
      return this.toStringValue(value.color);
    }
    return this.toStringValue(value);
  }
  toStringOrNumberValue(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    return this.toStringValue(value);
  }
  toMarkedFontSize(value) {
    const fontSize = this.toStringOrNumberValue(value);
    if (!fontSize) {
      return null;
    }
    return /[a-z%]/i.test(fontSize) ? fontSize : `${fontSize}pt`;
  }
  normalizeTransparentColor(value) {
    const normalized = this.normalizeString(value);
    if (!normalized) {
      return null;
    }
    try {
      if (Color(normalized).alpha() === 0) {
        return null;
      }
    } catch {
      // Keep valid browser-specific color tokens that the color package does
      // not understand; only fully transparent values are removed here.
    }
    return value;
  }
  toBorderLineStyle(value) {
    if (
      value === 'solid' ||
      value === 'dashed' ||
      value === 'dotted' ||
      value === 'double' ||
      value === 'none'
    ) {
      return value;
    }
    return null;
  }
  toTextAlign(value, fallback = DEFAULT_TYPOGRAPHY.textAlign) {
    if (
      value === 'center' ||
      value === 'right' ||
      value === 'justify' ||
      value === 'left'
    ) {
      return value;
    }
    return fallback;
  }
  toVerticalAlign(value, fallback = DEFAULT_TYPOGRAPHY.verticalAlign) {
    if (value === 'top' || value === 'bottom' || value === 'middle') {
      return value;
    }
    return fallback;
  }
  isBold(fontWeight) {
    const normalized = fontWeight?.trim().toLowerCase();
    if (!normalized) {
      return false;
    }
    return (
      normalized === 'bold' ||
      normalized === 'bolder' ||
      Number.parseInt(normalized, 10) >= 600
    );
  }
  isItalic(fontStyle) {
    const normalized = fontStyle?.trim().toLowerCase();
    return normalized === 'italic' || normalized === 'oblique';
  }
  isUnderlined(textDecoration) {
    return textDecoration?.toLowerCase().includes('underline') ?? false;
  }
  normalizeFontFamily(value) {
    const normalized = this.normalizeString(value);
    if (!normalized) {
      return null;
    }
    const firstFamily = normalized.split(',')[0].replace(/["']/g, '').trim();
    return (
      FONT_TYPE_NAMES.find(
        (fontName) => fontName.toLowerCase() === firstFamily.toLowerCase()
      ) ?? firstFamily
    );
  }
  getFontOptions(currentFontFamily) {
    const options = [
      { label: 'Default Font', value: 'inherit' },
      ...FONT_TYPE_NAMES.map((fontName) => ({
        label: fontName,
        value: fontName,
      })),
    ];
    const current = this.normalizeFontFamily(currentFontFamily);
    if (
      current &&
      current.toLowerCase() !== 'inherit' &&
      !options.some(
        (option) => option.value.toLowerCase() === current.toLowerCase()
      )
    ) {
      options.push({ label: current, value: current });
    }
    return options;
  }
  normalizeString(value) {
    const normalized = value?.trim() ?? '';
    return normalized.length ? normalized : null;
  }
  normalizeNumber(value) {
    const normalized = this.normalizeString(value);
    if (!normalized) {
      return null;
    }
    const parsed = Number.parseInt(normalized, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  normalizeSizeAsNumber(value) {
    const normalized = this.normalizeString(value);
    if (!normalized) {
      return null;
    }
    const parsed = Number.parseFloat(normalized.replace(/px$/i, ''));
    if (Number.isNaN(parsed) || parsed <= 0) {
      return null;
    }
    return Math.round(parsed);
  }
  applyColumnWidth(tr, tableRef, cellRef, width) {
    const tableNode = tr.doc.nodeAt(tableRef.pos);
    if (!tableNode) {
      return tr;
    }
    if (tableNode.type.spec.tableRole !== 'table') {
      return tr;
    }
    const tableMap = TableMap.get(tableNode);
    const cellPosRelative = cellRef.pos - tableRef.start;
    const mapIndex = tableMap.map.indexOf(cellPosRelative);
    if (mapIndex < 0) {
      return tr;
    }
    const selectedCellRect = tableMap.findCell(cellPosRelative);
    const selectedColumnCount = selectedCellRect.right - selectedCellRect.left;
    const selectedCell = tr.doc.nodeAt(cellRef.pos);
    const selectedColumnWidths = this.distributeColumnWidth(
      width,
      selectedColumnCount,
      Array.isArray(selectedCell?.attrs.colwidth)
        ? selectedCell.attrs.colwidth
        : undefined
    );
    if (!selectedColumnWidths.length) {
      return tr;
    }
    const cellUpdates = new Map();
    for (
      let column = selectedCellRect.left;
      column < selectedCellRect.right;
      column++
    ) {
      const columnWidth = selectedColumnWidths[column - selectedCellRect.left];
      for (let row = 0; row < tableMap.height; row++) {
        const mappedCellPos = tableMap.map[row * tableMap.width + column];
        const absoluteCellPos = tableRef.start + mappedCellPos;
        let update = cellUpdates.get(absoluteCellPos);
        if (!update) {
          const currentCell = tr.doc.nodeAt(absoluteCellPos);
          if (!currentCell) {
            continue;
          }
          const colspan = Number(currentCell.attrs.colspan) || 1;
          const currentColwidth = Array.isArray(currentCell.attrs.colwidth)
            ? currentCell.attrs.colwidth
            : [];
          update = {
            cell: currentCell,
            colwidth: Array.from({ length: colspan }, (_, index) => {
              const currentWidth = currentColwidth[index];
              return typeof currentWidth === 'number' &&
                Number.isFinite(currentWidth)
                ? currentWidth
                : 0;
            }),
          };
          cellUpdates.set(absoluteCellPos, update);
        }
        const mappedCellRect = tableMap.findCell(mappedCellPos);
        const colwidthIndex = column - mappedCellRect.left;
        if (colwidthIndex >= 0 && colwidthIndex < update.colwidth.length) {
          update.colwidth[colwidthIndex] = columnWidth;
        }
      }
    }
    for (const [absoluteCellPos, update] of cellUpdates) {
      const currentColwidth = update.cell.attrs.colwidth;
      const nextColwidth = this.sameColumnWidths(
        currentColwidth,
        update.colwidth
      )
        ? currentColwidth
        : update.colwidth;
      const nextAttrs = {
        ...update.cell.attrs,
        colwidth: nextColwidth,
      };
      if (
        Object.prototype.hasOwnProperty.call(update.cell.attrs, 'cellWidth')
      ) {
        nextAttrs.cellWidth = this.getCellWidthFromColwidth(update.colwidth);
      }
      if (!this.sameAttrs(update.cell.attrs, nextAttrs)) {
        tr = tr.setNodeMarkup(absoluteCellPos, undefined, nextAttrs);
      }
    }
    return tr;
  }
  distributeColumnWidth(width, columnCount, currentColwidth) {
    if (!Number.isFinite(width) || width <= 0 || columnCount <= 0) {
      return [];
    }
    const totalWidth = Math.round(width);
    if (totalWidth <= 0) {
      return [];
    }
    const hasValidCurrentWidths =
      currentColwidth?.length === columnCount &&
      currentColwidth.every(
        (currentWidth) =>
          typeof currentWidth === 'number' &&
          Number.isFinite(currentWidth) &&
          currentWidth > 0
      );
    const weights = hasValidCurrentWidths
      ? currentColwidth.slice()
      : Array.from({ length: columnCount }, () => 1);
    const currentTotal = weights.reduce((sum, currentWidth) => {
      return sum + currentWidth;
    }, 0);
    if (hasValidCurrentWidths && this.nearlyEqual(totalWidth, currentTotal)) {
      return weights;
    }
    const exactWidths = weights.map((currentWidth) => {
      return (currentWidth / currentTotal) * totalWidth;
    });
    const distributedWidths = exactWidths.map(Math.floor);
    const distributedTotal = distributedWidths.reduce((sum, currentWidth) => {
      return sum + currentWidth;
    }, 0);
    const remainder = totalWidth - distributedTotal;
    const remainderOrder = exactWidths
      .map((exactWidth, index) => ({
        index,
        fraction: exactWidth - distributedWidths[index],
      }))
      .sort((first, second) => {
        return second.fraction - first.fraction || first.index - second.index;
      });
    for (let index = 0; index < remainder; index++) {
      distributedWidths[remainderOrder[index].index]++;
    }
    return distributedWidths;
  }
  sameColumnWidths(first, second) {
    return (
      Array.isArray(first) &&
      first.length === second.length &&
      first.every((width, index) => width === second[index])
    );
  }
  getCellWidthFromColwidth(colwidth) {
    if (!colwidth.length || colwidth.some((width) => width <= 0)) {
      return null;
    }
    const totalWidth = colwidth.reduce((sum, width) => sum + width, 0);
    return `${this.formatCssNumber(totalWidth)}px`;
  }
  applyAttributeInputs(view, nodes, inputs) {
    let tr = view.state.tr;
    const tableHeight = this.normalizeString(inputs.tableHeight);
    tr = tr.setNodeMarkup(nodes.table.pos, undefined, {
      ...nodes.table.node.attrs,
      noOfColumns: this.normalizeNumber(inputs.noOfColumns),
      tableHeight,
      tableheight: tableHeight,
    });
    if (nodes.row) {
      tr = tr.setNodeMarkup(nodes.row.pos, undefined, {
        ...nodes.row.node.attrs,
        rowHeight: this.normalizeString(inputs.rowHeight),
        rowWidth: this.normalizeString(inputs.rowWidth),
      });
    }
    if (nodes.cell) {
      const cellWidth = this.normalizeSizeAsNumber(inputs.cellWidth);
      if (cellWidth) {
        tr = this.applyColumnWidth(tr, nodes.table, nodes.cell, cellWidth);
      }
      const currentCell = tr.doc.nodeAt(nodes.cell.pos) || nodes.cell.node;
      tr = tr.setNodeMarkup(nodes.cell.pos, undefined, {
        ...currentCell.attrs,
        cellWidth: cellWidth
          ? currentCell.attrs.cellWidth
          : this.normalizeString(inputs.cellWidth),
        cellStyle: this.normalizeString(inputs.cellStyle),
        fontSize: this.normalizeString(inputs.fontSize),
        letterSpacing: this.normalizeString(inputs.letterSpacing),
        marginTop: this.normalizeString(inputs.marginTop),
        marginBottom: this.normalizeString(inputs.MarginBottom),
        MarginBottom: this.normalizeString(inputs.MarginBottom),
      });
    }
    view.dispatch(tr);
    view.focus();
  }
  applyTableEditorResult(view, nodes, result, initialData) {
    const selectedCells = this.getTargetCells(nodes, result.borders.applyMode);
    if (!selectedCells.length) {
      view.focus();
      return;
    }
    const changes = this.getApplyChanges(result, initialData);
    let tr = view.state.tr;
    tr = this.applyTableEditorTableAttrs(
      tr,
      nodes,
      selectedCells,
      result,
      changes
    );
    for (const cellRef of selectedCells) {
      tr = this.applyCellEditorAttrs(tr, cellRef, result, changes);
      tr = this.applyCellParagraphOverrides(tr, cellRef, result, changes);
      tr = this.applyCellInlineOverrides(
        tr,
        cellRef,
        result,
        view.state.schema,
        changes
      );
    }
    tr = this.applyBorderConfig(tr, nodes.table, selectedCells, result.borders);
    view.dispatch(tr);
    view.focus();
  }
  getTargetCells(nodes, applyMode) {
    if (applyMode === 'cell' && nodes.cell) {
      return [nodes.cell];
    }
    if (nodes.cells?.length) {
      return nodes.cells;
    }
    if (nodes.cell) {
      return [nodes.cell];
    }
    return [];
  }
  getApplyChanges(result, initialData) {
    const changedTypography = result.changed?.typography;
    const changedLayout = result.changed?.layout;
    const changedTable = result.changed?.table;
    if (result.changed) {
      return {
        fontFamily: Boolean(changedTypography?.fontFamily),
        fontSize: Boolean(changedTypography?.fontSize),
        bold: Boolean(changedTypography?.bold),
        italic: Boolean(changedTypography?.italic),
        underline: Boolean(changedTypography?.underline),
        textColor: Boolean(changedTypography?.textColor),
        backgroundColor: Boolean(changedTypography?.backgroundColor),
        letterSpacing: Boolean(changedTypography?.letterSpacing),
        lineHeight: Boolean(changedTypography?.lineHeight),
        textAlign: Boolean(changedTypography?.textAlign),
        verticalAlign: Boolean(changedTypography?.verticalAlign),
        paddingTop: Boolean(changedLayout?.paddingTop),
        paddingRight: Boolean(changedLayout?.paddingRight),
        paddingBottom: Boolean(changedLayout?.paddingBottom),
        paddingLeft: Boolean(changedLayout?.paddingLeft),
        paddingLocked: Boolean(changedLayout?.paddingLocked),
        tableHeight: Boolean(changedTable?.tableHeight),
        selectedCellWidth: Boolean(changedTable?.selectedCellWidth),
        selectedCellHeight: Boolean(changedTable?.selectedCellHeight),
      };
    }
    const initialTypography = initialData?.typography;
    const initialLayout = initialData?.layout;
    const initialTable = initialData?.table;
    return {
      fontFamily: initialTypography
        ? !this.sameNormalizedString(
            this.normalizeInheritedValue(result.typography.fontFamily),
            this.normalizeInheritedValue(initialTypography.fontFamily)
          )
        : true,
      fontSize: initialTypography
        ? !this.sameCssNumericValue(
            result.typography.fontSize,
            initialTypography.fontSize
          )
        : true,
      bold: initialTypography
        ? result.typography.bold !== initialTypography.bold
        : true,
      italic: initialTypography
        ? result.typography.italic !== initialTypography.italic
        : true,
      underline: initialTypography
        ? result.typography.underline !== initialTypography.underline
        : true,
      textColor: initialTypography
        ? !this.sameColorValue(
            result.typography.textColor,
            initialTypography.textColor
          )
        : true,
      backgroundColor: initialTypography
        ? !this.sameColorValue(
            this.normalizeTransparentResult(result.typography.backgroundColor),
            this.normalizeTransparentResult(initialTypography.backgroundColor)
          )
        : true,
      letterSpacing: initialTypography
        ? !this.sameCssNumericValue(
            result.typography.letterSpacing,
            initialTypography.letterSpacing
          )
        : true,
      lineHeight: initialTypography
        ? !this.sameCssNumericValue(
            result.typography.lineHeight,
            initialTypography.lineHeight
          )
        : true,
      textAlign: initialTypography
        ? !this.sameNormalizedString(
            result.typography.textAlign,
            initialTypography.textAlign
          )
        : true,
      verticalAlign: initialTypography
        ? !this.sameNormalizedString(
            result.typography.verticalAlign,
            initialTypography.verticalAlign
          )
        : true,
      paddingTop: initialLayout
        ? !this.samePixelDimensionValue(
            result.layout.paddingTop,
            initialLayout.paddingTop
          )
        : true,
      paddingRight: initialLayout
        ? !this.samePixelDimensionValue(
            result.layout.paddingRight,
            initialLayout.paddingRight
          )
        : true,
      paddingBottom: initialLayout
        ? !this.samePixelDimensionValue(
            result.layout.paddingBottom,
            initialLayout.paddingBottom
          )
        : true,
      paddingLeft: initialLayout
        ? !this.samePixelDimensionValue(
            result.layout.paddingLeft,
            initialLayout.paddingLeft
          )
        : true,
      paddingLocked: initialLayout
        ? result.layout.paddingLocked !== initialLayout.paddingLocked
        : true,
      tableHeight: initialTable
        ? !this.samePixelDimensionValue(
            result.table.tableHeight,
            initialTable.tableHeight
          )
        : true,
      selectedCellWidth: initialTable
        ? !this.samePixelDimensionValue(
            result.table.selectedCellWidth,
            initialTable.selectedCellWidth
          )
        : true,
      selectedCellHeight: initialTable
        ? !this.samePixelDimensionValue(
            result.table.selectedCellHeight,
            initialTable.selectedCellHeight
          )
        : true,
    };
  }
  sameNormalizedString(first, second) {
    return this.normalizeString(first) === this.normalizeString(second);
  }
  sameColorValue(first, second) {
    return this.normalizeColorValue(first) === this.normalizeColorValue(second);
  }
  normalizeColorValue(value) {
    const normalized = this.normalizeString(value)?.toLowerCase();
    if (!normalized) {
      return null;
    }
    try {
      const color = Color(normalized);
      if (color.alpha() === 0) {
        return 'transparent';
      }
      if (color.alpha() === 1) {
        return String(color.hex()).toLowerCase();
      }
      return String(color.rgb().string()).toLowerCase();
    } catch {
      // Preserve browser-specific tokens such as currentColor so change
      // detection remains stable even when they are not parseable here.
      return normalized;
    }
  }
  sameCssNumericValue(first, second) {
    const firstValue = this.parseCssNumericValue(first);
    const secondValue = this.parseCssNumericValue(second);
    if (firstValue === null || secondValue === null) {
      return this.normalizeString(first) === this.normalizeString(second);
    }
    if (firstValue.value === 0 && secondValue.value === 0) {
      return true;
    }
    const firstAbsoluteFactor = ABSOLUTE_CSS_UNIT_TO_PX[firstValue.unit];
    const secondAbsoluteFactor = ABSOLUTE_CSS_UNIT_TO_PX[secondValue.unit];
    if (
      firstAbsoluteFactor !== undefined &&
      secondAbsoluteFactor !== undefined
    ) {
      return this.nearlyEqual(
        firstValue.value * firstAbsoluteFactor,
        secondValue.value * secondAbsoluteFactor
      );
    }
    return (
      firstValue.unit === secondValue.unit &&
      this.nearlyEqual(firstValue.value, secondValue.value)
    );
  }
  samePixelDimensionValue(first, second) {
    const firstPixels = this.normalizeCssNumericValue(first);
    const secondPixels = this.normalizeCssNumericValue(second);
    return firstPixels === null || secondPixels === null
      ? this.sameNormalizedString(first, second)
      : this.nearlyEqual(firstPixels, secondPixels);
  }
  sameAttrs(first, second) {
    const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
    for (const key of keys) {
      if (first[key] !== second[key]) {
        return false;
      }
    }
    return true;
  }
  normalizeCssNumericValue(value) {
    const parsed = this.parseCssNumericValue(value);
    if (!parsed) {
      return null;
    }
    const absoluteFactor = ABSOLUTE_CSS_UNIT_TO_PX[parsed.unit];
    if (absoluteFactor !== undefined) {
      return parsed.value * absoluteFactor;
    }
    return parsed.unit === '' ? parsed.value : null;
  }
  parseCssNumericValue(value) {
    const normalized = this.normalizeString(value);
    if (!normalized) {
      return null;
    }
    const match = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*([a-z%]*)$/i.exec(
      normalized
    );
    if (!match?.[1]) {
      return null;
    }
    const parsed = Number.parseFloat(match[1]);
    return Number.isFinite(parsed)
      ? { value: parsed, unit: (match[2] ?? '').toLowerCase() }
      : null;
  }
  nearlyEqual(first, second) {
    return Math.abs(first - second) <= 0.0001;
  }
  toOptionalCssValue(enabled, value) {
    return enabled ? value : null;
  }
  applyTableEditorTableAttrs(tr, nodes, selectedCells, result, changes) {
    const currentTable = tr.doc.nodeAt(nodes.table.pos) ?? nodes.table.node;
    if (changes.tableHeight) {
      const tableHeight = this.normalizeString(result.table.tableHeight);
      tr = tr.setNodeMarkup(nodes.table.pos, undefined, {
        ...currentTable.attrs,
        tableHeight,
        tableheight: tableHeight,
      });
    }
    const cellWidth = this.normalizeSizeAsNumber(
      result.table.selectedCellWidth ?? ''
    );
    if (changes.selectedCellWidth && cellWidth) {
      for (const cellRef of selectedCells) {
        tr = this.applyColumnWidth(tr, nodes.table, cellRef, cellWidth);
      }
    }
    const rowHeight = this.normalizeString(
      result.table.selectedCellHeight ?? ''
    );
    if (changes.selectedCellHeight && rowHeight) {
      if (nodes.row) {
        const currentRow = tr.doc.nodeAt(nodes.row.pos) ?? nodes.row.node;
        tr = tr.setNodeMarkup(nodes.row.pos, undefined, {
          ...currentRow.attrs,
          rowHeight,
        });
      }
      tr = this.applySelectedRowHeights(
        tr,
        nodes.table,
        selectedCells,
        rowHeight
      );
    }
    return tr;
  }
  applySelectedRowHeights(tr, tableRef, selectedCells, rowHeight) {
    const tableNode = tr.doc.nodeAt(tableRef.pos);
    if (tableNode?.type.spec.tableRole !== 'table') {
      return tr;
    }
    const selectedCellPositions = selectedCells.map((cellRef) => cellRef.pos);
    tableNode.forEach((rowNode, offset) => {
      const rowStart = tableRef.start + offset;
      const rowEnd = rowStart + rowNode.nodeSize;
      const hasSelectedCell = selectedCellPositions.some(
        (cellPos) => cellPos > rowStart && cellPos < rowEnd
      );
      if (!hasSelectedCell) {
        return;
      }
      tr = tr.setNodeMarkup(tableRef.start + offset, undefined, {
        ...rowNode.attrs,
        rowHeight,
      });
    });
    return tr;
  }
  applyCellEditorAttrs(tr, cellRef, result, changes) {
    const currentCell = tr.doc.nodeAt(cellRef.pos) ?? cellRef.node;
    const nextAttrs = { ...currentCell.attrs };
    this.applyChangedCellTypographyAttrs(nextAttrs, result, changes);
    this.applyChangedCellLayoutAttrs(nextAttrs, result, changes);
    return this.sameAttrs(currentCell.attrs, nextAttrs)
      ? tr
      : tr.setNodeMarkup(cellRef.pos, undefined, nextAttrs);
  }
  applyChangedCellTypographyAttrs(nextAttrs, result, changes) {
    if (changes.fontFamily) {
      const fontName = this.normalizeInheritedValue(
        result.typography.fontFamily
      );
      nextAttrs.fontName = fontName;
      nextAttrs.fontNameOverridden = Boolean(fontName);
    }
    if (changes.fontSize) {
      const fontSize = this.normalizeString(result.typography.fontSize);
      nextAttrs.fontSize = fontSize;
      nextAttrs.fontSizeOverridden = Boolean(fontSize);
    }
    if (changes.bold) {
      nextAttrs.fontWeight = result.typography.bold ? 'bold' : 'normal';
      nextAttrs.fontWeightOverridden = true;
    }
    if (changes.italic) {
      nextAttrs.fontStyle = result.typography.italic ? 'italic' : 'normal';
      nextAttrs.fontStyleOverridden = true;
    }
    if (changes.underline) {
      nextAttrs.textDecoration = result.typography.underline
        ? 'underline'
        : 'none';
      nextAttrs.textDecorationOverridden = true;
    }
    if (changes.textColor) {
      const textColor = this.normalizeString(result.typography.textColor);
      nextAttrs.textColor = textColor;
      nextAttrs.textColorOverridden = Boolean(textColor);
    }
    if (changes.backgroundColor) {
      const backgroundColor = this.normalizeTransparentResult(
        result.typography.backgroundColor
      );
      nextAttrs.backgroundColor = backgroundColor;
      nextAttrs.background = backgroundColor;
      nextAttrs.backgroundColorOverridden = Boolean(backgroundColor);
    }
    if (changes.letterSpacing) {
      const letterSpacing = this.normalizeString(
        result.typography.letterSpacing
      );
      nextAttrs.letterSpacing = letterSpacing;
      nextAttrs.letterSpacingOverridden = Boolean(letterSpacing);
    }
    if (changes.lineHeight) {
      const lineHeight = this.normalizeString(result.typography.lineHeight);
      nextAttrs.lineHeight = lineHeight;
      nextAttrs.lineHeightOverridden = Boolean(lineHeight);
    }
    if (changes.textAlign) {
      const textAlign = this.normalizeString(result.typography.textAlign);
      nextAttrs.textAlign = textAlign;
      nextAttrs.textAlignOverridden = Boolean(textAlign);
    }
    if (changes.verticalAlign) {
      const verticalAlign = this.normalizeString(
        result.typography.verticalAlign
      );
      nextAttrs.verticalAlign = verticalAlign;
      nextAttrs.vAlign = verticalAlign;
      nextAttrs.verticalAlignOverridden = Boolean(verticalAlign);
    }
  }
  applyChangedCellLayoutAttrs(nextAttrs, result, changes) {
    if (changes.paddingTop) {
      nextAttrs.paddingTop = this.normalizeString(result.layout.paddingTop);
    }
    if (changes.paddingRight) {
      nextAttrs.paddingRight = this.normalizeString(result.layout.paddingRight);
    }
    if (changes.paddingBottom) {
      nextAttrs.paddingBottom = this.normalizeString(
        result.layout.paddingBottom
      );
    }
    if (changes.paddingLeft) {
      nextAttrs.paddingLeft = this.normalizeString(result.layout.paddingLeft);
    }
  }
  applyCellParagraphOverrides(tr, cellRef, result, changes) {
    const currentCell = tr.doc.nodeAt(cellRef.pos);
    if (!currentCell) {
      return tr;
    }
    currentCell.descendants((node, pos) => {
      if (node.type.name !== 'paragraph') {
        return true;
      }
      const attrs = { ...node.attrs };
      let changed = false;
      const textAlign = this.normalizeString(result.typography.textAlign);
      const lineSpacing = this.normalizeLineSpacingValue(
        result.typography.lineHeight
      );
      if (
        changes.textAlign &&
        Object.prototype.hasOwnProperty.call(attrs, 'align')
      ) {
        attrs.align = textAlign;
        attrs.overriddenAlign = Boolean(textAlign);
        attrs.overriddenAlignValue = textAlign;
        changed = true;
      }
      if (
        changes.lineHeight &&
        Object.prototype.hasOwnProperty.call(attrs, 'lineSpacing')
      ) {
        attrs.lineSpacing = lineSpacing;
        attrs.overriddenLineSpacing = Boolean(lineSpacing);
        attrs.overriddenLineSpacingValue = lineSpacing;
        changed = true;
      }
      if (changed && !this.sameAttrs(node.attrs, attrs)) {
        tr = tr.setNodeMarkup(cellRef.start + pos, undefined, attrs);
      }
      return false;
    });
    return tr;
  }
  applyCellInlineOverrides(tr, cellRef, result, schema, changes) {
    const currentCell = tr.doc.nodeAt(cellRef.pos);
    if (!currentCell) {
      return tr;
    }
    const markUpdates = this.getInlineMarkUpdates(result, schema, changes);
    if (!markUpdates.length) {
      return tr;
    }
    currentCell.descendants((node, pos) => {
      if (!node.isText) {
        return true;
      }
      const from = cellRef.start + pos;
      const to = from + node.nodeSize;
      for (const update of markUpdates) {
        tr = tr.removeMark(from, to, update.markType);
        if (update.attrs) {
          tr = tr.addMark(from, to, update.markType.create(update.attrs));
        }
      }
      return false;
    });
    return tr;
  }
  getInlineMarkUpdates(result, schema, changes) {
    const updates = [];
    if (changes.fontSize) {
      this.addMarkUpdate(updates, schema, MARK_FONT_SIZE, {
        pt: this.normalizeFontPointSize(result.typography.fontSize),
        overridden: true,
      });
    }
    if (changes.fontFamily) {
      this.addMarkUpdate(updates, schema, MARK_FONT_TYPE, {
        name: this.normalizeInheritedValue(result.typography.fontFamily),
        overridden: true,
      });
    }
    if (changes.textColor) {
      this.addMarkUpdate(updates, schema, MARK_TEXT_COLOR, {
        color: this.normalizeString(result.typography.textColor),
        overridden: true,
      });
    }
    if (changes.letterSpacing) {
      this.addMarkUpdate(updates, schema, MARK_LETTER_SPACING, {
        letterSpacing: this.normalizeString(result.typography.letterSpacing),
        overridden: true,
      });
    }
    if (changes.bold) {
      this.addMarkUpdate(
        updates,
        schema,
        MARK_STRONG,
        result.typography.bold ? { overridden: true } : null
      );
    }
    if (changes.italic) {
      this.addMarkUpdate(
        updates,
        schema,
        MARK_EM,
        result.typography.italic ? { overridden: true } : null
      );
    }
    if (changes.underline) {
      this.addMarkUpdate(
        updates,
        schema,
        MARK_UNDERLINE,
        result.typography.underline ? { overridden: true } : null
      );
    }
    return updates;
  }
  addMarkUpdate(updates, schema, markName, attrs) {
    const markType = schema.marks[markName];
    if (!markType) {
      return;
    }
    if (!attrs) {
      updates.push({ markType, attrs: null });
      return;
    }
    const styleEntries = Object.entries(attrs).filter(
      ([key]) => key !== 'overridden'
    );
    const hasValue =
      styleEntries.length === 0 ||
      styleEntries.some(
        ([key, value]) => key !== 'overridden' && value !== null
      );
    updates.push({ markType, attrs: hasValue ? attrs : null });
  }
  applyBorderConfig(tr, tableRef, selectedCells, borders) {
    if (!borders.targetEdges.length) {
      return tr;
    }
    const tableNode = tr.doc.nodeAt(tableRef.pos);
    if (tableNode?.type.spec.tableRole !== 'table') {
      return tr;
    }
    const tableMap = TableMap.get(tableNode);
    const selectionRect = this.getSelectionRect(
      tableMap,
      tableRef,
      selectedCells
    );
    if (!selectionRect) {
      return tr;
    }
    const pending = new Map();
    const updateCell = (pos, edges, fallbackNode = null) => {
      const existing = pending.get(pos);
      const current = existing?.node ?? tr.doc.nodeAt(pos) ?? fallbackNode;
      const role = current?.type.spec.tableRole;
      if (!current || (role !== 'cell' && role !== 'header_cell')) {
        return;
      }
      const currentAttrs = existing?.attrs ?? current.attrs;
      pending.set(pos, {
        node: current,
        attrs: {
          ...currentAttrs,
          ...this.assignBorderAttrs(edges, borders.border),
        },
      });
    };
    for (const cellRef of selectedCells) {
      const cellRect = this.getSelectionRect(tableMap, tableRef, [cellRef]);
      if (!cellRect) {
        continue;
      }
      const edges = this.getPhysicalBorderEdges(
        borders.targetEdges,
        selectionRect,
        cellRect
      );
      if (!edges.length) {
        continue;
      }
      updateCell(cellRef.pos, edges, cellRef.node);
      for (const edge of edges) {
        const opposite = OPPOSITE_EDGE[edge];
        for (const adjacentPos of this.getAdjacentCellPositionsForEdge(
          tableMap,
          tableRef,
          cellRect,
          edge
        )) {
          updateCell(adjacentPos, [opposite]);
        }
      }
    }
    for (const [pos, update] of pending) {
      tr = tr.setNodeMarkup(pos, undefined, update.attrs);
    }
    return tr;
  }
  getAdjacentCellPositionsForEdge(tableMap, tableRef, cellRect, edge) {
    const adjacent = new Set();
    const add = (row, column) => {
      if (
        row >= 0 &&
        row < tableMap.height &&
        column >= 0 &&
        column < tableMap.width
      ) {
        adjacent.add(
          tableRef.start + tableMap.map[row * tableMap.width + column]
        );
      }
    };
    if (edge === 'top' || edge === 'bottom') {
      const row = edge === 'top' ? cellRect.top - 1 : cellRect.bottom;
      for (let column = cellRect.left; column < cellRect.right; column++) {
        add(row, column);
      }
    } else {
      const column = edge === 'left' ? cellRect.left - 1 : cellRect.right;
      for (let row = cellRect.top; row < cellRect.bottom; row++) {
        add(row, column);
      }
    }
    return [...adjacent];
  }
  getSelectionRect(tableMap, tableRef, selectedCells) {
    let rect = null;
    for (const cellRef of selectedCells) {
      const cellPos = cellRef.pos - tableRef.start;
      for (let index = 0; index < tableMap.map.length; index++) {
        if (tableMap.map[index] !== cellPos) {
          continue;
        }
        const col = index % tableMap.width;
        const row = Math.floor(index / tableMap.width);
        rect = rect
          ? {
              left: Math.min(rect.left, col),
              right: Math.max(rect.right, col + 1),
              top: Math.min(rect.top, row),
              bottom: Math.max(rect.bottom, row + 1),
            }
          : {
              left: col,
              right: col + 1,
              top: row,
              bottom: row + 1,
            };
      }
    }
    return rect;
  }
  getPhysicalBorderEdges(targetEdges, selectionRect, cellRect) {
    const edges = [];
    if (targetEdges.includes('top') && cellRect.top === selectionRect.top) {
      edges.push('top');
    }
    if (
      targetEdges.includes('bottom') &&
      cellRect.bottom === selectionRect.bottom
    ) {
      edges.push('bottom');
    }
    if (targetEdges.includes('left') && cellRect.left === selectionRect.left) {
      edges.push('left');
    }
    if (
      targetEdges.includes('right') &&
      cellRect.right === selectionRect.right
    ) {
      edges.push('right');
    }
    if (
      targetEdges.includes('insideHorizontal') &&
      cellRect.bottom < selectionRect.bottom
    ) {
      edges.push('bottom');
    }
    if (
      targetEdges.includes('insideVertical') &&
      cellRect.right < selectionRect.right
    ) {
      edges.push('right');
    }
    return edges;
  }
  assignBorderAttrs(edges, border) {
    const attrs = {};
    for (const edge of edges) {
      const edgeAttrs = EDGE_ATTRS[edge];
      attrs[edgeAttrs.border] =
        border.style === 'none'
          ? 'none'
          : `${border.width} ${border.style} ${border.color}`;
      attrs[edgeAttrs.width] = border.width;
      attrs[edgeAttrs.color] = border.color;
      attrs[edgeAttrs.style] = border.style;
    }
    return attrs;
  }
  normalizeInheritedValue(value) {
    const normalized = this.normalizeString(value);
    if (!normalized || normalized.toLowerCase() === 'inherit') {
      return null;
    }
    return normalized;
  }
  normalizeFontPointSize(value) {
    const parsed = this.parseCssNumericValue(value);
    if (!parsed || parsed.value <= 0) {
      return null;
    }
    if (parsed.unit === '' || parsed.unit === 'pt') {
      return parsed.value;
    }
    const absoluteFactor = ABSOLUTE_CSS_UNIT_TO_PX[parsed.unit];
    return absoluteFactor === undefined
      ? null
      : parsed.value * absoluteFactor * (72 / 96);
  }
  normalizeFontSizeForDialog(value) {
    const pointSize = this.normalizeFontPointSize(value);
    if (pointSize === null) {
      return this.normalizeString(value);
    }
    return `${this.formatCssNumber(pointSize)}pt`;
  }
  formatCssNumber(value) {
    return String(Number(value.toFixed(4)));
  }
  normalizeLineSpacingValue(value) {
    const normalized = this.normalizeString(value);
    if (!normalized || normalized.toLowerCase() === 'normal') {
      return null;
    }
    return normalized;
  }
  normalizeTransparentResult(value) {
    const normalized = this.normalizeString(value);
    return normalized || null;
  }
  cancel() {
    const popUp = this._popUp;
    this._popUp = null;
    popUp?.close(undefined);
  }
}
export default TableDetailsCommand;
