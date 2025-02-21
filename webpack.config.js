 

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import path, { dirname } from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { fileURLToPath } from 'url';

import env from './utils/env.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// [FS] IRAD-1005 2020-07-07
// Upgrade outdated packages.

var isDev = env.NODE_ENV === 'development' || 0;
// isDev = false;

var options = {
  mode: env.NODE_ENV,
  entry: {
    licit: path.join(__dirname, 'licit', 'client', 'index.js'),
  },
  output: {
    path: path.join(__dirname, 'bin'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // https://stackoverflow.com/questions/51860043/javascript-es6-typeerror-class-constructor-client-cannot-be-invoked-without-ne
          // ES6 classes are supported in any recent Node version, they shouldn't be transpiled. es2015 should be excluded from Babel configuration, it's preferable to use env preset set to node target.
          presets: [
            ['@babel/preset-env', { targets: { node: true } }],
            '@babel/preset-react',
            '@babel/preset-flow',
          ],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-export-default-from',
            [
              '@babel/plugin-transform-runtime',
              {
                helpers: true,
                regenerator: true,
              },
            ],
            'flow-react-proptypes',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-transform-flow-strip-types',
            '@babel/plugin-syntax-dynamic-import',
          ],
        },
      },
      {
        test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|mjs|jsx)$/,
        include: /node_modules/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    alias: {},
  },
  plugins: [
    new webpack.ProvidePlugin({}),
    // type checker
    // ... (isDev ? [new FlowWebpackPlugin({flowArgs: ['--show-all-errors']})] : []),
    // clean the web folder
    new CleanWebpackPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'licit', 'index.html'),
      filename: 'index.html',
      chunks: ['licit'],
      inlineSource: isDev ? '$^' : '.(js|css)$',
    }),
  ],
  performance: {
    assetFilter: function (assetFilename) {
      return (
        !assetFilename.endsWith('.eot') &&
        !assetFilename.endsWith('.ttf') &&
        !assetFilename.endsWith('.svg') &&
        !assetFilename.endsWith('licit.bundle.js')
      );
    },
  },
};

if (isDev) {
  options.devtool = 'source-map';
} else {
  // [FS] IRAD-1005 2020-07-10
  // Upgrade outdated packages.
  options.optimization = {
    minimize: true,
    minimizer: [new TerserPlugin()],
  };
}

export default options;
