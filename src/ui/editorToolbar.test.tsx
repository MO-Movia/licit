import React from 'react';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import EditorToolbar from './editorToolbar';
import { ThemeContext, CustomButton } from '@modusoperandi/licit-ui-commands';
import { EditorState } from 'prosemirror-state';
import { EditorViewEx } from '../constants';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { COMMAND_GROUPS, parseLabel } from './editorToolbarConfig';
import '@testing-library/jest-dom';
import isReactClass from '../isReactClass';
import { TABLE_INSERT_TABLE } from '../editorCommands';
import ReactDOM from 'react-dom';
import ResizeObserver from '../resizeObserver';

jest.mock('../resizeObserver', () => ({
  ...jest.requireActual('../resizeObserver'),
  observe: jest.fn(),
  unobserve: jest.fn(),
}));

jest.mock('@modusoperandi/licit-ui-commands', () => ({
  ...jest.requireActual('@modusoperandi/licit-ui-commands'),
  createPopUp: jest.fn().mockReturnValue({ close: jest.fn(), update: jest.fn() }),
  CustomButton: jest.fn(() => (
    <div className="czi-custom-button">
      Mocked Custom Button
    </div>
  ))
}));

// Mock the CommandMenuButton and Icon components
jest.mock('./commandMenuButton', () => ({
  __esModule: true,
  default: ({ commandGroups, dispatch, editorState, editorView, icon, title }: any) => (
    <div className='czi-custom-menu-button'>
      Command Menu Button
    </div>
  ),
}));

jest.mock('./commandButton', () => ({
  __esModule: true,
  default: ({ commandGroups, dispatch, editorState, editorView, icon, title }: any) => (
    <div className='czi-custom-submenu-button'>
      Command Menu Button
    </div>
  ),
}));

jest.mock('./editorToolbarConfig', () => ({
  ...jest.requireActual('./editorToolbarConfig'),
  COMMAND_GROUPS: []
}));

jest.mock('../isReactClass', () => ({
  __esModule: true,  // Ensures the mock respects ES module default exports
  default: jest.fn().mockReturnValue(false) // Mocks the default export
}));

describe('EditorToolbar', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
    cleanup();
  });
let componentInstance;
let findDOMNodeMock: jest.Mock;

const mockToolbarConfig = [
  {
    key: 'bold',
    label: 'Bold',
    menuCommand: 'boldCommand', // Sample command for bold
    menuPosition: 1,
    group: "test",
    isPlugin: true
  },
  {
    key: 'italic',
    label: 'Italic',
    menuCommand: 'italicCommand', // Sample command for italic
    menuPosition: 2,
    group: "test"
  },
];

// Mock component for ThatComponent
const MockComponent = {
  'button1': jest.fn().mockImplementation(() => () => <div>Mocked Component</div>)
};
  const mockEditorState = {
    plugins: [{key: 'bold', initButtonCommands: jest.fn().mockReturnValue(MockComponent)}],
  } as unknown as EditorState;

  const mockEditorView = {
    dom: document.createElement('div'),
  } as unknown as EditorViewEx;

  const mockDispatchTransaction = jest.fn();

  const mockTheme = 'light';

  beforeEach(() => {
    componentInstance = new EditorToolbar({
      editorState:mockEditorState,
      editorView:mockEditorView,
      dispatchTransaction:mockDispatchTransaction,
      toolbarConfig:mockToolbarConfig});

          // Mock ReactDOM.findDOMNode
    findDOMNodeMock = jest.fn();
    ReactDOM.findDOMNode = findDOMNodeMock;
  });

  it('Should append a wrapped class name if it is wrapped', () => {

    componentInstance.state = {
        expanded: false,
        wrapped: true,
      };
      componentInstance.context = 'dark';
     const result = componentInstance.render();

    expect(result.props.className).toEqual('czi-editor-toolbar wrapped');
  });

  it('renders toolbar buttons based on toolbarConfig', () => {
    const {container} = render(
      <ThemeContext.Provider value={mockTheme}>
        <EditorToolbar
          editorState={mockEditorState}
          editorView={mockEditorView}
          dispatchTransaction={mockDispatchTransaction}
          toolbarConfig={mockToolbarConfig}
        />
      </ThemeContext.Provider>
    );
    expect(container.innerHTML).toContain('czi-editor-toolbar')
  });

  it('renders toolbar buttons if toolbarConfig is empty', () => {
    const {container} = render(
      <ThemeContext.Provider value={mockTheme}>
        <EditorToolbar
          editorState={mockEditorState}
          editorView={mockEditorView}
          dispatchTransaction={mockDispatchTransaction}
          toolbarConfig={[]}
        />
      </ThemeContext.Provider>
    );
    expect(container.innerHTML).toContain('czi-editor-toolbar')
  });

  it('renders toolbar should return component if isReactClass true', () => {
    // Mock implementation to return false for this case
    (isReactClass as jest.Mock).mockReturnValue(true); 

    const {container, getByText} = render(
      <ThemeContext.Provider value={mockTheme}>
        <EditorToolbar
          editorState={mockEditorState}
          editorView={mockEditorView}
          dispatchTransaction={mockDispatchTransaction}
          toolbarConfig={mockToolbarConfig}
        />
      </ThemeContext.Provider>
    );
    expect(container.innerHTML).toContain('czi-editor-toolbar');
  });

  it('should render menu button if the plugin is UICommand', () => {
        // Mock implementation to return false for this case
    (isReactClass as jest.Mock).mockReturnValue(false); 
    const testMockComponent = {
              'Insert Table...': TABLE_INSERT_TABLE,
            };
    const testmockEditorState = {
      plugins: [{key: 'bold', initButtonCommands: jest.fn().mockReturnValue(testMockComponent)}],
    } as unknown as EditorState;


    const {container, getByText} = render(
      <ThemeContext.Provider value={mockTheme}>
        <EditorToolbar
          editorState={testmockEditorState}
          editorView={mockEditorView}
          dispatchTransaction={mockDispatchTransaction}
          toolbarConfig={mockToolbarConfig}
        />
      </ThemeContext.Provider>
    );
    expect(container.innerHTML).toContain('czi-editor-toolbar');
    expect(getByText('Command Menu Button')).toBeDefined();
  });

  it('should render menu button if the plugin is Array', () => {
    // Mock implementation to return false for this case
(isReactClass as jest.Mock).mockReturnValue(false); 
const testMockComponent = {
          'Insert Table...': [{'Insert Table...': TABLE_INSERT_TABLE}],
        };
const testmockEditorState = {
  plugins: [{key: 'bold', initButtonCommands: jest.fn().mockReturnValue(testMockComponent)}],
} as unknown as EditorState;


const {container, getByText} = render(
  <ThemeContext.Provider value={mockTheme}>
    <EditorToolbar
      editorState={testmockEditorState}
      editorView={mockEditorView}
      dispatchTransaction={mockDispatchTransaction}
      toolbarConfig={mockToolbarConfig}
    />
  </ThemeContext.Provider>
);
expect(container.innerHTML).toContain('czi-editor-toolbar');
expect(getByText('Command Menu Button')).toBeDefined();
});





it('renders toolbar should return component if isReactClass true', () => {
  // Mock implementation to return false for this case
  (isReactClass as jest.Mock).mockReturnValue(true); 

  const {container, getByText} = render(
    <ThemeContext.Provider value={mockTheme}>
      <EditorToolbar
        editorState={mockEditorState}
        editorView={mockEditorView}
        dispatchTransaction={mockDispatchTransaction}
        toolbarConfig={[]}
      />
    </ThemeContext.Provider>
  );
  expect(container.innerHTML).toContain('czi-editor-toolbar');
});

it('should render menu button if the plugin is UICommand', () => {
      // Mock implementation to return false for this case
  (isReactClass as jest.Mock).mockReturnValue(false); 
  const testMockComponent = {
            'Insert Table...': TABLE_INSERT_TABLE,
          };
  const testmockEditorState = {
    plugins: [{key: 'bold', initButtonCommands: jest.fn().mockReturnValue(testMockComponent)}],
  } as unknown as EditorState;


  const {container, getByText} = render(
    <ThemeContext.Provider value={mockTheme}>
      <EditorToolbar
        editorState={testmockEditorState}
        editorView={mockEditorView}
        dispatchTransaction={mockDispatchTransaction}
        toolbarConfig={[]}
      />
    </ThemeContext.Provider>
  );
  expect(container.innerHTML).toContain('czi-editor-toolbar');
  expect(getByText('Command Menu Button')).toBeDefined();
});

it('should render menu button if the plugin is Array', () => {
  // Mock implementation to return false for this case
(isReactClass as jest.Mock).mockReturnValue(false); 
const testMockComponent = {
        'Insert Table...': [{'Insert Table...': TABLE_INSERT_TABLE}],
      };
const testmockEditorState = {
plugins: [{key: 'bold', initButtonCommands: jest.fn().mockReturnValue(testMockComponent)}],
} as unknown as EditorState;


const {container, getByText} = render(
<ThemeContext.Provider value={mockTheme}>
  <EditorToolbar
    editorState={testmockEditorState}
    editorView={mockEditorView}
    dispatchTransaction={mockDispatchTransaction}
    toolbarConfig={[]}
  />
</ThemeContext.Provider>
);
expect(container.innerHTML).toContain('czi-editor-toolbar');
expect(getByText('Command Menu Button')).toBeDefined();
});

it('should call observe when ref is provided', () => {
  // Mock a ref object
  const ref = { current: {} };
  const mockElement = document.createElement('div');
  findDOMNodeMock.mockReturnValue(mockElement);  // Mocking the return value of findDOMNode

  // Call _onBodyRef with a ref (mounting)
  componentInstance._onBodyRef(ref as unknown as React.ReactInstance);

  // Check that observe is called with the correct arguments
  expect(ResizeObserver.observe).toHaveBeenCalledWith(mockElement, componentInstance._checkIfContentIsWrapped);
});

it('should call unobserve when ref is null (unmounting)', () => {
  const mockElement = document.createElement('div');
  findDOMNodeMock.mockReturnValue(mockElement);

  // Call _onBodyRef with ref (mounting)
  componentInstance._onBodyRef({ current: {} } as unknown as React.ReactInstance);

  // Call _onBodyRef with null (unmounting)
  componentInstance._onBodyRef(null);

  // Check that unobserve is called with the correct arguments
  expect(ResizeObserver.unobserve).toHaveBeenCalledWith(mockElement);
});

it('should handle null ref correctly (initial case)', () => {
  // Initial case where ref is null, the observer should not be called
  componentInstance._onBodyRef(null);
  expect(ResizeObserver.unobserve).not.toHaveBeenCalled();
});

it('should set the wrapped state correctly when content is wrapped', () => {
  // Mocking the DOM structure
  const mockElement = document.createElement('div');
  const startAnchor = document.createElement('div');
  const endAnchor = document.createElement('div');

// Mocking offsetTop using Object.defineProperty to simulate the DOM property
Object.defineProperty(startAnchor, 'offsetTop', { value: 10 });
Object.defineProperty(endAnchor, 'offsetTop', { value: 20 });

  mockElement.appendChild(startAnchor);
  mockElement.appendChild(endAnchor);

  // Mock ReactDOM.findDOMNode to return the mock element
  findDOMNodeMock.mockReturnValue(mockElement);

  componentInstance._body = mockElement;

  componentInstance.setState = jest.fn();

  // Call _checkIfContentIsWrapped method
  componentInstance._checkIfContentIsWrapped();

  // Assert that setState was called with the correct wrapped value
  expect(componentInstance.setState).toHaveBeenCalledWith({ wrapped: true });
});

it('should set the wrapped state correctly when content is not wrapped', () => {
  // Mocking the DOM structure
  const mockElement = document.createElement('div');
  const startAnchor = document.createElement('div');
  const endAnchor = document.createElement('div');

  mockElement.appendChild(startAnchor);
  mockElement.appendChild(endAnchor);

  mockElement.appendChild(startAnchor);
  mockElement.appendChild(endAnchor);

  // Mock ReactDOM.findDOMNode to return the mock element
  findDOMNodeMock.mockReturnValue(mockElement);

  componentInstance._body = mockElement;

  componentInstance.setState = jest.fn();

  // Call _checkIfContentIsWrapped method
  componentInstance._checkIfContentIsWrapped();

  // Assert that setState was called with the correct wrapped value
  expect(componentInstance.setState).toHaveBeenCalledWith({ wrapped: false });
});

it('should not update the state if no startAnchor or endAnchor exists', () => {
  // Mocking the DOM structure with missing children
  const mockElement = document.createElement('div');

  // Mock ReactDOM.findDOMNode to return the mock element with no children
  findDOMNodeMock.mockReturnValue(mockElement);

  componentInstance._body = mockElement;

  componentInstance.setState = jest.fn();

  // Call _checkIfContentIsWrapped method
  componentInstance._checkIfContentIsWrapped();

  // Assert that setState was NOT called (state shouldn't change)
  expect(componentInstance.setState).not.toHaveBeenCalled();
});

it('should handle null or undefined _body gracefully', () => {
  // Set _body to null or undefined (e.g., unmounted component)
  componentInstance._body = null;

  componentInstance.setState = jest.fn();

  // Call _checkIfContentIsWrapped method
  componentInstance._checkIfContentIsWrapped();

  // Assert that setState was NOT called (state shouldn't change)
  expect(componentInstance.setState).not.toHaveBeenCalled();
});

it('should toggle expanded state from true to false', () => {
  componentInstance.setState = jest.fn();
  // Call _toggleExpansion with expanded as true
  componentInstance._toggleExpansion(true);

  // Assert that setState was called with expanded: false
  expect(componentInstance.setState).toHaveBeenCalledWith({ expanded: false });
});

it('should toggle expanded state from false to true', () => {
  componentInstance.setState = jest.fn();
  // Call _toggleExpansion with expanded as false
  componentInstance._toggleExpansion(false);

  // Assert that setState was called with expanded: true
  expect(componentInstance.setState).toHaveBeenCalledWith({ expanded: true });
});

});
