// [FS] IRAD-1039 2020-09-23
// Command button to handle different type of list types
// Need to add Icons instead of label
import * as React from 'react';
import {EditorState} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import {ListToggleCommand, hasCustomNumberedList, hasImageNode} from '../ListToggleCommand';
import ListTypeButton from './ListTypeButton';

const LIST_TYPE_NAMES = [
  {
    name: 'decimal',
    label: '1.',
  },
  {
    name: 'x.x.x',
    label: '1.1.1',
  },
  {
    name: 'num_bracket',
    label: '1)',
  },
  {
    name: 'num_bracket_closed',
    label: '(1)',
  },
  {
    name: 'upper_alpha_bracket',
    label: 'A)',
  },
  {
    name: 'lower_alpha_bracket',
    label: 'a)',
  },
  {
    name: 'lower_alpha_bracket_closed',
    label: '(a)',
  },
];
const LIST_TYPE_COMMANDS: Object = {
  ['decimal']: new ListToggleCommand(true, 'decimal'),
};
LIST_TYPE_NAMES.forEach((obj) => {
  LIST_TYPE_COMMANDS[obj.name] = new ListToggleCommand(true, obj.name);
  LIST_TYPE_COMMANDS[obj.name].label = obj.label;
});

const COMMAND_GROUPS = [LIST_TYPE_COMMANDS];

class ListTypeCommandButton extends React.PureComponent<any, any> {
  props: {
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
  };

  render(): React.Element<any> {
    const {dispatch, editorState, editorView} = this.props;
    let disabled = false;
    if (editorState && editorView) {
      // [FS] IRAD-1317 2021-05-06
      // To disable the list menu when select an image
      disabled = hasCustomNumberedList(editorState) || hasImageNode(editorState);
      disabled = editorView.disabled || disabled ? true : false;
    }
    return (
      <ListTypeButton
        className="width-50 czi-icon format_list_numbered"
        commandGroups={COMMAND_GROUPS}
        disabled={disabled}
        dispatch={dispatch}
        editorState={editorState}
        editorView={editorView}
        icon={'format_list_numbered'}
      />
    );
  }
}

export default ListTypeCommandButton;