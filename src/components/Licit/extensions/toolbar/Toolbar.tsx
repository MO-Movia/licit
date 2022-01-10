import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view"; 
import { toggleMark, wrapIn } from "prosemirror-commands";
import { EditorState, Transaction } from "prosemirror-state";
import "./menu.css";

// Helper function to create menu icons
function icon(text, name) {
  let span = document.createElement("span");
  span.className = "ProseMirror-menuitem";
  span.title = name;
  span.textContent = text;
  return span;
}

// Create an icon for a heading at the given level
/*function heading(level, schema) {
  return {
    command: setBlockType(schema.nodes.heading, { level }),
    dom: icon("H" + level, "heading"),
  };
}
*/

interface MyItem {
  command: (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;
  dom: HTMLElement;
}

export const Toolbar = Extension.create({
  name: "toolBar",
  // This is to invoke after all other extensions so that to prepare the toolbar correctly.
  priority: 99,

  onUpdate() {
    //console.log("Toolbar update");
  },

  addProseMirrorPlugins() {
    const schema = this.editor.schema;

    let items = [];
    items.push({
      command: toggleMark(schema.marks.bold),
      dom: icon("B", "strong"),
    });
    items.push({
      command: toggleMark(schema.marks.italic),
      dom: icon("i", "em"),
    });
    items.push({
      command: wrapIn(schema.nodes.blockquote),
      dom: icon(">", "blockquote"),
    });
    this.editor.extensionManager.extensions.forEach((extension) => {
      let gmi = extension.config.getMenuItems;
      if (!gmi && extension.parent) {
        gmi = extension.parent.config.getMenuItems;
      }
      if (gmi) {
        items = items.concat(gmi.call(extension, schema));
      }
    });

    return [
      new Plugin({
        key: new PluginKey("toolBar"),
        view(editorView) {
          let menuView = new MenuView(items, editorView);
          editorView.dom.parentNode.insertBefore(menuView.dom, editorView.dom);
          return menuView;
        },
        props: {
          //handleClick(view, pos, event) { /* … */ },
          //handleDoubleClick(view, pos, event) { /* … */ },
          //handlePaste(view, event, slice) { /* … */ },
          // … and many, many more.
          // Here is the full list: https://prosemirror.net/docs/ref/#view.EditorProps
        },
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

    this.dom = document.createElement("div");
    this.dom.className = "menubar";
    items.forEach(({ dom }) => {
      //const dom = icon(item.text, item.tooltip);
      //item.dom = dom;
      this.dom.appendChild(dom);
    });
    this.update();

    items.forEach(({ command, dom }) => {
      dom.addEventListener("mousedown", (e) => {
        e.preventDefault();
        //editorView.focus();
        command(editorView.state, editorView.dispatch);
      });
    });
  }

  update() {
    //console.log("MenuView Update");
    this.items.forEach(({ command, dom }) => {
      let active = command(this.editorView.state, null);
      dom.style.display = active ? "" : "none";
    });
  }

  destroy() {
    this.dom.remove();
  }
}

export default Toolbar;
