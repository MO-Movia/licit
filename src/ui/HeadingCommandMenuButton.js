// @flow

import CommandMenuButton from './CommandMenuButton';
import HeadingCommand from '../HeadingCommand';
import CustomStyleCommand from '../CustomStyleCommand';
import * as React from 'react';
import {findActiveHeading} from './findActiveHeading';
import findActiveCustomStyle from './findActiveCustomStyle';
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {HEADING_NAMES} from '../HeadingNodeSpec';
import {HEADING_NAME_DEFAULT} from './findActiveHeading';
import {Transform} from 'prosemirror-transform';

// [FS] IRAD-1042 2020-09-09
// To include custom styles in the toolbar

const HEADING_COMMANDS: Object = {
  [HEADING_NAME_DEFAULT]: new HeadingCommand(0),
}; 
 

HEADING_NAMES.forEach(obj => {
  if(obj.level){
    HEADING_COMMANDS[obj.name] = new HeadingCommand(obj.level);
  }
  else
  {
    HEADING_COMMANDS[obj.name] = new CustomStyleCommand(obj.customstyles,obj.name);
  }
 
});


const COMMAND_GROUPS = [HEADING_COMMANDS];

class HeadingCommandMenuButton extends React.PureComponent<any, any> {
  props: {
    dispatch: (tr: Transform) => void,
    editorState: EditorState,
    editorView: ?EditorView,
  };

  findHeadingName(level: integer) {
    for (var i=0; i < HEADING_NAMES.length; i++){
       if (HEADING_NAMES[i].level == level){
      return HEADING_NAMES[i].name;
    }   
    }      
  }

  render(): React.Element<any> {
    const {dispatch, editorState, editorView} = this.props;
    var customStyleName;
    const headingLevel= findActiveHeading(editorState);
    if(0<headingLevel)
    {
      customStyleName =this.findHeadingName(headingLevel);
    }
    else{
      customStyleName = findActiveCustomStyle(editorState);
    }
    

    return (
      <CommandMenuButton
        className="width-100"
         // [FS] IRAD-1008 2020-07-16
         // Disable font type menu on editor disable state
        disabled={editorView && editorView.disabled? true:false}
        commandGroups={COMMAND_GROUPS}
        dispatch={dispatch}
        editorState={editorState}
        editorView={editorView}
        label={customStyleName}
      />
    );
  }
}

export default HeadingCommandMenuButton;
