// @flow

import EditorSchema from './EditorSchema';
import DefaultEditorPlugins from './buildEditorPlugins';

// Plugin
const EditorPlugins = new DefaultEditorPlugins(EditorSchema);
export default EditorPlugins;
