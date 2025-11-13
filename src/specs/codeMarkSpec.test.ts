/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {DOMOutputSpec, Mark, Schema} from 'prosemirror-model';
import CodeMarkSpec from './codeMarkSpec';

describe('CodeMarkSpec', () => {
  describe('parseDOM', () => {
    it('should define correct parseDOM rule', () => {
      expect(CodeMarkSpec.parseDOM).toEqual([{tag: 'code'}]);
    });
  });

  describe('toDOM', () => {
    it('should return the correct DOMOutputSpec when given a mock Mark', () => {
      const schema = new Schema({
        nodes: {doc: {content: 'text*'}, text: {}},
        marks: {code: CodeMarkSpec},
      });

      const mark: Mark = schema.marks.code.create();

      const result: DOMOutputSpec = CodeMarkSpec.toDOM(mark, false);

      expect(result).toEqual(['code', 0]);
    });
  });

  describe('MarkSpec properties', () => {
    it('should have the correct structure for a MarkSpec', () => {
      expect(CodeMarkSpec).toHaveProperty('parseDOM');
      expect(CodeMarkSpec).toHaveProperty('toDOM');
      expect(typeof CodeMarkSpec.toDOM).toBe('function');
      expect(Array.isArray(CodeMarkSpec.parseDOM)).toBe(true);
    });
  });
});
