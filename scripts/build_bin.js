/*eslint-env node*/

import webpack from 'webpack';
import config from '../webpack.config';

delete config.chromeExtensionBoilerplate;

webpack(config, function(err) {
  if (err) throw err;
});
