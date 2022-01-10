import React from 'react'
import { Extension } from "@tiptap/core";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './licit.scss'
import Toolbar from "./extensions/toolbar/Toolbar";
import PropTypes from 'prop-types';

const Licit = ({ instanceId, deps }) => {
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Toolbar.extend({
          name: "Toolbar-" + {instanceId},
        }),
      ...deps
    ],
    content: `
      <h2>
        Hi there,
      </h2>
      <p>
        this is a <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
      </p>
      <ul>
        <li>
          That’s a bullet list with one …
        </li>
        <li>
          … or two list items.
        </li>
      </ul>
      <p>
        Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
      </p>
      <pre><code class="language-css">body {
  display: none;
}</code></pre>
      <p>
        I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
      </p>
      <blockquote>
        Wow, that’s amazing. Good work, boy! 👏
        <br />
        — Mom
      </blockquote>
    `,
  })

  return (
    <div>
      <EditorContent editor={editor} width="50vw"/>
    </div>
  )
}

Licit.propTypes = {
  instanceId: PropTypes.string,
  deps: PropTypes.arrayOf(PropTypes.instanceOf(Extension)),
}

export default Licit