/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import TableBackgroundColorCommand from './tableBackgroundColorCommand';

describe('TableBackgroundColorCommand', () => {
  let command: TableBackgroundColorCommand;
  let stateMock;
  let trMock;
  let fromMock;
  let toMock;

  beforeEach(() => {
    // Mock necessary objects
    stateMock = {} as EditorState;
    trMock = {} as Transform;
    fromMock = 0;
    toMock = 0;

    // Create an instance of TableBackgroundColorCommand
    command = new TableBackgroundColorCommand();
  });

  // Test for the constructor
  it('should call the parent constructor with "backgroundColor"', () => {
    // Check if the parent constructor was called with 'backgroundColor'
    expect(command.attribute).toBe('backgroundColor');
  });

  // Test for executeCustom method
  it('should return the same transform object it receives', () => {
    const result = command.executeCustom(stateMock, trMock, fromMock, toMock);
    // Assert that the result is the same as the input transform (trMock)
    expect(result).toBe(trMock);
  });
});
