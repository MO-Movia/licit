import webpack from 'webpack';
import {inDev} from './webpack.helpers.js';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
// import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

const plugins = [
  new ForkTsCheckerWebpackPlugin(),
  inDev() && new webpack.HotModuleReplacementPlugin(),
  // inDev() && new ReactRefreshWebpackPlugin(),
  new HtmlWebpackPlugin({
    template: './licit/index.html',
    favicon: '',
    inject: true,
  }),
  new MiniCssExtractPlugin({
    filename: '[name].[chunkhash].css',
    chunkFilename: '[name].[chunkhash].chunk.css',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {from: 'src/assets', to: 'assets', noErrorOnMissing: true},
      // Copy from your library modules
      {
        from: 'node_modules/@modusoperandi/licit-export-pdf/assets/images',
        to: 'assets/images',
        noErrorOnMissing: true, // Don't fail if path doesn't exist
      },
      {
        from: 'node_modules/@modusoperandi/licit-multimedia/assets/images',
        to: 'assets/images',
        noErrorOnMissing: true, // Don't fail if path doesn't exist
      },
      {
        from: 'node_modules/@modusoperandi/licit-vignette/assets/images',
        to: 'assets/images',
        noErrorOnMissing: true, // Don't fail if path doesn't exist
      },
      {
        from: 'node_modules/@modusoperandi/licit-changecase/assets/images',
        to: 'assets/images',
        noErrorOnMissing: true, // Don't fail if path doesn't exist
      },
      {
        from: 'node_modules/@modusoperandi/licit-citation/assets/images',
        to: 'assets/images',
        noErrorOnMissing: true, // Don't fail if path doesn't exist
      },
      {
        from: 'node_modules/@modusoperandi/licit-glossary/assets/images',
        to: 'assets/images',
        noErrorOnMissing: true, // Don't fail if path doesn't exist
      },
      {
        from: 'node_modules/@modusoperandi/licit-info-icon/assets/images',
        to: 'assets/images',
        noErrorOnMissing: true, // Don't fail if path doesn't exist
      },
    ],
  }),
].filter(Boolean);

export default plugins;
