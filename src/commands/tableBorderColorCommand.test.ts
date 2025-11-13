/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import TableBorderColorCommand from './tableBorderColorCommand';

describe('TableBorderColorCommand', () => {
  let command: TableBorderColorCommand;
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

    // Create an instance of TableBorderColorCommand
    command = new TableBorderColorCommand();
  });

  // Test for the constructor
  it('should call the parent constructor with "borderColor"', () => {
    // Check if the parent constructor was called with 'borderColor'
    expect(command.attribute).toBe('borderColor');
  });

  // Test for executeCustom method
  it('should return the same transform object it receives', () => {
    const result = command.executeCustom(stateMock, trMock, fromMock, toMock);
    // Assert that the result is the same as the input transform (trMock)
    expect(result).toBe(trMock);
  });
});
