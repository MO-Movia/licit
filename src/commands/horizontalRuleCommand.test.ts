/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import HorizontalRuleCommand from './horizontalRuleCommand';
import { Editor } from '@tiptap/react';
import { Transform } from 'prosemirror-transform';

describe('HorizontalRuleCommand',()=>{
    const hrc = new HorizontalRuleCommand();
    it('should be defined',()=>{
       expect(hrc).toBeDefined();
    });
    it('should be handle getEditor',()=>{
        expect(hrc.getEditor()).toBeUndefined();
     });
     it('should be handle isEnabled',()=>{
        expect(hrc.isEnabled({} as unknown as EditorState)).toBeTruthy();
     });
     it('should handle execute',()=>{
        jest.spyOn(hrc,'getEditor').mockReturnValue({commands:{setHorizontalRule:()=>{return true;}}} as unknown as Editor);
        expect(hrc.execute({} as unknown as EditorState)).toBeDefined();
     });
     it('should handle waitForUserInput',()=>{
        jest.spyOn(hrc,'getEditor').mockReturnValue({commands:{setHorizontalRule:()=>{return true;}}} as unknown as Editor);
        expect(hrc.waitForUserInput({} as unknown as EditorState)).toBeDefined();
     });
     it('should handle executeWithUserInput',()=>{
        jest.spyOn(hrc,'getEditor').mockReturnValue({commands:{setHorizontalRule:()=>{return true;}}} as unknown as Editor);
        expect(hrc.executeWithUserInput({} as unknown as EditorState)).toBeFalsy();
     });
     it('should be handle cancel',()=>{
        expect(hrc.cancel()).toBe(null);
     });
     it('should handle executeCustom',()=>{
        jest.spyOn(hrc,'getEditor').mockReturnValue({commands:{setHorizontalRule:()=>{return true;}}} as unknown as Editor);
        expect(hrc.executeCustom({} as unknown as EditorState,{} as unknown as Transform,1,2)).toBeDefined();
     });
});