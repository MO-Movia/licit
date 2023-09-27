// @flow

import EditorSchema from './EditorSchema.js';
import DefaultEditorPlugins from './buildEditorPlugins.js';

// Plugin
const EditorPlugins = new DefaultEditorPlugins(EditorSchema);
export default EditorPlugins;
