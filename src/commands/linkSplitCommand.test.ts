import { EditorState, TextSelection } from 'prosemirror-state';
import ListSplitCommand from './listSplitCommand';
import { Transform } from 'prosemirror-transform';

describe('ListSplitCommand', () => {
  const lsc = new ListSplitCommand();
  it('should be defined', () => {
    expect(lsc).toBeDefined();
  });
  it('should handle isEnabled', () => {
    expect(lsc.isEnabled({schema:{marks:{'link':{}}},selection:{from:0,to:1} as unknown as TextSelection} as unknown as EditorState)).toBeDefined();
  });
  it('should handle waitForUserInput', () => {
    expect(lsc.waitForUserInput({doc:{nodeAt:()=>{}},schema:{marks:{'link':{}}},selection:{from:0,to:1}} as unknown as EditorState,()=>{})).toBeDefined();
  });
  it('should handle waitForUserInput when link is null', () => {
    expect(lsc.waitForUserInput({doc:{nodeAt:()=>{}},schema:{marks:{'link':null}},selection:{from:0,to:1}} as unknown as EditorState,()=>{})).toBeDefined();
  });
  it('should handle executeWithUserInput', () => {
    expect(lsc.executeWithUserInput ({doc:{nodeAt:()=>{}},schema:{marks:{'link':null}},selection:{from:0,to:1}} as unknown as EditorState,()=>{})).toBeDefined();
  });
  it('should handle cancel', () => {
    expect(lsc.cancel()).toBe(null);
  });
  it('should handle executeCustom', () => {
    expect(lsc.executeCustom({} as unknown as EditorState,{} as unknown as Transform,0,1)).toBeDefined();
  });
});
