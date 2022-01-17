import React, { ReactElement } from 'react';
import { Extension } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './licit.scss';
import Toolbar from './extensions/toolbar/Toolbar';
import { v4 as uuidv4 } from 'uuid';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';

/**
 * LICIT properties:
 *  docID {string} [] Collaborative Doument ID
 *  collabServiceURL {string} [/collaboration-service] Collaboration Service URL
 *  debug {boolean} [false] To enable/disable ProseMirror Debug Tools, available only in development.
 *  width {string} [100%] Width of the editor.
 *  height {string} [100%] Height of the editor.
 *  readOnly {boolean} [false] To enable/disable editing mode.
 *  onChange {@callback} [null] Fires after each significant change.
 *      @param data {JSON} Modified document data.
 *  onReady {@callback} [null] Fires when the editor is fully ready.
 *      @param ref {LICIT} Rerefence of the editor.
 *  data {JSON} [null] Document data to be loaded into the editor.
 *  disabled {boolean} [false] Disable the editor.
 *  embedded {boolean} [false] Disable/Enable inline behaviour.
 *  plugins [plugins] External Plugins into the editor.
 */
interface LicitProps {
  docID?: string;
  collabServiceURL?: string;
  debug?: boolean;
  width?: string;
  height?: string;
  readOnly?: boolean;
  data?: string;
  disabled?: boolean;
  embedded?: boolean;
  plugins?: Extension[];
}

const Licit = ({ docID, plugins, width, height, collabServiceURL }: LicitProps): ReactElement => {
  const instanceID = uuidv4();
  let ydoc;
  let provider;
  let currentUser;
  let collaboration = false;

  // Enable collaboration.
  if (docID && 0 < docID.length) {
    collaboration = true;
    ydoc = new Y.Doc();
    provider = new HocuspocusProvider({
      url: collabServiceURL,
      name: docID,
      document: ydoc,
    });
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
    currentUser = {
      name: instanceID,
      color: getRandomColor(),
    };

    // For offline editing, store the Y document in the browser
    new IndexeddbPersistence(docID, ydoc);
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      ...(collaboration
        ? [
            Collaboration.configure({
              document: ydoc,
            }),
            CollaborationCursor.configure({
              provider: provider,
              user: currentUser,
            }),
          ]
        : []),
      ...(plugins ? [...plugins] : []),
      Toolbar.extend({
        name: 'LiciT-TBar-' + uuidv4(),
      }),
    ],
    content: '',
  });

  return (
    <div>
      <EditorContent editor={editor} height={height} width={width} />
    </div>
  );
};

export default Licit;
