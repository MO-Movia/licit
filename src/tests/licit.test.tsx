/**
 * @jest-environment jsdom
 */

import React from 'react';
import { unmountComponentAtNode } from 'react-dom';

// --------------------
// Mocks (hoisted)
// --------------------

jest.mock('lib0/random', () => ({
  rand: jest.fn(() => 0.5),
  uuidv4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('yjs', () => ({
  Doc: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('y-indexeddb', () => {
  const mockIndexeddbOn = jest.fn();
  const MockIndexeddbPersistence = jest.fn().mockImplementation(() => ({
    on: mockIndexeddbOn,
  }));
  return {
    IndexeddbPersistence: MockIndexeddbPersistence,
    __mock: { MockIndexeddbPersistence, mockIndexeddbOn },
  };
});

jest.mock('y-webrtc', () => {
  const MockWebrtcProvider = jest.fn().mockImplementation(() => ({}));
  return { WebrtcProvider: MockWebrtcProvider, __mock: { MockWebrtcProvider } };
});

jest.mock('y-protocols/awareness', () => ({
  Awareness: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('lib0/math', () => ({
  floor: jest.fn((x: number) => Math.floor(x)),
}));

// Minimal OrderedMap implementation used by the module
jest.mock('orderedmap', () => {
  return {
    OrderedMap: class {
      content: any[];
      map: Record<string, any>;
      constructor(initial?: any[]) {
        this.content = initial ? [...initial] : [];
        this.map = {};
        for (let i = 0; i < this.content.length; i += 2) {
          this.map[this.content[i]] = this.content[i + 1];
        }
      }
      addToEnd(name: string, spec: any) {
        if (!this.map[name]) {
          this.content.push(name, spec);
          this.map[name] = spec;
        }
        return this;
      }
      update(name: string, val: any) {
        this.map[name] = val;
        for (let i = 0; i < this.content.length; i += 2) {
          if (this.content[i] === name) {
            this.content[i + 1] = val;
            return this;
          }
        }
        this.content.push(name, val);
        return this;
      }
      get(name: string) {
        return this.map[name] || { attrs: {} };
      }
    },
  };
});

// TipTap core
jest.mock('@tiptap/core', () => ({
  Extension: { create: jest.fn(() => ({})) },
  Editor: jest.fn(),
}));

// TipTap react: mock useEditor AND getSchema (returns nodes/marks with get() -> { attrs: {} })
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(),
  getSchema: jest.fn(() => ({
    spec: {
      nodes: {
        get: () => ({ attrs: {} }),
      },
      marks: {
        get: () => ({ attrs: {} }),
      },
    },
  })),
}));

// TipTap extensions � inline factories with create/configure so licit won't crash
jest.mock('@tiptap/starter-kit', () => ({
  create: jest.fn(() => ({})),
  configure: jest.fn(() => ({})),
}));
jest.mock('@tiptap/extension-underline', () => ({
  create: jest.fn(() => ({})),
  configure: jest.fn(() => ({})),
}));
jest.mock('@tiptap/extension-subscript', () => ({
  create: jest.fn(() => ({})),
  configure: jest.fn(() => ({})),
}));
jest.mock('@tiptap/extension-superscript', () => ({
  create: jest.fn(() => ({})),
  configure: jest.fn(() => ({})),
}));
jest.mock('@tiptap/extension-text-align', () => ({
  create: jest.fn(() => ({})),
  configure: jest.fn(() => ({})),
}));
jest.mock('@tiptap/extension-table', () => ({
  create: jest.fn(() => ({})),
  configure: jest.fn(() => ({})),
}));
jest.mock('@tiptap/extension-table-row', () => ({
  create: jest.fn(() => ({})),
  configure: jest.fn(() => ({})),
}));
jest.mock('@tiptap/extension-table-cell', () => ({
  create: jest.fn(() => ({})),
  configure: jest.fn(() => ({})),
}));
jest.mock('@tiptap/extension-table-header', () => ({
  create: jest.fn(() => ({})),
  configure: jest.fn(() => ({})),
}));

// project custom ext
jest.mock('../extensions/tableCellEx', () => ({}));

// supporting mocks
jest.mock('../defaultEditorPlugins', () =>
  jest.fn().mockImplementation(() => ({ get: () => ['pluginA', 'pluginB'] }))
);
jest.mock('../convertFromJSON', () => ({ getEffectiveSchema: jest.fn((s: any) => s) }));
jest.mock('../ui/richTextEditor', () => jest.fn(() => React.createElement('div', { 'data-testid': 'rich-text-editor' })));
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  noop: () => {},
  ThemeProvider: ({ children }: any) => React.createElement('div', {}, children),
}));
jest.mock('classnames', () => (...args: any[]) => args.filter(Boolean).join(' '));

// --------------------
// Import module under test AFTER mocks
// --------------------
import * as LicitModule from '../licit';

// --------------------
// DOM helpers
// --------------------
let container: HTMLDivElement | null = null;



// --------------------
// Tests
// --------------------
describe('Licit module overall behaviour', () => {

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  if (container) {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  }
  jest.clearAllMocks();
});

  it('configCollab sets up collaboration + IndexedDB persistence', () => {
    const ref: any = { collaboration: false, currentUser: null };

    const { __mock: idbMock } = require('y-indexeddb');
    const { __mock: webrtcMock } = require('y-webrtc');

    LicitModule.configCollab('doc-123', 'inst-1', ref, 'https://fake');

    expect(ref.collaboration).toBe(true);
    expect(ref.currentUser).not.toBeNull();
    expect(ref.currentUser.name).toBe('inst-1');
    expect(typeof ref.currentUser.color).toBe('string');

    expect(idbMock.MockIndexeddbPersistence).toHaveBeenCalledWith('doc-123', expect.anything());
    expect(idbMock.mockIndexeddbOn).toHaveBeenCalledWith('synced', expect.any(Function));
    expect(webrtcMock.MockWebrtcProvider).toHaveBeenCalled();
  });

  it('updateSpecAttrs merges new attributes', () => {
    // existingSchema.spec.nodes.content must be an array [name, spec, ...]
    const existingSchema: any = {
      spec: {
        nodes: {
          content: ['para', { attrs: { a: 1 } }],
        },
      },
    };
    const collection = ['para', { attrs: { b: 2 } }];
    LicitModule.updateSpecAttrs(0, collection as any, existingSchema, 'nodes');
    expect(existingSchema.spec.nodes.content[1].attrs).toEqual({ a: 1, b: 2 });
  });
});
