import webpack from 'webpack';
import config from '../webpack.config.js';

delete config.chromeExtensionBoilerplate;

webpack(
  config,
  function (err) { if (err) throw err; }
);
