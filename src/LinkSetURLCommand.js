// @flow

import { EditorState } from 'prosemirror-state';
import { TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import {
  MARK_LINK
} from './MarkNames.js';
import {
  hideSelectionPlaceholder,
  showSelectionPlaceholder,
} from './SelectionPlaceholderPlugin.js';
import {
  applyMark
} from '@modusoperandi/licit-ui-commands';
import {
  findNodesWithSameMark
} from '@modusoperandi/licit-ui-commands';
import LinkURLEditor from './ui/LinkURLEditor.js';
import {
  UICommand
} from '@modusoperandi/licit-doc-attrs-step';
import {
  createPopUp
} from '@modusoperandi/licit-ui-commands';

import {INNER_LINK} from './Types.js';

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
    let storeTOCvalue = [];
    const TOCselectedNode = [];

    const stylePromise = view.runtime;

    if (stylePromise === null || undefined) {
      return TOCselectedNode;
    }

    const prototype = Object.getPrototypeOf(stylePromise);
    const styles = await prototype.getStylesAsync();


    storeTOCvalue = styles
      .filter((style) => style.styles.toc === true)
      .map((style) => style.styleName);

    view.state.tr.doc.descendants((node, pos) => {

      if (storeTOCvalue.contains(node.attrs.styleName)) {
        TOCselectedNode.push({ node_: node, pos_: pos });
      }
    });



    return TOCselectedNode;

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
    const result = findNodesWithSameMark(doc, from, to, markType);
    const href = result ? result.mark.attrs.href : null;
    const tocItemsNode = await this.showTocList(view);
    const viewPops = {
      href_: href,
      TOCselectedNode_: tocItemsNode,
      view_: view,
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
      const { selection, schema } = state;
      let { tr } = state;
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
        tr = applyMark(
          tr.setSelection(state.selection),
          schema,
          markType,
          attrs
        );
      }
      dispatch(tr);
    }
    view && view.focus();
    return true;
  };
}

export default LinkSetURLCommand;
