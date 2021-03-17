// setup for jest because jquery is needed by node-mathquill
window.jQuery = require('jquery');


document.execCommand =
  document.execCommand || function execCommandMock() {};
