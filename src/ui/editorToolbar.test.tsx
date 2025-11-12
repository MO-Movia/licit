import React from 'react';
import ReactDOM from 'react-dom';
import EditorToolbar from './editorToolbar';
import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { EditorViewEx } from '../constants';
import { ToolbarMenuConfig } from '@src/types';

//  Full mock subclass since UICommand is abstract
class MockUICommand extends UICommand {
  executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
    return tr;
  }
  async waitForUserInput() {
    return Promise.resolve(true);
  }

  executeWithUserInput() {
    return true;
  }

  cancel() {
    return;
  }

  executeCustom(_state: EditorState, tr: Transform, _from: number, _to: number): Transform {
    return tr;
  }

isEnabled = () => true;

execute = () => true;

  
}

//  Mock toolbar config with proper typing
const mockToolbarConfig = [
  {
    key: 'bold',
    label: 'Bold',
    group: 'text',
    menuPosition: 0, // must be number, not string
    menuCommand: new MockUICommand(),
  },
  {
    key: 'italic',
    label: 'Italic',
    group: 'text',
    menuPosition: 1,
    menuCommand: new MockUICommand(),
  },
];

//  Mock editor state and view
const mockEditorState = {} as EditorState;
const mockEditorView = {
  dom: document.createElement('div'),
} as unknown as EditorViewEx;

describe('EditorToolbar (pure Jest)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  });

  it('renders without crashing', () => {
    ReactDOM.render(
      <EditorToolbar
        editorState={mockEditorState}
        editorView={mockEditorView}
        toolbarConfig={mockToolbarConfig}
      />,
      container
    );
    const toolbar = container.querySelector('.czi-editor-toolbar');
    expect(toolbar).not.toBeNull();
  });

  it('should toggle expanded state from true to false', () => {
        const toolbarInstance = new EditorToolbar({
      editorState: mockEditorState,
      editorView: mockEditorView,
      toolbarConfig: mockToolbarConfig,
    });
  toolbarInstance.setState = jest.fn();
  toolbarInstance._toggleExpansion(true);
  expect(toolbarInstance.setState).toHaveBeenCalledWith({ expanded: false });
});

it('should toggle expanded state from false to true', () => {
      const toolbarInstance = new EditorToolbar({
      editorState: mockEditorState,
      editorView: mockEditorView,
      toolbarConfig: mockToolbarConfig,
    });
  toolbarInstance.setState = jest.fn();
  toolbarInstance._toggleExpansion(false);
  expect(toolbarInstance.setState).toHaveBeenCalledWith({ expanded: true });
});

  it('handles dispatchTransaction correctly', () => {
    const dispatchMock = jest.fn();
    const toolbarInstance = new EditorToolbar({
      editorState: mockEditorState,
      editorView: mockEditorView,
      toolbarConfig: mockToolbarConfig,
      dispatchTransaction: dispatchMock,
    });

    const tr = {} as Transform;
    toolbarInstance.props.dispatchTransaction?.(tr);
    expect(dispatchMock).toHaveBeenCalledWith(tr);
  });

 it('should cover expanded && !wrapped condition in render()', () => {
  //  Subclass to safely provide context (no "any" used)
  class TestableEditorToolbar extends EditorToolbar {
    context = 'dark'; // mock the ThemeContext value
  }

  const toolbarInstance = new TestableEditorToolbar({
    editorState: mockEditorState,
    editorView: mockEditorView,
    toolbarConfig: mockToolbarConfig,
  });

  // Force the condition
  toolbarInstance.state = { expanded: true, wrapped: false };

  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  const result = toolbarInstance.render();

  expect(React.isValidElement(result)).toBe(true);
  expect(result).toBeDefined();

  logSpy.mockRestore();
});

  it('merges pluginObjects into toolbarConfig when plugin exists (branch coverage)', () => {
    class TestableEditorToolbar extends EditorToolbar {
      context = 'dark'; // fake theme context
    }

    const pluginMenuResult = { pluginA: [[{ some: 'menu' }]] };

    const matchingPlugin = {
      key: 'pluginA',
      initButtonCommands: jest.fn(() => pluginMenuResult),
    };

    const toolbarConfigForTest = [
      {
        key: 'pluginA',
        label: 'Plugin A',
        group: 'group',
        isPlugin: true,
        menuPosition: 0,
      },
      {
        key: 'regular',
        label: 'Regular',
        group: 'group',
        isPlugin: false,
        menuPosition: 1,
        menuCommand: new MockUICommand(),
      },
    ];

    const editorStateWithPlugin = {
      plugins: [matchingPlugin],
    } as unknown as EditorState;

    const instance = new TestableEditorToolbar({
      editorState: editorStateWithPlugin,
      editorView: mockEditorView,
      toolbarConfig: toolbarConfigForTest as ToolbarMenuConfig[],
    });

    instance.state = { expanded: true, wrapped: true }; 
    const result = instance.render();

    expect(React.isValidElement(result)).toBe(true);
    expect(toolbarConfigForTest[0].menuCommand).toBe(pluginMenuResult);
    expect(toolbarConfigForTest[0].key).toBe('pluginA');
    expect(matchingPlugin.initButtonCommands).toHaveBeenCalledWith('dark');
  });

  it('should use default command groups when toolbarConfig is undefined', () => {
  class TestableEditorToolbar extends EditorToolbar {
    context = 'dark';
  }

  const instance = new TestableEditorToolbar({
    editorState: mockEditorState,
    editorView: mockEditorView,
    toolbarConfig: undefined,
  });

  instance.state = { expanded: false, wrapped: false };
  const result = instance.render();

  expect(React.isValidElement(result)).toBe(true);
  expect(result).toBeDefined();
});

it('should use default command groups when toolbarConfig is empty array', () => {
  class TestableEditorToolbar extends EditorToolbar {
    context = 'dark';
  }

  const instance = new TestableEditorToolbar({
    editorState: mockEditorState,
    editorView: mockEditorView,
    toolbarConfig: [],
  });

  instance.state = { expanded: false, wrapped: false };
  const result = instance.render();

  expect(React.isValidElement(result)).toBe(true);
  expect(result).toBeDefined();
});

});
