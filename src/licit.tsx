import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import { Extension, Editor } from '@tiptap/core';
import { EditorEvents, getSchema, JSONContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './styles/licit.css';
import Underline from '@tiptap/extension-underline';
import { v4 as uuidv4 } from 'uuid';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import RichTextEditor from './ui/richTextEditor';
import DefaultEditorPlugins from './defaultEditorPlugins';
import { Plugin, TextSelection } from 'prosemirror-state';
import { getEffectiveSchema } from './convertFromJSON';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Schema, NodeSpec } from 'prosemirror-model';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { HEADING, noop, PARAGRAPH, ThemeProvider } from '@modusoperandi/licit-ui-commands';
import { updateEditorMarks } from './editorMarks';
import { updateEditorNodes } from './editorNodes';
import OrderedMap from 'orderedmap';
import { Indent } from './extensions/indent';
import { WebrtcProvider } from 'y-webrtc';
import { EditorRuntime, ToolbarMenuConfig } from './types';
import { EditorViewEx } from './constants';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCellEx from './extensions/tableCellEx';
import TableHeader from '@tiptap/extension-table-header';
import ParagraphNodeSpec from './specs/paragraphNodeSpec';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as math from 'lib0/math';
import * as random from 'lib0/random';
import { EditorView } from 'prosemirror-view';
import cx from 'classnames';

/**
 * LICIT properties:
 *  docID {string} [] Collaborative Doument ID
 *  collabServiceURL {string} [/collaboration-service] Collaboration Service URL
 *  debug {boolean} [false] To enable/disable ProseMirror Debug Tools, available only in development.
 *  width {string} [100%] Width of the editor.
 *  height {string} [100%] Height of the editor.
 *  readOnly {boolean} [false] To enable/disable editing mode.
 *  onChange {@callback} [null] Fires after each significant change.
 *  @param data {JSON} Modified document data.
 *  onReady {@callback} [null] Fires when the editor is fully ready.
 *  @param ref {LICIT} Rerefence of the editor.
 *  data {JSON} [null] Document data to be loaded into the editor.
 *  disabled {boolean} [false] Disable the editor.
 *  embedded {boolean} [false] Disable/Enable inline behaviour.
 *  plugins [plugins] External ProseMirror Plugins into the editor.
 *  theme {string} [light] light/dark theme support for toolbar.
 */

export interface ChangeCB {
  (data: JSONContent, isEmpty: boolean, view: EditorView): void;
}

export interface ReadyCB {
  (ref: Editor): void;
}

export interface LicitProps {
  docID?: string;
  collabServiceURL?: string;
  debug?: boolean;
  width?: string;
  height?: string;
  readOnly?: boolean;
  data?: JSONContent;
  disabled?: boolean;
  embedded?: boolean;
  plugins?: Plugin[];
  runtime?: EditorRuntime;
  onChange?: ChangeCB;
  onReady?: ReadyCB;
  theme?: string;
  toolbarConfig?: ToolbarMenuConfig[];
}

const effectiveSchema: Schema = null;
let editorSchema: Schema = null;
let licitPlugins: Extension = null;
let provider = null;
let ydoc: Y.Doc = null;
let devTools: Promise<() => void>;
let applyDevTools;

export const configCollab = (
  docID: string,
  instanceID: string,
  ref: { collaboration: boolean; currentUser: Record<string, unknown> },
  collabServiceURL: string
) => {
  if (docID && 0 < docID.length) {
    ref.collaboration = true;

    if (!provider) {
      let useDefaultProvider = true;
      ydoc = new Y.Doc();
      if (collabServiceURL) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          provider = new WebrtcProvider('tiptap-licit-' + docID, ydoc, {
            signaling: [collabServiceURL],
            password: null,
            awareness: new awarenessProtocol.Awareness(ydoc),
            maxConns: 20 + math.floor(random.rand() * 15),
            filterBcConns: true,
            peerOpts: {},
          });
          useDefaultProvider = false;
        } catch { }
      }

      if (useDefaultProvider) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        provider = new WebrtcProvider('tiptap-licit-' + docID, ydoc);
      }
    }
    const getRandomElement = (list) => {
      return list[Math.floor(Math.random() * list.length)];
    };
    const getRandomColor = () => {
      return getRandomElement([
        '#958DF1',
        '#F98181',
        '#FBBC88',
        '#FAF594',
        '#70CFF8',
        '#94FADB',
        '#B9F18D',
      ]);
    };
    ref.currentUser = {
      name: instanceID,
      color: getRandomColor(),
    };

    // For offline editing, store the Y document in the browser
    const dbProvider = new IndexeddbPersistence(docID, ydoc);

    dbProvider.on('synced', () => {
      //'content from the database is loaded'
    });
  }
};

const prepareEffectiveSchema = (
  defaultExtensions: Extension[],
  plugins: Plugin[]
) => {
  if (!effectiveSchema) {
    const schema = getSchema(defaultExtensions);

    const updateNodeAttrs = (nodeName: string, licitNode: NodeSpec): void => {
      const tiptapNode = (schema.spec.nodes as OrderedMap).get(nodeName);
      const keys = Object.keys(licitNode.attrs);
      keys.forEach((key) => {
        if (!tiptapNode.attrs[key]) {
          tiptapNode.attrs[key] = licitNode.attrs[key];
        }
      });
    };
    updateNodeAttrs(PARAGRAPH, ParagraphNodeSpec);

    const nodes = updateEditorNodes(schema.spec.nodes as OrderedMap);
    const marks = updateEditorMarks(schema.spec.marks as OrderedMap);

    const defaultEditorSchema = new Schema({
      nodes: nodes,
      marks: marks,
    });
    const defaultEditorPlugins = new DefaultEditorPlugins(
      defaultEditorSchema
    ).get();

    editorSchema = getEffectiveSchema(
      defaultEditorSchema,
      defaultEditorPlugins,
      plugins
    );

    licitPlugins = Extension.create({
      addProseMirrorPlugins() {
        return [...defaultEditorPlugins];
      },
    });
  }
};

const updateSpec = (
  schema: Schema,
  attrName: string,
  existingSchema: Schema
) => {
  const keys = Object.keys(schema[attrName]);
  const keysUpdate = [];
  keys.forEach((key) => {
    if (!editorSchema[attrName][key]) {
      editorSchema[attrName][key] = schema[attrName][key];
      keysUpdate.push(key);
    }
  });
  const collection = schema.spec[attrName]['content'];
  // update current array with the latest info
  for (let i = 0; i < collection.length; i += 2) {
    if (keysUpdate.find((element) => element === collection[i])) {
      existingSchema.spec[attrName] = existingSchema.spec[attrName].update(
        collection[i],
        collection[i + 1]
      );
    } else {
      updateSpecAttrs(i, collection, existingSchema, attrName);
    }
  }
};

export const updateSpecAttrs = (
  i: number,
  collection: Array<unknown>,
  existingSchema: Schema,
  attrName: string
) => {
  const attrsTipTap = collection[i + 1]['attrs'];
  if (attrsTipTap) {
    const content = existingSchema.spec[attrName]['content'];
    for (let j = 0; j < content.length; j += 2) {
      if (content[j] === collection[i]) {
        const attrsLicit = content[j + 1]['attrs'];
        const attrKeys = Object.keys(attrsTipTap);
        attrKeys.forEach((key) => {
          if (!attrsLicit[key]) {
            attrsLicit[key] = attrsTipTap[key];
          }
        });
      }
    }
  }
};

const initDevTool = (debug: boolean, editorView: EditorView): void => {
  // [FS] IRAD-1575 2021-09-27
  if (debug) {
    if (!devTools) {
      devTools = new Promise(async (resolve, reject) => {
        try {
          // Method is exported as both the default and named, Using named
          // for clarity and future proofing.
          const applyPMDevTools = await import('prosemirror-dev-tools');
          // got the pm dev tools instance.
          applyDevTools = applyPMDevTools.default;
          // Attach debug tools to current editor instance.
          applyDevTools(editorView);
          resolve(() => {
            // [FS] IRAD-1571 2021-10-08
            // Prosemirror Dev Tools handles as if one only instance is used in a page and
            // hence handling removal here gracefully.
            const place = document.querySelector(
              '.'.concat('__prosemirror-dev-tools__')
            );
            if (place) {
              ReactDOM.unmountComponentAtNode(place);
              place.innerHTML = '';
            }
          });
        } catch (error) {
          reject();
        }
      });
    }

    // Attach debug tools to current editor instance.
    if (devTools && applyDevTools) {
      applyDevTools(editorView);
    }
  }
};

const destroyDevTool = (): void => {
  // [FS] IRAD-1569 2021-09-15
  // Unmount dev tools when component is destroyed,
  // so that toggle effect is not occuring when the document is retrieved each time.
  if (devTools) {
    // Call the applyDevTools method again to trigger DOM removal
    // prosemirror-dev-tools has outstanding pull-requests that affect
    // dom removal. this may need to be addressed once those have been merged.
    devTools.then((removeDevTools) => removeDevTools());
  }
};

const onBeforeCreate = (params: {
  props: EditorEvents['beforeCreate'];
  schema: Schema;
}): void => {
  if (!params.schema) {
    const editor = params.props.editor;
    UICommand.prototype.editor = editor;

    updateSpec(editor.schema, 'marks', editorSchema);
    updateSpec(editor.schema, 'nodes', editorSchema);

    editor.schema = new Schema({
      nodes: editorSchema.spec.nodes,
      marks: editorSchema.spec.marks,
    });
    params.schema = editor.schema;
  }
};

const onCreate = (
  editor: Editor,
  editorView: EditorView,
  debug: boolean,
  onReady?: ReadyCB
) => {
  // The editor is ready.
  if (onReady) {
    onReady(editor);
    initDevTool(debug, editorView);
  }
};

const onUpdate = (editor: Editor, onChange?: ChangeCB) => {
  // The content has changed.
  if (onChange) {
    onChange(editor.getJSON(), editor.isEmpty, editor.view);
  }
};

const getCollabExtensions = (
  collaboration: boolean,
  currentUser: Record<string, unknown>
): Extension[] => {
  return collaboration
    ? [
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: currentUser,
      }),
    ]
    : [];
};

export const Licit = ({
  docID,
  plugins,
  width,
  height,
  runtime,
  data,
  readOnly,
  embedded,
  collabServiceURL,
  debug,
  disabled,
  onChange,
  onReady,
  theme,
  toolbarConfig
}: LicitProps): ReactElement => {
  const instanceID = uuidv4();

  // [FS] IRAD-981 2020-06-10
  // Component's configurations.
  // [FS] IRAD-1552 2021-08-26
  // Collaboration server / client should allow string values for document identifiers.
  docID = docID || ''; // Empty means collaborative.
  // [FS] IRAD-1553 2021-08-26
  // Configurable Collaboration Service URL.
  collabServiceURL = collabServiceURL || '';
  debug = debug || false;
  // Default width and height to undefined
  width = width || undefined;
  height = height || undefined;
  onChange = onChange || noop;
  onReady = onReady || noop;
  readOnly = readOnly || false;
  data = data || null;
  disabled = disabled || false;
  embedded = embedded || false; // [FS] IRAD-996 2020-06-30
  // [FS] 2020-07-03
  // Handle Image Upload from Angular App
  runtime = runtime || null;
  plugins = plugins || null;

  // Theme property for toolbar. By default uses light theme.
  theme = theme || 'dark';
  toolbarConfig = toolbarConfig || null;

  let currentUser = null;
  let collaboration = false;
  const defaultExtensions = [
    StarterKit.configure({
      codeBlock: false,
    }),
    Subscript,
    Superscript,
    Underline,
    TextAlign.configure({
      types: [HEADING, PARAGRAPH],
    }),
    Indent,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCellEx,
  ];

  const collabCfg = { collaboration, currentUser };

  configCollab(docID, instanceID, collabCfg, collabServiceURL);
  collaboration = collabCfg.collaboration;
  currentUser = collabCfg.currentUser;

  prepareEffectiveSchema(defaultExtensions as Extension[], plugins);

  const editor = useEditor({
    extensions: [
      ...defaultExtensions,
      ...getCollabExtensions(collaboration, currentUser),
      licitPlugins,
    ],
    onBeforeCreate(props: EditorEvents['beforeCreate']): void {
      // Before the view is created.
      onBeforeCreate({ props, schema: effectiveSchema });
    },
    content: data,
  });

  const goToEnd = (): void => {

    const view = editor.view;
    const tr = view.state.tr;
    view.dispatch(
      tr.setSelection(TextSelection.atEnd(view.state.doc)).scrollIntoView()
    );
    view.focus();

  };
  if (editor) {
    editor.on('create', (props: EditorEvents['create']) => {
      // The editor is ready.
      onCreate(props.editor, props.editor.view, debug, onReady);
    });

    editor.on('update', (props: EditorEvents['update']) => {
      // The content has changed.
      onUpdate(props.editor, onChange);
    });

    editor.on('destroy', (_props: EditorEvents['destroy']) => {
      // The editor is being destroyed.
      destroyDevTool();
    });

    const eView: EditorViewEx = editor.view;
    eView.runtime = runtime;
    let wrapperClass = 'prosemirror-editor-wrapper' + ' ' + theme;
    const mainClassName = cx(wrapperClass, {
      embedded: embedded,
    });
    return (
      <ThemeProvider theme={theme}>
        <div className={mainClassName}>
          <RichTextEditor
            disabled={disabled}
            editor={editor}
            editorState={editor.state}
            editorView={eView}
            embedded={embedded}
            height={height}
            readOnly={readOnly}
            toolbarConfig={toolbarConfig}
            width={width}
          />
        </div>
      </ThemeProvider>
    );
  } else {
    return <div></div>;
  }
};


