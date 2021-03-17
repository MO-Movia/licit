// setup for jest because jquery
window.jQuery = require('jquery');

global.document.execCommand =
  global.document.execCommand || function execCommandMock() {};
