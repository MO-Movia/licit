// @flow

import * as React from 'react';
import ReactDOM from 'react-dom';
import {EditorView} from 'prosemirror-view';
import {Editor} from '@tiptap/core';
import {JSONContent} from '@tiptap/react';

import {Licit} from '../../src/';
import CustomLicitRuntime from './runtime';
// import {CustomstylePlugin} from '@modusoperandi/licit-custom-styles';
// import {ExportPDFPlugin} from '@modusoperandi/licit-export-pdf';
// import {MultimediaPlugin} from '@modusoperandi/licit-multimedia';
// import {VignettePlugins} from '@modusoperandi/licit-vignette';
// import {ChangeCasePlugin} from '@modusoperandi/licit-changecase';
// import {CitationPlugin} from '@modusoperandi/licit-citation';
// import {GlossaryPlugin} from '@modusoperandi/licit-glossary';
import {InfoIconPlugin} from '@modusoperandi/licit-info-icon';
import {EnhancedTableFigure} from '@modusoperandi/licit-contrib-plugin-block-control';
import '@modusoperandi/licit-ui-commands/styles.css';
import '@modusoperandi/licit-custom-styles/styles.css';
// import '@modusoperandi/licit-export-pdf/styles.css';
// import '@modusoperandi/licit-multimedia/styles.css';
// import '@modusoperandi/licit-citation/styles.css';
// import '@modusoperandi/licit-glossary/styles.css';
import '@modusoperandi/licit-info-icon/styles.css';
import '@modusoperandi/licit-contrib-plugin-block-control/styles.css';
import '../../src/styles/styles.css';
function main(): void {
  const el = document.createElement('div');
  el.id = 'licit-app';
  el.style.setProperty('width', '100vw');
  el.style.setProperty('height', '100vh');
  const {body} = document;
  body && body.appendChild(el);
  const docJSON = {
    type: 'doc',
    attrs: {layout: null, padding: null, width: null},
    content: [
      {
        type: 'paragraph',
        attrs: {
          align: null,
          color: null,
          id: null,
          indent: null,
          lineSpacing: null,
          paddingBottom: null,
          paddingTop: null,
        },
        content: [
          {
            type: 'text',
            marks: [{type: 'mark-font-type', attrs: {name: 'Arial Black'}}],
            text: 'First line Arial black',
          },
        ],
      },
      {
        type: 'ordered_list',
        attrs: {
          id: null,
          counterReset: null,
          indent: 0,
          following: null,
          listStyleType: null,
          name: null,
          start: 1,
        },
        content: [
          {
            type: 'list_item',
            attrs: {align: null},
            content: [
              {
                type: 'paragraph',
                attrs: {
                  align: null,
                  color: null,
                  id: null,
                  indent: null,
                  lineSpacing: null,
                  paddingBottom: null,
                  paddingTop: null,
                },
                content: [{type: 'text', text: 'List 1'}],
              },
            ],
          },
        ],
      },
      {
        type: 'ordered_list',
        attrs: {
          id: null,
          counterReset: null,
          indent: 1,
          following: null,
          listStyleType: null,
          name: null,
          start: 1,
        },
        content: [
          {
            type: 'list_item',
            attrs: {align: null},
            content: [
              {
                type: 'paragraph',
                attrs: {
                  align: null,
                  color: null,
                  id: null,
                  indent: null,
                  lineSpacing: null,
                  paddingBottom: null,
                  paddingTop: null,
                },
                content: [{type: 'text', text: 'Child'}],
              },
            ],
          },
        ],
      },
      {
        type: 'ordered_list',
        attrs: {
          id: null,
          counterReset: 'none',
          indent: 0,
          following: null,
          listStyleType: null,
          name: null,
          start: 1,
        },
        content: [
          {
            type: 'list_item',
            attrs: {align: null},
            content: [
              {
                type: 'paragraph',
                attrs: {
                  align: null,
                  color: null,
                  id: null,
                  indent: null,
                  lineSpacing: null,
                  paddingBottom: null,
                  paddingTop: null,
                },
                content: [{type: 'text', text: 'List 2'}],
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          align: 'center',
          color: null,
          id: null,
          indent: null,
          lineSpacing: null,
          paddingBottom: null,
          paddingTop: null,
        },
        content: [{type: 'text', text: 'Align'}],
      },
      {
        type: 'paragraph',
        attrs: {
          align: null,
          color: null,
          id: null,
          indent: null,
          lineSpacing: null,
          paddingBottom: null,
          paddingTop: null,
        },
        content: [
          {
            type: 'text',
            marks: [{type: 'mark-text-color', attrs: {color: '#f20d96'}}],
            text: 'Font',
          },
          {type: 'text', text: ' '},
          {
            type: 'text',
            marks: [
              {
                type: 'mark-text-highlight',
                attrs: {highlightColor: '#e5e5e5'},
              },
            ],
            text: 'Color ',
          },
          {type: 'text', marks: [{type: 'strong'}], text: 'align '},
          {
            type: 'text',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: 'http://www.google.com',
                  rel: 'noopener noreferrer nofollow',
                  target: 'blank',
                  title: null,
                },
              },
              {type: 'em'},
            ],
            text: 'Link to google',
          },
          {type: 'text', marks: [{type: 'em'}], text: ' '},
          {type: 'text', marks: [{type: 'underline'}], text: 'underline '},
          {
            type: 'text',
            marks: [
              {type: 'em'},
              {type: 'strong'},
              {type: 'mark-text-color', attrs: {color: '#e5e5e5'}},
              {
                type: 'mark-text-highlight',
                attrs: {highlightColor: '#979797'},
              },
              {type: 'underline'},
            ],
            text: 'combined',
          },
        ],
      },
      {
        type: 'heading',
        attrs: {
          align: null,
          color: null,
          id: null,
          indent: null,
          lineSpacing: null,
          paddingBottom: null,
          paddingTop: null,
          level: 1,
        },
        content: [{type: 'text', text: 'Header 1'}],
      },
      {
        type: 'paragraph',
        attrs: {
          align: null,
          color: null,
          id: null,
          indent: null,
          lineSpacing: null,
          paddingBottom: null,
          paddingTop: null,
        },
      },
      {
        type: 'table',
        attrs: {marginLeft: null},
        content: [
          {
            type: 'table_row',
            content: [
              {
                type: 'table_cell',
                attrs: {
                  colspan: 1,
                  rowspan: 1,
                  colwidth: null,
                  borderColor: null,
                  background: null,
                },
                content: [
                  {
                    type: 'paragraph',
                    attrs: {
                      align: null,
                      color: null,
                      id: null,
                      indent: null,
                      lineSpacing: null,
                      paddingBottom: null,
                      paddingTop: null,
                    },
                    content: [
                      {
                        type: 'text',
                        marks: [{type: 'strong'}],
                        text: 'Cell 1',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'table_cell',
                attrs: {
                  colspan: 1,
                  rowspan: 1,
                  colwidth: null,
                  borderColor: null,
                  background: null,
                },
                content: [
                  {
                    type: 'paragraph',
                    attrs: {
                      align: null,
                      color: null,
                      id: null,
                      indent: null,
                      lineSpacing: null,
                      paddingBottom: null,
                      paddingTop: null,
                    },
                    content: [{type: 'text', text: 'Cell 2'}],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          align: null,
          color: null,
          id: null,
          indent: null,
          lineSpacing: null,
          paddingBottom: null,
          paddingTop: null,
        },
      },
      {
        type: 'paragraph',
        attrs: {
          align: null,
          color: null,
          id: null,
          indent: null,
          lineSpacing: null,
          paddingBottom: null,
          paddingTop: null,
        },
        content: [
          {type: 'text', text: 'Subscript '},
          {type: 'text', marks: [{type: 'super'}], text: '2 '},
        ],
      },
    ],
  };
  // Use this (set to null) if need a empty editor.
  // docJSON = null;
  // [FS] IRAD-982 2020-06-10
  // Use the licit component for demo.

  // To pass runtime to handle the upload image from angular App
  // null means it will take licit EditorRuntime

  // To pass prosemirror plugins to editor pass it to plugins property which accept array of plugin object.
  // null means no custom plugins to pass
  // the plugin object must contain a method getEffectiveSchema() which accept schema and returns schema.
  //new ReferencingPlugin() doc top node not found issue
  const runtime = new CustomLicitRuntime();
  const plugins = [
    // new CustomstylePlugin(runtime),
    //   new ExportPDFPlugin(true),
    //   new MultimediaPlugin(),
    //   ...VignettePlugins,
    //   new ChangeCasePlugin(),
    //   new CitationPlugin(),
    //   new GlossaryPlugin(),
    new InfoIconPlugin(),
    new EnhancedTableFigure(),
  ];
  ReactDOM.render(
    <React.StrictMode>
      <Licit
        collabServiceURL={''} //ws://127.0.0.1:1234
        data={docJSON}
        debug={true}
        docID={''} //88.99.193.94:8085:001//localhost:001
        embedded={false}
        height={'100vh'}
        onChange={onChangeCB}
        onReady={onReadyCB}
        plugins={plugins}
        runtime={runtime}
        width={'100vw'}
        readOnly={false}
        theme={'dark'}
        toolbarConfig={undefined}
      />
    </React.StrictMode>,
    el
  );
}

function onChangeCB(data: JSONContent, isEmpty: boolean, view: EditorView) {
  console.log(
    `data:  ${JSON.stringify(data)}  \r\nisEmpty: ${isEmpty} \r\nview: ${view}`
  );
}

function onReadyCB(ref: Editor) {
  console.log('Editor is ready. Ref: ' + ref);
}

window.onload = main;
