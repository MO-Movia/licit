import { createWebpackAliases } from './webpack.helpers.js';

/**
 * Export Webpack Aliases
 *
 * Tip: Some text editors will show errors or invalid IntelliSense reports
 * based on these webpack aliases. Make sure to update the `tsconfig.json` file
 * to match the `paths` we use here for aliases in the project.
 */
const aliases = createWebpackAliases({
  '@assets': 'assets',
  '@src': 'src',
});

export default aliases;
