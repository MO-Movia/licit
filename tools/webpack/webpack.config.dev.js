import rules from './webpack.rules.js';
import plugins from './webpack.plugins.js';
import aliases from './webpack.aliases.js';

const config = {
  mode: 'development',
  entry: ['./licit/client/index.tsx'],
  module: {
    rules,
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: aliases,
  },
  stats: 'errors-warnings',
  devtool: 'cheap-module-source-map',
  devServer: {
    open: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  performance: {
    hints: false,
  },
};

export default config;
