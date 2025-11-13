/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { ContentNodeWithPos  } from 'prosemirror-utils';
import { ListToggleCommand, hasImageNode } from './listToggleCommand';
import {
  toggleList,
  isNodeSelectionForNodeType,
} from '@modusoperandi/licit-ui-commands';

import { Editor } from '@tiptap/react';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

jest.mock('@modusoperandi/licit-ui-commands', () => ({
  toggleList: jest.fn(),
  isNodeSelectionForNodeType: jest.fn(),
  noop: jest.fn(),
  ORDERED_LIST: 'ordered_list',
  BULLET_LIST: 'bullet_list',
  IMAGE: 'image',
  editor: {} as Editor,
}));

jest.mock('prosemirror-utils', () => {
  const actual = jest.requireActual<typeof import('prosemirror-utils')>('prosemirror-utils');

  return {
    ...actual,
    findParentNodeOfType: jest
      .fn()
      .mockImplementation(() => jest.fn().mockReturnValue(true)),
  };
});


describe('ListToggleCommand', () => {
  let command: ListToggleCommand;
  const mockDispatch = jest.fn();
  const mockState = {
    schema: {
      nodes: {
        ordered_list: {},
        bullet_list: {},
        image: {},
      },
    },
    selection: {},
    tr: {
      setSelection: jest.fn().mockReturnThis(),
    },
  } as unknown as EditorState;

  beforeEach(() => {
    jest.clearAllMocks();
    command = new ListToggleCommand(true, 'ordered');
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('isActive', () => {
    it('should return true if the ordered list is active', () => {
      jest
        .spyOn(command, '_findList')
        .mockReturnValue({} as ContentNodeWithPos);
      expect(command.isActive(mockState)).toBe(true);
    });

    it('should return false if the ordered list is not active', () => {
      jest.spyOn(command, '_findList').mockReturnValue(undefined);
      expect(command.isActive(mockState)).toBe(false);
    });

    it('should return true if the bullet list is active', () => {
      command = new ListToggleCommand(false, 'bullet_list');
      expect(command.isActive(mockState)).toBe(true);
    });
  });

  describe('getEditor', () => {
    UICommand.prototype.editor = {} as Editor;
    it('should return editor instance', () => {
      expect(command.getEditor()).toBeDefined();
    });
  });

  describe('isEnabled', () => {
    it('should return false if an image node is selected', () => {
      jest.spyOn(command, 'getEditor').mockReturnValue(null);
      (isNodeSelectionForNodeType as jest.Mock).mockReturnValue(true);
      expect(command.isEnabled(mockState)).toBe(false);
    });

    it('should return true if no image node is selected', () => {
      (isNodeSelectionForNodeType as jest.Mock).mockReturnValue(false);
      expect(command.isEnabled(mockState)).toBe(true);
    });
  });

  describe('execute', () => {
    it('should call toggleList and dispatch when docChanged is true', () => {
      (toggleList as jest.Mock).mockReturnValue({ docChanged: true });
      const result = command.execute(mockState, mockDispatch);

      expect(mockState.tr.setSelection).toHaveBeenCalledWith(
        mockState.selection
      );
      expect(toggleList).toHaveBeenCalledWith(
        expect.any(Object),
        mockState.schema,
        mockState.schema.nodes.ordered_list,
        'ordered'
      );
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toBe(true);
    });

    it('should not call dispatch when docChanged is false', () => {
      command = new ListToggleCommand(false, 'bullet_list');
      (toggleList as jest.Mock).mockReturnValue({ docChanged: false });
      const result = command.execute(mockState, mockDispatch);

      expect(mockState.tr.setSelection).toHaveBeenCalledWith(
        mockState.selection
      );
      expect(toggleList).toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return tr if nodeType is empty', () => {
      const mocktr = {
        setSelection: jest.fn().mockReturnThis(),
      };
      const dummyState = {
        schema: {
          nodes: {},
        },
        selection: {},
        tr: mocktr,
      } as unknown as EditorState;

      (toggleList as jest.Mock).mockReturnValue({ docChanged: false });

      command.execute(dummyState, mockDispatch);

      expect(dummyState.tr).toBe(mocktr);
    });
  });

  describe('hasImageNode', () => {
    it('should return true if the selection is an image node', () => {
      (isNodeSelectionForNodeType as jest.Mock).mockReturnValue(true);
      const result = hasImageNode(mockState);
      expect(result).toBe(true);
    });

    it('should return false if the selection is not an image node', () => {
      (isNodeSelectionForNodeType as jest.Mock).mockReturnValue(false);
      const result = hasImageNode(mockState);
      expect(result).toBe(false);
    });
  });

  describe('waitForUserInput', () => {
    it('should resolve to undefined', async () => {
      const result = await command.waitForUserInput(mockState);
      expect(result).toBeUndefined();
    });
  });

  describe('executeWithUserInput', () => {
    it('should return false', () => {
      const result = command.executeWithUserInput(mockState);
      expect(result).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should return null', () => {
      const result = command.cancel();
      expect(result).toBeNull();
    });
  });

  describe('executeCustom', () => {
    it('should return the given Transform', () => {
      const mockTransform = {} as Transform;
      const result = command.executeCustom(mockState, mockTransform, 0, 1);
      expect(result).toBe(mockTransform);
    });
  });
});
