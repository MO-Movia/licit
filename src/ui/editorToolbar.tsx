import cx from 'classnames';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import ReactDOM from 'react-dom';

import CommandButton from './commandButton';
import CommandMenuButton, { Arr } from './commandMenuButton';
import { CustomButton,ThemeContext  } from '@modusoperandi/licit-ui-commands';
import { COMMAND_GROUPS, parseLabel } from './editorToolbarConfig';
import Icon from './icon';
import ResizeObserver from '../resizeObserver';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import isReactClass from '../isReactClass';

import '../styles/czi-editor-toolbar.css';
import { LicitPlugin } from '../convertFromJSON';
import { EditorViewEx } from '../constants';
import { ToolbarMenuConfig } from '../types';

class EditorToolbar extends React.PureComponent {
  static contextType = ThemeContext;
  _body = null;

  props: {
    disabled?: boolean;
    dispatchTransaction?: (tr: Transform) => void;
    editorState: EditorState;
    editorView: EditorViewEx;
    onReady?: (view: EditorView) => void;
    readOnly?: boolean;
    toolbarConfig?:ToolbarMenuConfig[];
  };

  state = {
    expanded: false,
    wrapped: null,
  };

  render(): React.ReactElement<CustomButton> {
    const { wrapped, expanded } = this.state;
    const{toolbarConfig}=this.props;
    const theme  = this.context;
    console.log(theme);
    let commandGroups :any;
    let className = cx('czi-editor-toolbar', { expanded, wrapped });

    if (expanded && !wrapped) {
      className = 'czi-editor-toolbar';
    }
    const expVal = expanded ? 1 : 0;
    const wrappedButton = wrapped ? (
      <CustomButton
        active={expanded}
        className="czi-editor-toolbar-expand-button"
        icon={Icon.get('more_horiz')}
        key="expand"
        onClick={this._toggleExpansion}
        title="More"
        value={expVal}
      />
    ) : null;

    if(toolbarConfig && toolbarConfig.length>0){
      toolbarConfig.sort((a, b) => a.menuPosition - b.menuPosition);
      // const pluginObjects = toolbarConfig.filter((item) => item.isPlugin === true);
      // if(this.props.editorState && this.props.editorState.plugins && pluginObjects && pluginObjects.length >0){


      // }

   const pluginObjects = toolbarConfig
  .filter((item) => item.isPlugin === true)
  .map((toolbarObj) => {
    const matchingPlugin = this.props.editorState.plugins.find(
      (plugin) => (plugin as any).key  === toolbarObj.key
    );

    if (matchingPlugin) {
      // Return a new object with properties from both toolbar and plugin
      return {
        ...toolbarObj,
        menuCommand:(matchingPlugin as LicitPlugin).initButtonCommands()

      };
    }

    return null; // If no matching plugin is found
  })
  .filter(Boolean); // Remove null entries
console.log(pluginObjects);
if(pluginObjects && pluginObjects.length>0){

  toolbarConfig.map(obj2 => {
    const correspondingObj = pluginObjects.find(obj1 => obj1.key === obj2.key);
    if (correspondingObj) {
        obj2.menuCommand = correspondingObj.menuCommand;
        obj2.key=correspondingObj.key;
    }
    return obj2;
});

console.log(toolbarConfig);

commandGroups=toolbarConfig.map(this._renderButtonsGroup_Order).filter(Boolean);
}
    } else{
    // const theme = theme;
    // Start with static button controls and append any button groups
    // supplied by plugins
     commandGroups = COMMAND_GROUPS.concat(
      ((this.props.editorState && this.props.editorState.plugins) || [])
        // This should have been a simple property instead of a function:
        //  p => p.buttonGroup
        // but changing it now would mean finding every plugin that was
        // implemented this way.
        .map( (p) => 'initButtonCommands' in p && (p as LicitPlugin).initButtonCommands())
        .filter(Boolean)
    ).map(this._renderButtonsGroup).filter(Boolean);
        }
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

  _renderButtonsGroup = (
    group: Record<string, UICommand | React.PureComponent>,
    index: number
  ): React.ReactElement => {

    const theme  = this.context;
    console.log('se '+ theme);
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
          return this._renderButton(label, obj,theme.toString());
        } else if (Array.isArray(obj)) {
          return this._renderMenuButton(label, obj);
        } else {
          return null;
        }
      })
      .filter(Boolean);
    return (
      <div className={`czi-custom-buttons ${theme}`}>
        {buttons}
      </div>
    );
  };

  _renderButtonsGroup_Order = (
    group:  ToolbarMenuConfig,
    index: number
  ): React.ReactElement => {

    const theme  = this.context;
    console.log('se '+ theme);
    // const buttons = Object.keys(group)
    //   .map((label) => {
    //     const obj =group.menuCommand;

    //     if (isReactClass(obj)) {
    //       // JSX requies the component to be named with upper camel case.
    //       const ThatComponent = obj;
    //       const { editorState, editorView, dispatchTransaction } = this.props;
    //       return (
    //         <ThatComponent
    //           dispatch={dispatchTransaction}
    //           editorState={editorState}
    //           editorView={editorView}
    //           key={group.key}
    //         />
    //       );
    //     } else if (obj instanceof UICommand) {
    //       return this._renderButton(group.key, obj,theme.toString());
    //     } else if (Array.isArray(obj)) {
    //       return this._renderMenuButton(group.key, obj);
    //     } else {
    //       return null;
    //     }
    //   })
    //   .filter(Boolean);

    const obj =group.menuCommand;
    const buttons = this.createmenuButtons(group,theme.toString());

    return (
      <div className="czi-custom-buttons" key={'g' + String(index)}>
        {buttons}
      </div>
    );
  };

  createmenuButtons= (
    group:  ToolbarMenuConfig,
    theme: string
  ): React.ReactElement => {


    if (isReactClass(group.menuCommand)) {
      // JSX requies the component to be named with upper camel case.
      const ThatComponent = group.menuCommand;
      const { editorState, editorView, dispatchTransaction } = this.props;
      return (
        <ThatComponent
          dispatch={dispatchTransaction}
          editorState={editorState}
          editorView={editorView}
          key={group.key}
        />
      );
    } else if (group.menuCommand instanceof UICommand) {
      return this._renderButton(group.key, group.menuCommand,theme.toString());
    } else if (Array.isArray(group.menuCommand) ) {
      return this._renderMenuButton(group.key, group.menuCommand);
    } else {

      const keysArray = Object.keys(group.menuCommand);

      // Access the first key
      const firstKey = keysArray && keysArray.length>0? keysArray[0]:undefined;
      if (firstKey && Array.isArray(group.menuCommand[firstKey])){
        return this._renderMenuButton(group.key, group.menuCommand[firstKey]);
      }
      return null;
    }
  }
  _renderMenuButton = (
    label: string,
    commandGroups: Array<Arr>
  ): React.ReactElement<CommandMenuButton> => {
    const { editorState, editorView, disabled, dispatchTransaction } =
      this.props;
      const theme = this.context;
      console.log('separseLabel ' + theme);
      const { icon, title } = parseLabel(label, theme ? theme.toString() : 'dark');
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

  _renderButton = (
    label: string,
    command: UICommand,
    theme:string
  ): React.ReactElement<CommandButton> => {
    const { disabled, editorState, editorView, dispatchTransaction } =
      this.props;
    const { icon, title } = parseLabel(label,theme);

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

  _onBodyRef = (ref: React.ReactInstance): void => {
    if (ref) {
      this._body = ref;
      // Mounting
      const el = ReactDOM.findDOMNode(ref);
      if (el instanceof HTMLElement) {
        ResizeObserver.observe(el, this._checkIfContentIsWrapped);
      }
    } else {
      // Unmounting.
      const el = this._body && ReactDOM.findDOMNode(this._body);
      if (el instanceof HTMLElement) {
        ResizeObserver.unobserve(el);
      }
      this._body = null;
    }
  };

  _checkIfContentIsWrapped = (): void => {
    const ref = this._body;
    const el = ref && ReactDOM.findDOMNode(ref);
    const startAnchor = el && el.firstChild;
    const endAnchor = el && el.lastChild;
    if (startAnchor && endAnchor) {
      const wrapped =
        (startAnchor as HTMLElement).offsetTop <
        (endAnchor as HTMLElement).offsetTop;
      this.setState({ wrapped });
    }
  };

  _toggleExpansion = (expanded: boolean): void => {
    this.setState({ expanded: !expanded });
  };
}

export default EditorToolbar;
