// @flow

import cx from 'classnames';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import ReactDOM from 'react-dom';

import CommandButton from './CommandButton.js';
import CommandMenuButton from './CommandMenuButton.js';
import {
  CustomButton
} from '@modusoperandi/licit-ui-commands';
import {
  COMMAND_GROUPS,
  parseLabel
} from './EditorToolbarConfig.js';
import Icon from './Icon.js';
import ResizeObserver from './ResizeObserver.js';
import {
  UICommand
} from '@modusoperandi/licit-doc-attrs-step';
import isReactClass from './isReactClass.js';

import './czi-editor-toolbar.css';

class EditorToolbar extends React.PureComponent<any, any> {
  _body = null;

  props: {
    disabled?: ?boolean,
    dispatchTransaction?: ?(tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
    onReady?: ?(view: EditorView) => void,
    readOnly?: ?boolean,
  };

  state = {
    expanded: false,
    wrapped: null,
  };

  render(): React.Element<any> {
    const { wrapped, expanded } = this.state;
    const className = cx('czi-editor-toolbar', { expanded, wrapped });
    const wrappedButton = wrapped ? (
      <CustomButton
        active={expanded}
        className="czi-editor-toolbar-expand-button"
        icon={Icon.get('more_horiz')}
        key="expand"
        onClick={this._toggleExpansion}
        title="More"
        value={expanded}
      />
    ) : null;

    // Start with static button controls and append any button groups
    // supplied by plugins
    const commandGroups = COMMAND_GROUPS.concat(
      (this.props.editorState.plugins || [])
        // This should have been a simple property instead of a function:
        //  p => p.buttonGroup
        // but changing it now would mean finding every plugin that was
        // implemented this way.
        .map((p) => p.initButtonCommands?.())
        .filter(Boolean)
    )
      .map(this._renderButtonsGroup)
      .filter(Boolean);

    return (
      <div className={className}>
        <div className="czi-editor-toolbar-flex">
          <div className="czi-editor-toolbar-body">
            <div
              className="czi-editor-toolbar-body-content"
              ref={this._onBodyRef}
            >
              <i className="czi-editor-toolbar-wrapped-anchor" />
              {commandGroups}
              <div className="czi-editor-toolbar-background">
                <div className="czi-editor-toolbar-background-line" />
                <div className="czi-editor-toolbar-background-line" />
                <div className="czi-editor-toolbar-background-line" />
                <div className="czi-editor-toolbar-background-line" />
                <div className="czi-editor-toolbar-background-line" />
              </div>
              <i className="czi-editor-toolbar-wrapped-anchor" />
            </div>
            {wrappedButton}
          </div>
          <div className="czi-editor-toolbar-footer" />
        </div>
      </div>
    );
  }

  _renderButtonsGroup = (group: Object, index: number): React.Element<any> => {
    const buttons = Object.keys(group)
      .map((label) => {
        const obj = group[label];

        if (isReactClass(obj)) {
          // JSX requies the component to be named with upper camel case.
          const ThatComponent = obj;
          const { editorState, editorView, dispatchTransaction } = this.props;
          return (
            <ThatComponent
              dispatch={dispatchTransaction}
              editorState={editorState}
              editorView={editorView}
              key={label}
            />
          );
        } else if (obj instanceof UICommand) {
          return this._renderButton(label, obj);
        } else if (Array.isArray(obj)) {
          return this._renderMenuButton(label, obj);
        } else {
          return null;
        }
      })
      .filter(Boolean);
    return (
      <div className="czi-custom-buttons" key={'g' + String(index)}>
        {buttons}
      </div>
    );
  };

  _renderMenuButton = (
    label: string,
    commandGroups: Array<{ [string]: UICommand }>
  ): React.Element<any> => {
    const {
      editorState,
      editorView,
      disabled,
      dispatchTransaction,
    } = this.props;
    const { icon, title } = parseLabel(label);
    return (
      <CommandMenuButton
        commandGroups={commandGroups}
        disabled={disabled}
        dispatch={dispatchTransaction}
        editorState={editorState}
        editorView={editorView}
        icon={icon}
        key={label}
        label={icon ? null : title}
        title={title}
      />
    );
  };

  _renderButton = (label: string, command: UICommand): React.Element<any> => {
    const {
      disabled,
      editorState,
      editorView,
      dispatchTransaction,
    } = this.props;
    const { icon, title } = parseLabel(label);

    return (
      <CommandButton
        command={command}
        disabled={disabled}
        dispatch={dispatchTransaction}
        editorState={editorState}
        editorView={editorView}
        icon={icon}
        key={label}
        label={icon ? null : title}
        title={title}
      />
    );
  };

  _onBodyRef = (ref: HTMLElement): void => {
    if (ref) {
      this._body = ref;
      // Mounting
      ResizeObserver.observe(ref, this._checkIfContentIsWrapped);
    } else if (this._body) {
      // Unmounting
      ResizeObserver.unobserve(this._body);
      this._body = null;
    }
  };

  _checkIfContentIsWrapped = (): void => {
    const ref = this._body;

    if (ref) {
      const startAnchor = ref.firstChild;
      const endAnchor = ref.lastChild;

      if (startAnchor && endAnchor) {
        const wrapped = startAnchor.offsetTop < endAnchor.offsetTop;
        this.setState({ wrapped });
      }
    }
  };


  _toggleExpansion = (expanded: boolean): void => {
    this.setState({ expanded: !expanded });
  };
}

export default EditorToolbar;
