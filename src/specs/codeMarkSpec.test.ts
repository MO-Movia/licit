import { DOMOutputSpec } from 'prosemirror-model';
import CodeMarkSpec from './codeMarkSpec';

describe('CodeMarkSpec', () => {
  describe('parseDOM', () => {
    it('should define correct parseDOM rule', () => {
      expect(CodeMarkSpec.parseDOM).toEqual([{ tag: 'code' }]);
    });
  });

  describe('toDOM', () => {
    it('should return the correct DOMOutputSpec when given a mock Mark', () => {
      // Mocking a Mark object as expected by the toDOM function
      const mockMark = { type: { name: 'code' }, attrs: {} };
      const result: DOMOutputSpec = CodeMarkSpec.toDOM(mockMark as any, false);
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
