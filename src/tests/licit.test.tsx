/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 *
 * @jest-environment jsdom
 */

import React, {ReactNode} from 'react';
import {unmountComponentAtNode} from 'react-dom';
import * as YWebrtc from 'y-webrtc';
import * as YIndexedDB from 'y-indexeddb';
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
    __mock: {MockIndexeddbPersistence, mockIndexeddbOn},
  };
});

jest.mock('y-webrtc', () => {
  const MockWebrtcProvider = jest.fn().mockImplementation(() => ({}));
  return {WebrtcProvider: MockWebrtcProvider, __mock: {MockWebrtcProvider}};
});

jest.mock('y-protocols/awareness', () => ({
  Awareness: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('lib0/math', () => ({
  floor: jest.fn((x: number) => Math.floor(x)),
}));

// Minimal OrderedMap implementation used by the module
jest.mock('orderedmap', () => {
  class OrderedMap<T = unknown> {
    content: [string, T][];
    map: Record<string, T>;

    constructor(initial?: [string, T][]) {
      this.content = initial ? [...initial] : [];
      this.map = {};

      for (const [key, value] of this.content) {
        this.map[key] = value;
      }
    }

    addToEnd(name: string, spec: T): this {
      if (!this.map[name]) {
        this.content.push([name, spec]);
        this.map[name] = spec;
      }
      return this;
    }

    update(name: string, val: T): this {
      this.map[name] = val;

      const existing = this.content.findIndex((c) => c[0] === name);
      if (existing !== -1) {
        this.content[existing][1] = val;
      } else {
        this.content.push([name, val]);
      }

      return this;
    }

    get(name: string): T | {attrs: Record<string, unknown>} {
      return this.map[name] ?? {attrs: {}};
    }
  }

  return {OrderedMap};
});

// TipTap core
jest.mock('@tiptap/core', () => ({
  Extension: {create: jest.fn(() => ({}))},
  Editor: jest.fn(),
}));

// TipTap react: mock useEditor AND getSchema (returns nodes/marks with get() -> { attrs: {} })
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(),
  getSchema: jest.fn(() => ({
    spec: {
      nodes: {
        get: () => ({attrs: {}}),
      },
      marks: {
        get: () => ({attrs: {}}),
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
  jest.fn().mockImplementation(() => ({get: () => ['pluginA', 'pluginB']}))
);
jest.mock('../convertFromJSON', () => ({
  getEffectiveSchema: jest.fn((s: Schema) => s),
}));
jest.mock('../ui/richTextEditor', () =>
  jest.fn(() => React.createElement('div', {'data-testid': 'rich-text-editor'}))
);
jest.mock('@modusoperandi/licit-ui-commands', () => ({
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  noop: () => {},
  ThemeProvider: ({children}: {children: ReactNode}) =>
    React.createElement('div', {}, children),
}));
jest.mock(
  'classnames',
  () =>
    (...args: string[]) =>
      args.filter(Boolean).join(' ')
);

// --------------------
// Import module under test AFTER mocks
// --------------------
import * as LicitModule from '../licit';
import {Schema} from 'prosemirror-model';

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
    const ref: {
      collaboration: boolean;
      currentUser: Record<string, unknown> | null;
    } = {collaboration: false, currentUser: null};

    const webrtcMock = (YWebrtc as typeof webrtcMock).__mock;
    const idbMock = (YIndexedDB as typeof idbMock).__mock;
    LicitModule.configCollab('doc-123', 'inst-1', ref, 'https://fake');

    expect(ref.collaboration).toBe(true);
    expect(ref.currentUser).not.toBeNull();
    expect(ref.currentUser.name).toBe('inst-1');
    expect(typeof ref.currentUser.color).toBe('string');

    expect(idbMock.MockIndexeddbPersistence).toHaveBeenCalledWith(
      'doc-123',
      expect.anything()
    );
    expect(idbMock.mockIndexeddbOn).toHaveBeenCalledWith(
      'synced',
      expect.any(Function)
    );
    expect(webrtcMock.MockWebrtcProvider).toHaveBeenCalled();
  });
  
});
