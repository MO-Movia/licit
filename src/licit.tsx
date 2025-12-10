/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import React, {
  ReactElement,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  ForwardedRef,
} from 'react';
import ReactDOM from 'react-dom';
import {Extension, Editor} from '@tiptap/core';
import {EditorEvents, getSchema, JSONContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './styles/licit.css';
import Underline from '@tiptap/extension-underline';
import {v4 as uuidv4} from 'uuid';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import {IndexeddbPersistence} from 'y-indexeddb';
import RichTextEditor from './ui/richTextEditor';
import DefaultEditorPlugins from './defaultEditorPlugins';
import {Plugin, TextSelection} from 'prosemirror-state';
import {getEffectiveSchema} from './convertFromJSON';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {Schema, NodeSpec, Node} from 'prosemirror-model';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import {
  HEADING,
  noop,
  PARAGRAPH,
  ThemeProvider,
  DOC
} from '@modusoperandi/licit-ui-commands';
import {updateEditorMarks} from './editorMarks';
import {updateEditorNodes} from './editorNodes';
import OrderedMap from 'orderedmap';
import {Indent} from './extensions/indent';
import {WebrtcProvider} from 'y-webrtc';
import {EditorRuntime, ToolbarMenuConfig} from './types';
import {EditorViewEx} from './constants';
import TableRow from '@tiptap/extension-table-row';
import TableCellEx from './extensions/tableCellEx';
import {TableEx} from './extensions/tableEx';
import TableHeader from '@tiptap/extension-table-header';
import ParagraphNodeSpec from './specs/paragraphNodeSpec';
import docNodeSpec from './specs/docNodeSpec';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as math from 'lib0/math';
import * as random from 'lib0/random';
import {EditorView} from 'prosemirror-view';
import cx from 'classnames';
import DocLayoutCommand from './commands/docLayoutCommand';

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

export type ReadyCB = (ref: LicitHandle) => void;
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

export interface LicitHandle {
  editor: Editor ;
  editorView: EditorView | null;
  goToEnd: () => void;
  pageLayout: () => void;
  setContent: (content: JSONContent) => void;
  getContent: () => JSONContent;
  insertJSON: (json: JSONContent) => void;
  isNodeHasAttribute: (node: Node, attrName: string) => boolean;
}

const effectiveSchema: Schema | null = null;
let editorSchema: Schema | null = null;
let licitPlugins: Extension | null = null;
let provider: WebrtcProvider | null = null;
let ydoc: Y.Doc | null = null;
let devTools: Promise<() => void> | null = null;
let applyDevTools: ((view: EditorView) => void) | null = null;

export const configCollab = (
  docID: string,
  instanceID: string,
  ref: {
    collaboration: boolean;
    currentUser: Record<string, unknown>;
  },
  collabServiceURL: string
): void => {
  if (docID && 0 < docID.length) {
    ref.collaboration = true;

    if (!provider) {
      let useDefaultProvider = true;
      ydoc = new Y.Doc();
      if (collabServiceURL) {
        try {
          provider = new WebrtcProvider('tiptap-licit-' + docID, ydoc, {
            signaling: [collabServiceURL],
            password: null,
            awareness: new awarenessProtocol.Awareness(ydoc),
            maxConns: 20 + math.floor(random.rand() * 15),
            filterBcConns: true,
            peerOpts: {},
          });
          useDefaultProvider = false;
        } catch (error) {
          console.error('Failed to create WebrtcProvider:', error);
        }
      }

      if (useDefaultProvider) {
        provider = new WebrtcProvider('tiptap-licit-' + docID, ydoc);
      }
    }
    const getRandomElement = (list: string[]): string => {
      const randomIndex =
        crypto.getRandomValues(new Uint32Array(1))[0] % list.length;
      return list[randomIndex];
    };

    const COLORS: string[] = [
      '#958DF1',
      '#F98181',
      '#FBBC88',
      '#FAF594',
      '#70CFF8',
      '#94FADB',
      '#B9F18D',
    ];

    const getRandomColor = (): string => {
      return getRandomElement(COLORS);
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
): {
  editorSchema: Schema;
  licitPlugins: Extension;
} | null => {
  // Return early if already initialized
  if (effectiveSchema) {
    return null;
  }

  try {
    // Get base schema
    const baseSchema = getSchema(defaultExtensions);

    // Helper to safely update node attributes
    const updateNodeAttrs = (nodeName: string, licitNode: NodeSpec): void => {
      const nodesMap = baseSchema.spec.nodes;
      const tiptapNode = nodesMap.get(nodeName);

      if (!tiptapNode || !licitNode.attrs) {
        return;
      }

      // Create new attrs object instead of mutating
      const mergedAttrs = {
        ...tiptapNode.attrs,
        ...Object.fromEntries(
          Object.entries(licitNode.attrs).filter(
            ([key]) => !tiptapNode.attrs?.[key]
          )
        ),
      };

      // Safe mutation if we own this object
      Object.assign(tiptapNode, {attrs: mergedAttrs});
    };

    // Update paragraph node
    updateNodeAttrs(DOC, docNodeSpec);
    updateNodeAttrs(PARAGRAPH, ParagraphNodeSpec);

    // Process nodes and marks
    const nodesMap = baseSchema.spec.nodes;
    const marksMap = baseSchema.spec.marks;

    const nodes = updateEditorNodes(nodesMap);
    const marks = updateEditorMarks(marksMap);

    // Create default schema and plugins
    const defaultEditorSchema = new Schema({nodes, marks});
    const defaultEditorPlugins = new DefaultEditorPlugins(
      defaultEditorSchema
    ).get();

    // Generate effective schema
    const finalSchema = getEffectiveSchema(
      defaultEditorSchema,
      defaultEditorPlugins,
      plugins || []
    );

    // Create extension with plugins
    const pluginsExtension = Extension.create({
      addProseMirrorPlugins() {
        return [...defaultEditorPlugins];
      },
    });

    // Update module-level variables (consider refactoring this pattern)
    // effectiveSchema = finalSchema;
    editorSchema = finalSchema;
    licitPlugins = pluginsExtension;

    return {
      editorSchema: finalSchema,
      licitPlugins: pluginsExtension,
    };
  } catch (error) {
    console.error('Failed to prepare effective schema:', error);
    throw new Error('Schema initialization failed');
  }
};

const updateSpec = (
  schema: Schema,
  attrName: 'marks' | 'nodes',
  existingSchema: Schema
): void => {
  if (!editorSchema) return;

  const keys = Object.keys(schema[attrName]);
  const keysUpdate: string[] = [];

  // Check which keys need to be added
  keys.forEach((key) => {
    if (!editorSchema[attrName][key]) {
      keysUpdate.push(key);
    }
  });

  // Convert OrderedMap to array [name, spec, name, spec, ...]
  const specMap = schema.spec[attrName] as OrderedMap<unknown>;
  const collection: unknown[] = [];
  //forEach is the standard approach for OrderedMap
  specMap.forEach((name, spec) => { //NOSONAR
    collection.push(name, spec);
  });

  // update current array with the latest info
  for (let i = 0; i < collection.length; i += 2) {
    if (keysUpdate.find((element) => element === collection[i])) {
      existingSchema.spec[attrName] = (
        existingSchema.spec[attrName] as OrderedMap<unknown>
      ).update(collection[i] as string, collection[i + 1]);
    } else {
      updateSpecAttrs(i, collection, existingSchema, attrName);
    }
  }

  // Recreate the schema to include new marks/nodes
  if (keysUpdate.length > 0) {
    editorSchema = new Schema({
      nodes: existingSchema.spec.nodes,
      marks: existingSchema.spec.marks,
    });
  }
};
export const updateSpecAttrs = (
  i: number,
  collection: Array<unknown>,
  existingSchema: Schema,
  attrName: 'marks' | 'nodes'
): void => {
  const attrsTipTap = (collection[i + 1] as {attrs?: Record<string, unknown>})
    ?.attrs;
  if (attrsTipTap) {
    const specMap = existingSchema.spec[attrName] as OrderedMap<unknown>;

    // Find the matching spec in the existing schema
     //forEach is the standard approach for OrderedMap
    specMap?.forEach((name, spec) => { //NOSONAR
      if (name === collection[i]) {
        const attrsLicit = (spec as {attrs?: Record<string, unknown>})?.attrs;
        if (attrsLicit) {
          const attrKeys = Object.keys(attrsTipTap);
          attrKeys.forEach((key) => {
            if (!attrsLicit[key]) {
              attrsLicit[key] = attrsTipTap[key];
            }
          });
        }
      }
    });
  }
};
const initDevTool = (debug: boolean, editorView: EditorView): void => {
  if (debug) {
    // Use nullish coalescing assignment operator
    devTools ??= new Promise((resolve, reject) => {
      void (async () => {
        try {
          // Method is exported as both the default and named, Using named
          // for clarity and future proofing.
          const applyPMDevTools = await import('prosemirror-dev-tools');
          // got the pm dev tools instance.
          applyDevTools = applyPMDevTools.default;
          // Attach debug tools to current editor instance.
          if (applyDevTools) {
            applyDevTools(editorView);
          }
          resolve(() => {
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
        } catch (_error) {
          console.error('Failed to load prosemirror-dev-tools:', _error);
          // Fix: Reject with Error object
          reject(_error instanceof Error ? _error : new Error(String(_error)));
        }
      })();
    });

    // Attach debug tools to current editor instance.
    void devTools?.then(() => {
      if (applyDevTools) {
        applyDevTools(editorView);
      }
    });
  }
};

const destroyDevTool = (): void => {
  // [FS] IRAD-1569 2021-09-15
  // Unmount dev tools when component is destroyed,
  // so that toggle effect is not occuring when the document is retrieved each time.
  if (devTools instanceof Promise) {
    // Call the applyDevTools method again to trigger DOM removal
    // prosemirror-dev-tools has outstanding pull-requests that affect
    // dom removal. this may need to be addressed once those have been merged.
    devTools
      .then((removeDevTools) => removeDevTools())
      .catch((error) => {
        console.error('Failed to remove dev tools:', error);
      });
  }
};

const onBeforeCreate = (params: {
  props: EditorEvents['beforeCreate'];
  schema: Schema | null;
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
  _editor: Editor,
  editorView: EditorView,
  debug: boolean,
  onReady?: ReadyCB,
  handle?: LicitHandle
): void => {
  // The editor is ready.
  if (onReady && handle) {
    onReady(handle);
    initDevTool(debug, editorView);
  }
};

const onUpdate = (editor: Editor, onChange?: ChangeCB): void => {
  // The content has changed.
  if (onChange) {
    onChange(editor.getJSON(), editor.isEmpty, editor.view);
  }
};

const getCollabExtensions = (
  collaboration: boolean,
  currentUser: Record<string, unknown>
): Extension[] => {
  if (collaboration && ydoc && provider && currentUser) {
    return [
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: currentUser,
      }),
    ];
  }
  return [];
};

const LicitComponent = (
  {
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
    toolbarConfig,
  }: LicitProps,
  ref: ForwardedRef<LicitHandle>
): ReactElement => {
  const instanceIDRef = useRef<string>(uuidv4());
  const instanceID = instanceIDRef.current;

  // [FS] IRAD-981 2020-06-10
  // Component's configurations.
  // [FS] IRAD-1552 2021-08-26
  // Collaboration server / client should allow string values for document identifiers.
  const finalDocID = docID || ''; // Empty means collaborative.
  // [FS] IRAD-1553 2021-08-26
  // Configurable Collaboration Service URL.
  const finalCollabServiceURL = collabServiceURL || '';
  const finalDebug = debug || false;
  // Default width and height to undefined
  const finalWidth = width || undefined;
  const finalHeight = height || undefined;
  const finalOnChange = onChange || noop;
  const finalOnReady = onReady || noop;
  const finalReadOnly = readOnly || false;
  const finalData = data || null;
  const finalDisabled = disabled || false;
  const finalEmbedded = embedded || false;
  // Handle Image Upload from Angular App
  const finalRuntime = runtime || null;
  const finalPlugins = plugins || null;

  // Theme property for toolbar. By default uses dark theme.
  const finalTheme = theme || 'dark';
  const finalToolbarConfig = toolbarConfig || null;

  let currentUser: Record<string, unknown> = null;
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
    TableEx.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCellEx,
  ];

  const collabCfg = {collaboration, currentUser};

  configCollab(finalDocID, instanceID, collabCfg, finalCollabServiceURL);
  collaboration = collabCfg.collaboration;
  currentUser = collabCfg.currentUser;

  prepareEffectiveSchema(defaultExtensions as Extension[], finalPlugins);

  const editor = useEditor({
    extensions: [
      ...defaultExtensions,
      ...getCollabExtensions(collaboration, currentUser),
      ...(licitPlugins ? [licitPlugins] : []),
    ],
    onBeforeCreate(props: EditorEvents['beforeCreate']): void {
      // Before the view is created.
      onBeforeCreate({props, schema: effectiveSchema});
    },
    content: finalData,
    editable: !finalReadOnly,
  });

  // Public methods
  const goToEnd = useCallback((): void => {
    if (editor) {
      const view = editor.view;
      const tr = view.state.tr;
      view.dispatch(
        tr.setSelection(TextSelection.atEnd(view.state.doc)).scrollIntoView()
      );
      view.focus();
    }
  }, [editor]);

  const pageLayout = useCallback((): void => {
    if (editor) {
      const DOC_LAYOUT = new DocLayoutCommand();
      DOC_LAYOUT.waitForUserInput(
        editor.view.state,
        editor.view.dispatch,
        editor.view
      )
        .then((inputs) => {
          DOC_LAYOUT.executeWithUserInput(
            editor.view.state,
            editor.view.dispatch,
            editor.view,
            inputs
          );
        })
        .catch((error) => {
          console.error('Page layout error:', error);
        });
    }
  }, [editor]);
  const setContent = useCallback(
    (content: JSONContent): void => {
      if (editor) {
        editor.commands.setContent(content);
      }
    },
    [editor]
  );

  const getContent = useCallback((): JSONContent => {
    if (editor) {
      return editor.getJSON();
    }
    return {};
  }, [editor]);

  const insertJSON = useCallback(
    (json: JSONContent): void => {
      if (editor) {
        editor.commands.insertContent(json);
      }
    },
    [editor]
  );

  const isNodeHasAttribute = useCallback(
    (node: Node, attrName: string): boolean => {
      const value = node.attrs?.[attrName];
      return typeof value === 'boolean' ? value : undefined;
    },
    []
  );

  // Expose methods via ref
  useImperativeHandle(
    ref,
    (): LicitHandle => ({
      editor: editor,
      editorView: editor?.view || null,
      goToEnd,
      pageLayout,
      setContent,
      getContent,
      insertJSON,
      isNodeHasAttribute,
    }),
    [
      editor,
      goToEnd,
      pageLayout,
      setContent,
      getContent,
      insertJSON,
      isNodeHasAttribute,
    ]
  );

  if (editor) {
    editor.on('create', (props: EditorEvents['create']) => {
      // The editor is ready.
      const handle: LicitHandle = {
        editor: editor,
        editorView: editor.view,
        goToEnd,
        pageLayout,
        setContent,
        getContent,
        insertJSON,
        isNodeHasAttribute,
      };
      onCreate(
        props.editor,
        props.editor.view,
        finalDebug,
        finalOnReady,
        handle
      );
    });

    editor.on('update', (props: EditorEvents['update']) => {
      // The content has changed.
      onUpdate(props.editor, finalOnChange);
    });

    editor.on('destroy', (_props: EditorEvents['destroy']) => {
      // The editor is being destroyed.
      destroyDevTool();
      // Cleanup collaboration
      if (provider) {
        provider.destroy();
        provider = null;
      }
      if (ydoc) {
        ydoc.destroy();
        ydoc = null;
      }
    });

    const eView: EditorViewEx = editor.view as EditorViewEx;
    eView.runtime = finalRuntime;
    const wrapperClass = 'prosemirror-editor-wrapper' + ' ' + finalTheme;
    const mainClassName = cx(wrapperClass, {
      embedded: finalEmbedded,
    });
    return (
      <ThemeProvider theme={finalTheme}>
        <div className={mainClassName}>
          <RichTextEditor
            disabled={finalDisabled}
            editor={editor}
            editorState={editor.state}
            editorView={eView}
            embedded={finalEmbedded}
            height={finalHeight}
            readOnly={finalReadOnly}
            toolbarConfig={finalToolbarConfig}
            width={finalWidth}
          />
        </div>
      </ThemeProvider>
    );
  } else {
    return <div></div>;
  }
};

export const Licit = forwardRef<LicitHandle, LicitProps>(LicitComponent);

Licit.displayName = 'Licit';
