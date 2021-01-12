import * as React from 'react';
import UICommand from './UICommand';
import {EditorState} from 'prosemirror-state';
import {Schema} from 'prosemirror-model';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import uuid from './uuid';
import './listType.css';
import CustomStyleItem from './CustomStyleItem';

import createPopUp from './createPopUp';
import CustomStyleSubMenu from './CustomStyleSubMenu';
import CustomStyleEditor from './CustomStyleEditor';
import {applyLatestStyle} from '../CustomStyleCommand';
import {atViewportCenter} from './PopUpPosition';
import {removeStyle, updateStyle, renameStyle} from '../customStyle';
import {setTextAlign} from '../TextAlignCommand';
import {setTextLineSpacing} from '../TextLineSpacingCommand';
import {setParagraphSpacing} from '../ParagraphSpacingCommand';

// [FS] IRAD-1039 2020-09-24
// UI to show the list buttons

class CustomMenuUI extends React.PureComponent<any, any> {
  _activeCommand: ?UICommand = null;
  _popUp = null;
  _stylePopup = null;
  _styleName = null;
  // _popUpId = uuid();
  props: {
    className?: ?string,
    commandGroups: Array<{[string]: UICommand}>,
    staticCommand: Array<{[string]: UICommand}>,
    disabled?: ?boolean,
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
    icon?: string | React.Element<any> | null,
    label?: string | React.Element<any> | null,
    title?: ?string,
    _style?: ?any,
  };

  _menu = null;
  _id = uuid();
  _modalId = null;

  state = {
    expanded: false,
    style: {
      display: 'none',
      top: '',
      left: '',
    },
  };

  render() {
    const {
      dispatch,
      editorState,
      editorView,
      commandGroups,
      staticCommand,
      onCommand,
    } = this.props;
    const children = [];
    const children1 = [];

    commandGroups.forEach((group, ii) => {
      Object.keys(group).forEach((label) => {
        const command = group[label];
        const hasText = 'None' !== label;
        children.push(
          <CustomStyleItem
            command={command}
            disabled={editorView && editorView.disabled ? true : false}
            dispatch={dispatch}
            editorState={editorState}
            editorView={editorView}
            hasText={hasText}
            key={label}
            label={label}
            onClick={this._onUIEnter}
            onCommand={onCommand}
            onMouseEnter={this._onUIEnter}
            value={command}
          ></CustomStyleItem>
        );
      });
    });
    staticCommand.forEach((group, ii) => {
      Object.keys(group).forEach((label) => {
        const command = group[label];
        children1.push(
          <CustomStyleItem
            command={command}
            disabled={editorView && editorView.disabled ? true : false}
            dispatch={dispatch}
            editorState={editorState}
            editorView={editorView}
            hasText={false}
            key={label}
            label={command._customStyleName}
            onClick={this._onUIEnter}
            onCommand={onCommand}
            onMouseEnter={this._onUIEnter}
            value={command}
          ></CustomStyleItem>
        );
      });
    });
    return (
      <div>
        <div className="dropbtn" id={this._id}>
          <div className="stylenames">{children}</div>

          <hr></hr>
          {children1}
        </div>
      </div>
    );
  }

  _onUIEnter = (command: UICommand, event: SyntheticEvent<*>) => {
    if (command.shouldRespondToUIEvent(event)) {
      // check the mouse clicked on down arror to show sub menu
      if (event.currentTarget.className === 'czi-custom-menu-item edit-icon') {
        this.showSubMenu(command, event);
      } else {
        this._execute(command, event);
      }
    }
  };

  _execute = (command: UICommand, e: SyntheticEvent<*>) => {
    if (undefined !== command) {
      const {dispatch, editorState, editorView, onCommand} = this.props;
      command.execute(editorState, dispatch, editorView, e);
      onCommand && onCommand();
    }
  };

  //shows the alignment and line spacing option
  showSubMenu(command: UICommand, event: SyntheticEvent<*>) {
    const anchor = event ? event.currentTarget : null;

    // close the popup toggling effect
    if (this._stylePopup) {
      this._stylePopup.close();
      this._stylePopup = null;
      return;
    }
    this._popUp = createPopUp(
      CustomStyleSubMenu,
      {
        command: command,
      },
      {
        anchor,
        autoDismiss: true,
        IsChildDialog: true,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            if (undefined !== val && val.command._customStyle) {
              // do edit,remove,rename code here
              if ('remove' === val.type) {
                removeStyle(
                  val.command._customStyleName,
                  val.command._customStyle,
                  this.props.editorState,
                  this.props.editorView.dispatch
                );

                // [FS] IRAD-1099 2020-11-17
                // Issue fix: Even the applied style is removed the style name is showing in the editor
                this.removeCustomStyleName(
                  this.props.editorState,
                  val.command._customStyleName,
                  this.props.editorView.dispatch
                );
              } else if ('rename' === val.type) {
                this.showStyleWindow(command, event, 2);                
              } else {
                this.showStyleWindow(command, event, 1);
              }
            }
          }
        },
      }
    );
  }

  // [FS] IRAD-1099 2020-11-17
  // Issue fix: Even the applied style is removed the style name is showing in the editor
  removeCustomStyleName(editorState, removedStyleName, dispatch) {
    const {selection, doc} = editorState;
    let {from, to} = selection;
    const {empty} = selection;
    if (empty) {
      from = selection.$from.before(1);
      to = selection.$to.after(1);
    }

    let tr = editorState.tr;
    const customStyleName = 'None';
    const tasks = [];
    const textAlignNode = [];

    doc.nodesBetween(0, doc.nodeSize - 2, (node, pos) => {
      if (node.content && node.content.content && node.content.content.length) {
        if (
          node.content &&
          node.content.content &&
          node.content.content[0].marks &&
          node.content.content[0].marks.length
        ) {
          node.content.content[0].marks.some((mark) => {
            if (node.attrs.styleName === removedStyleName) {
              tasks.push({node, pos, mark});
            }
          });
        } else {
          textAlignNode.push({node, pos});
        }
      }
    });

    if (!tasks.length) {
      textAlignNode.forEach((eachnode) => {
        const {node} = eachnode;
        node.attrs.styleName = customStyleName;
      });
      // to remove both text align format and line spacing
      tr = this.removeTextAlignAndLineSpacing(tr, editorState.schema);
    }

    tasks.forEach((job) => {
      const {node, mark, pos} = job;
      tr = tr.removeMark(pos, pos + node.nodeSize, mark.type);
      // reset the custom style name to NONE after remove the styles
      node.attrs.styleName = customStyleName;
    });

    // to remove both text align format and line spacing
    tr = this.removeTextAlignAndLineSpacing(tr, editorState.schema);
    editorState.doc.nodesBetween(from, to, (node, startPos) => {
      if (node.type.name === 'paragraph') {
        tr = tr.setNodeMarkup(startPos, undefined, node.attrs);
      }
    });
    if (dispatch && tr.docChanged) {
      dispatch(tr);
      return true;
    }
    return false;
  }

  // to remove the text align, line spacing, paragraph spacing after and before format if applied.
  removeTextAlignAndLineSpacing(tr: Transform, schema: Schema): Transform {
    tr = setTextAlign(tr, schema, null);
    tr = setTextLineSpacing(tr, schema, null);
    tr = setParagraphSpacing(tr, schema, '0', true);
    tr = setParagraphSpacing(tr, schema, '0', false);
    return tr;
  }

  //shows the alignment and line spacing option
  showStyleWindow(command: UICommand, event: SyntheticEvent<*>, mode) {
    // const anchor = event ? event.currentTarget : null;
    // close the popup toggling effect
    if (this._stylePopup) {
      this._stylePopup.close();
      this._stylePopup = null;
      // return;
    }
    this._styleName = command._customStyleName;
    this._stylePopup = createPopUp(
      CustomStyleEditor,
      {
        stylename: command._customStyleName,
        mode: mode, //edit
        description: command._customStyle.description,
        styles: command._customStyle.styles,
      },
      {
        position: atViewportCenter,
        autoDismiss: false,
        IsChildDialog: false,
        onClose: (val) => {
          if (this._stylePopup) {
            //handle save style object part here
            if (undefined !== val) {
              const {dispatch} = this.props.editorView;
              // [FS] IRAD-1112 2020-12-14
              // Issue fix: Duplicate style created while modified the style name.
              let customStyles;
              if (1 === mode) {
                // update
                customStyles = updateStyle(val);
              } else {
                // rename
                customStyles = renameStyle(this._styleName, val.stylename);
              }

              // [FS] IRAD-1133 2021-01-06
              // Issue fix: After modify a custom style, the modified style not applied to the paragraph.
              customStyles.then((result) => {
                if (null != result) {
                  let tr;
                  result.forEach((obj) => {
                    if (1 === mode) {
                      if (val.stylename === obj.stylename) {
                        tr = this.updateDocument(
                          this.props.editorState,
                          this.props.editorState.tr,
                          val.stylename,
                          obj.styles
                        );
                      }
                    } else {
                      if (val.stylename === obj.stylename) {
                        tr = this.renameStyleInDocument(
                          this.props.editorState,
                          this.props.editorState.tr,
                          this._styleName,
                          val.stylename,
                          obj.styles
                        );
                      }
                    }
                  });
                  if (tr) {
                    dispatch(tr);
                  }
                  this.props.editorView.focus();
                  this._stylePopup.close();
                  this._stylePopup = null;
                }
              });
            }
          }
        },
      }
    );
  }

  renameStyleInDocument(
    state: EditorState,
    tr: Transform,
    oldStyleName,
    styleName,
    style
  ) {
    const {doc} = state;

    doc.descendants(function (child, pos) {
      const contentLen = child.content.size;
      if (oldStyleName === child.attrs.styleName) {
        child.attrs.styleName = styleName;
        tr = applyLatestStyle(
          child.attrs.styleName,
          state,
          tr,
          child,
          pos,
          pos + contentLen + 1,
          style
        );
      }
    });
    return tr;
  }

  updateDocument(state: EditorState, tr: Transform, styleName, style) {
    const {doc} = state;

    doc.descendants(function (child, pos) {
      const contentLen = child.content.size;
      if (haveEligibleChildren(child, contentLen, styleName)) {
        tr = applyLatestStyle(
          child.attrs.styleName,
          state,
          tr,
          child,
          pos,
          pos + contentLen + 1,
          style
        );
      }
    });
    return tr;
  }
}

function haveEligibleChildren(node, contentLen, styleName) {
  return (
    node.type.name === 'paragraph' &&
    0 < contentLen &&
    styleName === node.attrs.styleName
  );
}

export default CustomMenuUI;
