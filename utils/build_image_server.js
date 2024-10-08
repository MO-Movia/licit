import webpack from 'webpack';
import  { CleanWebpackPlugin } from 'clean-webpack-plugin';
//import FlowWebpackPlugin from 'flow-webpack-plugin';
import WriteFilePlugin from 'write-file-webpack-plugin';

import env from './env'; 
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  mode: 'production',//development
  entry: {
    run_image_server: path.join(__dirname, '../licit', 'server/image', 'start.js'),
  },
  target: 'node',
  output: {
    path: path.join(__dirname, '../servers/image'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', { 'targets': { 'esmodules': true } }], '@babel/preset-react', '@babel/preset-flow'],
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
    ],
  },
  plugins: [
    // type checker
    // ... (env.NODE_ENV === 'development') ? [new FlowWebpackPlugin()] : [],
    // To take care of formidable.
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    // clean the web folder
    new CleanWebpackPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
    }),
    new WriteFilePlugin(),
  ],
  // to enable debug
  //devtool: 'source-map'
};

webpack(
  config,
  function (err) {
    if (err) {
      throw err;
    }
  }
);

// To take care of formidable.
export default config;
