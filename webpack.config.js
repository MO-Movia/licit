/*eslint-disable */

var webpack = require('webpack'),
  CleanWebpackPlugin = require('clean-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  FlowWebpackPlugin = require('flow-webpack-plugin'),
  HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  WriteFilePlugin = require('write-file-webpack-plugin');
env = require('./utils/env'),
  fileSystem = require('fs'),
  path = require('path');

var isDev = env.NODE_ENV === 'development' || 0;
// isDev = false;

var options = {
  entry: {
    licit: path.join(__dirname, 'licit', 'client', 'index.js'),
  },
  output: {
    path: path.join(__dirname, 'bin'),
    filename: '[name].bundle.js'
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
          presets: [['env', { 'targets': { 'node': true } }], 'react', 'flow'],
          plugins: [
            'transform-export-extensions',
            'transform-class-properties',
            [
              'transform-runtime',
              {
                helpers: true,
                polyfill: true,
                regenerator: true,
              },
            ],
            'flow-react-proptypes',
            'transform-object-rest-spread',
            'transform-flow-strip-types',
            'syntax-dynamic-import',
          ],
        },
      },

      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/
      },
      {
        test: /mathquill\.js$/,
        include: [/node-mathquill/],
        // Grab the MathQuill export
        // NOTE: window.jQuery needs to be provided through the providePlugin
        // unless https://github.com/webpack/imports-loader/pull/21 is merged
        use: ['exports-loader?MathQuill'],
      },
    ]
  },
  resolve: {
    alias: {}
  },
  plugins: [
    new webpack.ProvidePlugin({
      // jQuery (for Mathquill)
      'window.jQuery': 'jquery',
    }),
    new FlowWebpackPlugin(),
    // clean the web folder
    new CleanWebpackPlugin(['bin']),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'licit', 'index.html'),
      filename: 'index.html',
      chunks: ['licit'],
      inlineSource: isDev ? '$^' : '.(js|css)$'
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new WriteFilePlugin()
  ]
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-eval-source-map';
} else {
  options.plugins.push(new UglifyJsPlugin());
}

module.exports = options;
