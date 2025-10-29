import * as React from 'react';
import * as ReactDOM from 'react-dom';
import EditorFrameset, { FRAMESET_BODY_CLASSNAME } from './editorFrameset';

//  Mock ThemeContext to avoid actual dependency
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  ThemeContext: React.createContext('mock-theme'),
}));

describe('EditorFrameset (pure Jest)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  });

  it('renders with base class and default layout', () => {
    ReactDOM.render(<EditorFrameset />, container);
    const root = container.querySelector('.czi-editor-frameset');
    expect(root).not.toBeNull();
    expect(root!.classList.contains('with-fixed-layout')).toBe(false);
  });

  it('adds with-fixed-layout when width or height is specified', () => {
    ReactDOM.render(<EditorFrameset width={50} />, container);
    const root = container.querySelector('.czi-editor-frameset');
    expect(root).not.toBeNull();
    expect(root!.classList.contains('with-fixed-layout')).toBe(true);
    expect(root!.getAttribute('style')).toContain('width: 50vh;');
  });

  it('applies embedded class when embedded prop is true', () => {
    ReactDOM.render(<EditorFrameset embedded />, container);
    const root = container.querySelector('.czi-editor-frameset');
    expect(root!.classList.contains('embedded')).toBe(true);
  });

  it('renders header and toolbar in the header section by default', () => {
    const headerEl = <div id="header">Header</div>;
    const toolbarEl = <div id="toolbar">Toolbar</div>;
    ReactDOM.render(<EditorFrameset header={headerEl} toolbar={toolbarEl} />, container);

    const head = container.querySelector('.czi-editor-frame-head');
    expect(head!.querySelector('#header')).not.toBeNull();
    expect(head!.querySelector('#toolbar')).not.toBeNull();
  });

  it('renders toolbar inside body when toolbarPlacement="body"', () => {
    const toolbarEl = <div id="toolbar">Toolbar</div>;
    ReactDOM.render(<EditorFrameset toolbar={toolbarEl} toolbarPlacement="body" />, container);

    const body = container.querySelector(`.${FRAMESET_BODY_CLASSNAME}`);
    expect(body!.querySelector('#toolbar')).not.toBeNull();
  });

  it('renders body content correctly', () => {
    const bodyEl = <div id="body-content">Content</div>;
    ReactDOM.render(<EditorFrameset body={bodyEl} />, container);

    const scrollContainer = container.querySelector('.czi-editor-frame-body-scroll');
    expect(scrollContainer!.querySelector('#body-content')).not.toBeNull();
  });

  it('applies theme class from context', () => {
    // Create a custom theme context provider
    const ThemeProvider = require('@modusoperandi/licit-ui-commands').ThemeContext.Provider;
    ReactDOM.render(
      <ThemeProvider value="dark-theme">
        <EditorFrameset />
      </ThemeProvider>,
      container
    );
    const head = container.querySelector('.czi-editor-frame-head');
    expect(head!.classList.contains('dark-theme')).toBe(true);
  });
});

