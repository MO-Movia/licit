import { EditorState } from 'prosemirror-state';
import FontTypeCommandMenuButton from './fontTypeCommandMenuButton';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

//  Use `var` to prevent hoisting issues
var mockFindActiveFontType: jest.Mock;
jest.mock('../findActiveFontType', () => {
  const fn = jest.fn();
  mockFindActiveFontType = fn;
  return { __esModule: true, default: fn };
});

//  Safe mock pattern for CommandMenuButton
var MockCommandMenuButton: jest.Mock;
jest.mock('./commandMenuButton', () => {
  const fn = jest.fn((_props: any) => null);
  MockCommandMenuButton = fn;
  return { __esModule: true, default: fn };
});

describe('FontTypeCommandMenuButton (pure Jest)', () => {
  const mockDispatch = jest.fn();
  const mockEditorState = {} as EditorState;

  beforeEach(() => {
    jest.clearAllMocks();
    UICommand.theme = 'dark';
  });

  it('should instantiate component without throwing', () => {
    const props = {
      dispatch: mockDispatch,
      editorState: mockEditorState,
      editorView: { disabled: false },
    } as any;

    expect(() => new FontTypeCommandMenuButton(props)).not.toThrow();
  });
});
