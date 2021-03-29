// setup for jest because jquery is needed by node-mathquill
window.jQuery = require('jquery');
// needed to mock this due to execute during loading
document.execCommand =
  document.execCommand || function execCommandMock() {};
