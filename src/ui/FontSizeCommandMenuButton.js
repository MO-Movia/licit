// @flow

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import * as React from 'react';

import {FontSizeCommand} from '@modusoperandi/licit-ui-commands';
import CommandMenuButton from './CommandMenuButton.js';
import findActiveFontSize from './findActiveFontSize.js';

export const FONT_PT_SIZES = [
  6, 
  6.5, 
  7,
  8,
  9,
  10,
  11,
  12,
  14,
  16,
  18,
  20,
  22,
  24,
  30,
  36,
  48,
  60,
  72,
  90,
];

const FONT_PT_SIZE_COMMANDS = FONT_PT_SIZES.reduce((memo, size) => {
  memo[` ${size} `] = new FontSizeCommand(size);
  return memo;
}, {});

const COMMAND_GROUPS = [
  { Default: new FontSizeCommand(0) },
  FONT_PT_SIZE_COMMANDS,
];

class FontSizeCommandMenuButton extends React.PureComponent<any, any> {
  props: {
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
  };

  render(): React.Element<any> {
    const { dispatch, editorState, editorView } = this.props;
    const fontSize = findActiveFontSize(editorState);
    const className = String(fontSize).length <= 2 ? 'width-30' : 'width-60';
    return (
      <CommandMenuButton
        className={className}
        // [FS] IRAD-1008 2020-07-16
        // Disable font size menu on editor disable state
        commandGroups={COMMAND_GROUPS}
        disabled={editorView?.disabled}
        dispatch={dispatch}
        editorState={editorState}
        editorView={editorView}
        label={fontSize}
      />
    );
  }
}

export default FontSizeCommandMenuButton;
