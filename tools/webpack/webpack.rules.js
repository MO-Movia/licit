import { inDev } from './webpack.helpers.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const rules = [
  {
    // TypeScript loader
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
  {
    // CSS Loader
    test: /\.css$/,
    use: [
      { loader: inDev() ? 'style-loader' : MiniCssExtractPlugin.loader },
      { loader: 'css-loader' },
    ],
  },
  {
    // SCSS (SASS) Loader
    test: /\.s[ac]ss$/i,
    use: [
      { loader: inDev() ? 'style-loader' : MiniCssExtractPlugin.loader },
      { loader: 'css-loader' },
      { loader: 'sass-loader' },
    ],
  },
  {
    // Less loader
    test: /\.less$/,
    use: [
      { loader: inDev() ? 'style-loader' : MiniCssExtractPlugin.loader },
      { loader: 'css-loader' },
      { loader: 'less-loader' },
    ],
  },
  {
    test: /\.(gif|jpe?g|tiff|png|webp|bmp|eot|ttf|woff|woff2)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'assets/[name][ext][query]', // No hash, keeps original file names
    },
  },
  {
    test: /\.svg$/i,
    oneOf: [
      {
        issuer: /\.[jt]sx?$/,
        resourceQuery: /raw/, // Usage: import icon from './icon.svg?raw';
        type: 'asset/source',
      },
      {
        type: 'asset/resource',
        generator: {
          filename: 'assets/[path][name][ext]',
        },
      },
    ],
  },

  {
    test: /\.(js|mjs|jsx)$/,
    include: /node_modules/,
    type: 'javascript/auto',
    resolve: {
      fullySpecified: false,
    },
  },
];

export default rules;
