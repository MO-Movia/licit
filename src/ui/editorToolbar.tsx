/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import cx from 'classnames';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import * as React from 'react';
import ReactDOM from 'react-dom';

import CommandButton from './commandButton';
import CommandMenuButton from './commandMenuButton';
import {CustomButton, ThemeContext} from '@modusoperandi/licit-ui-commands';
import {COMMAND_GROUPS, CommandGroup, parseLabel} from './editorToolbarConfig';
import Icon from './icon';
import ResizeObserver from '../resizeObserver';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import isReactClass from '../isReactClass';

import '../styles/czi-editor-toolbar.css';
import {LicitPlugin} from '../convertFromJSON';
import {EditorViewEx} from '../constants';
import {ToolbarMenuConfig} from '../types';

interface LicitPluginWithKey extends LicitPlugin {
  key: string;
}

class EditorToolbar extends React.PureComponent {
  public static readonly contextType = ThemeContext;
  declare context: React.ContextType<typeof ThemeContext>;

  _body = null;

  declare props: {
    disabled?: boolean;
    dispatchTransaction?: (tr: Transform) => void;
    editorState: EditorState;
    editorView: EditorViewEx;
    onReady?: (view: EditorView) => void;
    readOnly?: boolean;
    toolbarConfig?: ToolbarMenuConfig[];
  };

  state = {
    expanded: false,
    wrapped: false,
  };

  render(): React.ReactElement<CustomButton> {
    const {wrapped, expanded} = this.state;
    const {toolbarConfig} = this.props;
    const theme = this.context;

    const className = this._getToolbarClassName(expanded, wrapped);
    const toolbarBodyClass = cx('czi-editor-toolbar-body-content', theme);
    const wrappedButton = this._renderWrappedButton(wrapped, expanded, theme);
    const commandGroups = this._getCommandGroups(toolbarConfig, theme);

    return (
      <div className={className}>
        <div className="czi-editor-toolbar-flex">
          <div className="czi-editor-toolbar-body">
            <div className={toolbarBodyClass} ref={this._onBodyRef}>
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

  private _getToolbarClassName(expanded: boolean, wrapped: boolean): string {
    if (expanded && !wrapped) {
      return 'czi-editor-toolbar';
    }
    return cx('czi-editor-toolbar', {expanded, wrapped}) as string;
  }

  private _renderWrappedButton(
    wrapped: boolean,
    expanded: boolean,
    theme: string
  ): React.ReactElement | null {
    if (!wrapped) {
      return null;
    }

    const expVal = expanded ? 1 : 0;
    return (
      <CustomButton
        active={expanded}
        className="czi-editor-toolbar-expand-button"
        icon={Icon.get('more_horiz')}
        key="expand"
        onClick={this._toggleExpansion}
        title="More"
        value={expVal}
        theme={theme.toString()}
      />
    );
  }

  private _getCommandGroups(
    toolbarConfig: ToolbarMenuConfig[] | undefined,
    theme: string
  ): React.ReactElement[] {
    if (!toolbarConfig || toolbarConfig.length === 0) {
      return this._getDefaultCommandGroups(theme);
    }

    return this._getCustomCommandGroups(toolbarConfig, theme);
  }

  private _getDefaultCommandGroups(theme: string): React.ReactElement[] {
    const pluginCommands = (
      (this.props.editorState && this.props.editorState.plugins) ||
      []
    )
      .map((p) =>
        'initButtonCommands' in p
          ? (p as LicitPlugin).initButtonCommands(theme)
          : null
      )
      .filter((group): group is UICommand => group !== null);

    return COMMAND_GROUPS.concat(pluginCommands)
      .map(this._renderButtonsGroup)
      .filter((element): element is React.ReactElement => element !== null);
  }

  private _getCustomCommandGroups(
    toolbarConfig: ToolbarMenuConfig[],
    theme: string
  ): React.ReactElement[] {
    toolbarConfig.sort((a, b) => a.menuPosition - b.menuPosition);

    const pluginObjects = this._extractPluginObjects(toolbarConfig, theme);

    if (pluginObjects && pluginObjects.length > 0) {
      this._mergePluginObjects(toolbarConfig, pluginObjects);
    }

    const m = this.processMenuItems(toolbarConfig);
    const k = this.groupMenuItems(m);
    return k.map(this._renderButtonsGroup_1).filter(Boolean);
  }

  private _extractPluginObjects(
    toolbarConfig: ToolbarMenuConfig[],
    theme: string
  ): ToolbarMenuConfig[] {
    return toolbarConfig
      .filter((item) => item.isPlugin === true)
      .map((toolbarObj) => {
        const matchingPlugin = this.props.editorState.plugins.find(
          (plugin) => (plugin as LicitPluginWithKey).key === toolbarObj.key
        );

        if (matchingPlugin) {
          return {
            ...toolbarObj,
            menuCommand: (matchingPlugin as LicitPlugin).initButtonCommands(
              theme
            ),
          } as {
            menuCommand: UICommand;
            menuPosition: number;
            key: string;
            isPlugin?: boolean;
            group: string;
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  private _mergePluginObjects(
    toolbarConfig: ToolbarMenuConfig[],
    pluginObjects: ToolbarMenuConfig[]
  ): void {
    for (const obj2 of toolbarConfig) {
      const correspondingObj = pluginObjects.find(
        (obj1) => obj1.key === obj2.key
      );
      if (correspondingObj) {
        obj2.menuCommand = correspondingObj.menuCommand;
        obj2.key = correspondingObj.key;
      }
    }
  }

  //   let retArr = [];
  //   return menuItems.reduce((acc, item) => {

  //     if (item.isPlugin) {

  //       const keysArray = Object.keys(item.menuCommand);
  //       // Access the first key
  //       const firstKey = keysArray && keysArray.length > 0 ? keysArray[0] : undefined;
  //       if (firstKey) {
  //         retArr.push(acc[firstKey] = item.menuCommand[firstKey]);
  //       }
  //     } else {
  //       retArr.push(acc[item.key] = item.menuCommand);
  //     }
  //     // }
  //     return retArr;
  //   }, {});
  // }

  // processMenuItems(menuItems) {

  //   return menuItems.reduce((acc, item) => {
  //     if (item.isPlugin) {
  //       const keysArray = Object.keys(item.menuCommand);
  //       const firstKey = keysArray && keysArray.length > 0 ? keysArray[0] : undefined;
  //       if (firstKey) {
  //         acc[firstKey] = item.menuCommand[firstKey];
  //       }
  //     } else {
  //       acc[item.key] = item.menuCommand;
  //     }
  //     return acc;
  //   }, {});
  // }

  //   processMenuItems(menuItems) {
  //     return menuItems.reduce((acc, item) => {
  //       const { group, key, menuCommand, menuPosition } = item; // Destructure properties

  //       if (!acc[group]) {
  //         acc[group] = []; // Create new group array if it doesn't exist
  //       }
  //       acc[group].push({ [key]: menuCommand, pos: menuPosition }); // Push key-value pair to group array
  //       return acc;
  //     }, {});
  //   }
  //   sortItemsByPosition(items: MenuItem[]): MenuItem[] {
  //   return items.sort((a, b) => {
  //     if (!a.menuPosition || !b.menuPosition) return 0; // Handle missing positions
  //     return a.menuPosition - b.menuPosition;
  //   });
  // }
  // like our structure need to check
  processMenuItems(menuItems) {
    return menuItems.reduce((acc, item) => {
      if (item.isPlugin) {
        const keysArray = Object.keys(item.menuCommand);
        const firstKey =
          keysArray && keysArray.length > 0 ? keysArray[0] : undefined;
        if (firstKey) {
          const newItem = {
            [firstKey]: item.menuCommand[firstKey],
            group: item.group, // Use key as property name
          };
          acc.push(newItem);
        }
      } else {
        const newItem = {
          [item.key]: item.menuCommand,
          group: item.group, // Use key as property name
        };
        acc.push(newItem);
      }

      return acc as Array<
        Record<string, UICommand | React.PureComponent | string>
      >;
    }, []) as Array<Record<string, UICommand | React.PureComponent | string>>;
  }

  groupMenuItems = (items) => {
    const groups: CommandGroup[] = [];
    let prefix = 1;

    items.forEach((item) => {
      const groupName = item.group || 'Ungrouped'; // Use 'Ungrouped' for missing groups
      // if (!groups[prefix]) {
      //   groups[prefix] = [];
      // }
      if (groups.findIndex((item) => item.group === groupName) < 0) {
        const x = items.filter((a) => {
          return a.group === groupName;
        });
        groups.push({[prefix]: {...x}, group: groupName});
      }
      prefix++;
    });

    return groups;
  };

  _renderButtonsGroup = (
    group: CommandGroup,
    _index: number
  ): React.ReactElement => {
    const theme = this.context;

    const buttons = Object.keys(group)
      .map((label) => {
        const obj = group[label];

        if (isReactClass(obj)) {
          // Render custom component
          const CustomComponent = obj as React.ComponentType<{
            dispatch: typeof this.props.dispatchTransaction;
            editorState: typeof this.props.editorState;
            editorView: typeof this.props.editorView;
          }>;

          const {editorState, editorView, dispatchTransaction} = this.props;

          return (
            <CustomComponent
              key={label}
              dispatch={dispatchTransaction}
              editorState={editorState}
              editorView={editorView}
            />
          );
        } else if (obj instanceof UICommand) {
          return this._renderButton(label, obj, String(theme));
        } else if (Array.isArray(obj)) {
          return this._renderMenuButton(label, obj);
        }

        return null;
      })
      .filter((button): button is React.ReactElement => button !== null);

    return <div className={`czi-custom-buttons ${theme}`}>{buttons}</div>;
  };

  _renderButtonsGroup_1 = (
    group: CommandGroup,
    _index: number
  ): React.ReactElement => {
    const theme = this.context;

    const buttons: React.ReactNode[] = [];

    // Iterate through the group entries
    for (const [label, obj] of Object.entries(group)) {
      if (label === 'group') continue; // Skip 'group' key if it exists

      if (isReactClass(obj)) {
        // Component class - cast to ComponentClass
        const CustomComponent = obj as React.ComponentClass<{
          dispatch: typeof this.props.dispatchTransaction;
          editorState: typeof this.props.editorState;
          editorView: typeof this.props.editorView;
        }>;

        const {editorState, editorView, dispatchTransaction} = this.props;

        buttons.push(
          <CustomComponent
            key={label}
            dispatch={dispatchTransaction}
            editorState={editorState}
            editorView={editorView}
          />
        );
      } else if (obj instanceof UICommand) {
        buttons.push(this._renderButton(label, obj, String(theme)));
      } else if (Array.isArray(obj)) {
        buttons.push(this._renderMenuButton(label, obj));
      }
    }

    return <div className={`czi-custom-buttons ${theme}`}>{buttons}</div>;
  };

  // _renderButtonsGroup_Order = (
  //   group: ToolbarMenuConfig,
  //   index: number
  // ): React.ReactElement => {

  //   const theme = this.context;

  //   const obj = group.menuCommand;
  //   const buttons = this.createmenuButtons(group, theme.toString());

  //   return (
  //     <div className="czi-custom-buttons" key={'g' + String(index)}>
  //       {buttons}
  //     </div>
  //   );
  // };

  // createmenuButtons = (
  //   group: ToolbarMenuConfig,
  //   theme: string
  // ): React.ReactElement => {

  //   if (isReactClass(group.menuCommand)) {
  //     // JSX requies the component to be named with upper camel case.
  //     const ThatComponent = group.menuCommand;
  //     const { editorState, editorView, dispatchTransaction } = this.props;
  //     return (
  //       <ThatComponent
  //         dispatch={dispatchTransaction}
  //         editorState={editorState}
  //         editorView={editorView}
  //         key={group.key}
  //       />
  //     );
  //   } else if (group.menuCommand instanceof UICommand) {
  //     return this._renderButton(group.key, group.menuCommand, theme.toString());
  //   } else if (Array.isArray(group.menuCommand)) {
  //     return this._renderMenuButton(group.key, group.menuCommand);
  //   } else {

  //     const keysArray = Object.keys(group.menuCommand);

  //     // Access the first key
  //     const firstKey = keysArray && keysArray.length > 0 ? keysArray[0] : undefined;
  //     if (firstKey && Array.isArray(group.menuCommand[firstKey])) {
  //       return this._renderMenuButton(group.key, group.menuCommand[firstKey]);
  //     }
  //     return null;
  //   }
  // }
  _renderMenuButton = (
    label: string,
    commandGroups: CommandGroup[]
  ): React.ReactElement<CommandMenuButton> => {
    const {editorState, editorView, disabled, dispatchTransaction} = this.props;
    const theme = this.context;
    const {icon, title} = parseLabel(label, theme ? theme.toString() : 'dark');
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
    theme: string
  ): React.ReactElement<CommandButton> => {
    const {disabled, editorState, editorView, dispatchTransaction} = this.props;
    const {icon, title} = parseLabel(label, theme);

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
      this.setState({wrapped});
    }
  };

  _toggleExpansion = (expanded: boolean): void => {
    this.setState({expanded: !expanded});
  };
}

export default EditorToolbar;
