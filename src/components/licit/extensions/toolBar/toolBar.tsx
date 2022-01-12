import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { toggleMark, wrapIn } from 'prosemirror-commands';
import './menu.css';
import * as React from 'react';
import ReactDOM from 'react-dom';

// Helper function to create menu icons
function icon(text, name) {
  const span = document.createElement('span');
  span.className = 'ProseMirror-menuitem';
  span.title = name;
  span.textContent = text;
  return span;
}

interface MyItem {
  command: (
    state: EditorState,
    dispatch?: (tr: Transaction) => void
  ) => boolean;
  dom: HTMLElement;
}

let csd = null;

export const Toolbar = Extension.create({
  name: 'toolBar',
  // This is to invoke after all other extensions so that to prepare the toolbar correctly.
  priority: 99,

  addProseMirrorPlugins() {
    const schema = this.editor.schema;

    let items = [];
    items.push({
      command: toggleMark(schema.marks.bold),
      dom: icon('B', 'strong'),
    });
    items.push({
      command: toggleMark(schema.marks.italic),
      dom: icon('i', 'em'),
    });
    items.push({
      command: wrapIn(schema.nodes.blockquote),
      dom: icon('>', 'blockquote'),
    });
    this.editor.extensionManager.extensions.forEach((extension) => {
      let gmi = extension.config.getMenuItems;
      if (!gmi && extension.parent) {
        gmi = extension.parent.config.getMenuItems;
      }

      if (gmi) {
        items = items.concat(gmi.call(extension, schema));
      }

      if (extension.name === 'CustomStyle') {
        csd = extension.storage.menuItems;
      }
    });

    return [
      new Plugin({
        key: new PluginKey('toolBar'),
        view(editorView) {
          const menuView = new MenuView(items, editorView);
          editorView.dom.parentNode.insertBefore(menuView.dom, editorView.dom);
          return menuView;
        },
        props: {},
      }),
    ];
  },
});

class MenuView {
  dom: HTMLElement;
  editorView: EditorView;
  items: MyItem[];
  constructor(items, editorView) {
    this.items = items;
    this.editorView = editorView;

    this.dom = document.createElement('div');
    this.dom.className = 'menubar';
    items.forEach(({ dom }) => {
      this.dom.appendChild(dom);
    });
    if (csd) {
      const d = document.createElement('div');
      d.appendChild(document.createElement('br'));
      d.appendChild(document.createElement('br'));
      d.appendChild(document.createElement('br'));
      d.appendChild(document.createElement('br'));
      d.appendChild(document.createElement('br'));
      this.dom.appendChild(d);
      ReactDOM.render(
        React.createElement(csd, {
          dispatch: editorView.dispatch,
          editorState: editorView.state,
          editorView,
        }),
        d
      );
    }
    this.update();

    items.forEach(({ command, dom }) => {
      dom.addEventListener('mousedown', (e) => {
        e.preventDefault();
        command(editorView.state, editorView.dispatch);
      });
    });
  }

  update() {
    this.items.forEach(({ command, dom }) => {
      const active = command(this.editorView.state, null);
      dom.style.display = active ? '' : 'none';
    });
  }

  destroy() {
    this.dom.remove();
  }
}

export default Toolbar;
