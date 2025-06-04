// @flow

import { EditorState, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { MARK_LINK } from './MarkNames.js';
import {
  hideSelectionPlaceholder,
  showSelectionPlaceholder,
} from './SelectionPlaceholderPlugin.js';
import {
  applyMark,
  findNodesWithSameMark,
  createPopUp,
} from '@modusoperandi/licit-ui-commands';
import LinkURLEditor from './ui/LinkURLEditor.js';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { INNER_LINK } from './Types.js';

class LinkSetURLCommand extends UICommand {
  _popUp = null;

  isEnabled = (state: EditorState): boolean => {
    if (!(state.selection instanceof TextSelection)) {
      // Could be a NodeSelection or CellSelection.
      return false;
    }

    const markType = state.schema.marks[MARK_LINK];
    if (!markType) {
      return false;
    }
    const { from, to } = state.selection;
    return from < to;
  };

  showTocList = async (view) => {

    const stylePromise = view.runtime;

    if (stylePromise === null || undefined) {
      return [];
    }
    const styles = await stylePromise.fetchStyles();

    const storeTOCvalue = styles
      .filter(
        (
          style // Added TOT/TOF selected styles to be listed as well
        ) =>
          style?.styles?.toc === true ||
          style?.styles?.tot === true ||
          style?.styles?.tof === true
      )
      .map((style) => style?.styleName);
    return stylePromise.fetchInnerLinkSelectionIds(storeTOCvalue); // Fetching the selection IDs for the TOC items from MSD
  };

  waitForUserInput = async (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    event: ?SyntheticEvent<>
  ): Promise<any> => {
    if (dispatch) {
      dispatch(showSelectionPlaceholder(state));
    }

    const { doc, schema, selection } = state;
    const markType = schema.marks[MARK_LINK];
    if (!markType) {
      return Promise.resolve(undefined);
    }
    const { from, to } = selection;
    const result = findNodesWithSameMark(doc, from, to - 1, markType);
    const href = result ? result.mark.attrs.href : null;
    const tocItemsNode = await this.showTocList(view);
    const viewPops = {
      href_: href,
      TOCselectedNode_: tocItemsNode
    };

    return new Promise((resolve) => {
      this._popUp = createPopUp(LinkURLEditor, viewPops, {
        modal: true,
        onClose: (val) => {
          if (this._popUp) {
            resolve(val);
            this._popUp = null;
          }
        },
      });
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch: ?(tr: Transform) => void,
    view: ?EditorView,
    url: ?string
  ): boolean => {
    if (dispatch) {
      const { selection, schema } = view.state;
      let { tr } = view.state;
      tr = view ? hideSelectionPlaceholder(view.state) : tr;
      tr = tr.setSelection(selection);
      if (url !== undefined) {
        let selectionId;
        let href;
        if (url.includes(INNER_LINK)) {
          selectionId = url.split(INNER_LINK)[0];
          href = url.split(INNER_LINK)[1];
        } else {
          selectionId = null;
          href = url;
        }
        const markType = schema.marks[MARK_LINK];
        const attrs = url ? { href, selectionId } : null;
        tr = applyMark(tr.setSelection(selection), schema, markType, attrs);
      }
      dispatch(tr);
    }
    view && view.focus();
    return true;
  };
}

export default LinkSetURLCommand;
