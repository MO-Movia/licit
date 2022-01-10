// needed to mock this due to execute during loading
document.execCommand =
  document.execCommand || function execCommandMock() {};
