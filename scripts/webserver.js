/*eslint-env node*/

import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import config from '../webpack.config';
import env from './env';
import path from 'path';

const options = config.chromeExtensionBoilerplate || {};
const excludeEntriesToHotReload = options.notHotReload || [];

for (const entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] = [
      'webpack-dev-server/client?http://localhost:' + env.PORT,
      'webpack/hot/dev-server',
    ].concat(config.entry[entryName]);
  }
}

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
  config.plugins || []
);

delete config.chromeExtensionBoilerplate;

const compiler = webpack(config);

const server = new WebpackDevServer(compiler, {
  hot: true,
  contentBase: path.join(__dirname, '../build'),
  headers: {'Access-Control-Allow-Origin': '*'},
});

server.listen(env.PORT);
