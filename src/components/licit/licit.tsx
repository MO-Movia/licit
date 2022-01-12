import React, { ReactElement } from 'react';
import { Extension } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './licit.scss';
import Toolbar from './extensions/toolbar/Toolbar';
import { v4 as uuidv4 } from 'uuid';

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

const Licit = ({ plugins }: LicitProps): ReactElement => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ...[...plugins],
      Toolbar.extend({
        name: 'LiciT-TBar-' + uuidv4(),
      }),
    ],
    content: '',
  });

  return (
    <div>
      <EditorContent editor={editor} width="50vw" />
    </div>
  );
};

export default Licit;
