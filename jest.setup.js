// setup for jest because jquery is needed by node-mathquill
// window.jQuery = require('jquery');

// needed to mock this due to execute during loading
document.execCommand = document.execCommand || function execCommandMock() {};

// indexedDB mock
require('fake-indexeddb/auto');

// mock fonts API
    Object.defineProperty(document, 'fonts', {
      value: {
        ready: Promise.resolve({}),
        check: jest.fn().mockReturnValue(true),
        status: 'loaded',
        values: jest.fn(() => [ // returns existing fonts
          { family: 'Roboto-Regular' },
          { family: 'Roboto-Bold' },
          { family: 'Arial' }
        ])
      },
      writable: true,
      configurable: true, // Allows redefining in tests
    });
