import { Extension } from '@tiptap/core';
import  Toolbar  from './toolBar';
const tb = Toolbar;
describe('Toolbar', () => {
  describe('Toolbar type', () => {
    it('should match the Extension', () => {
      expect(tb).toBeInstanceOf(Extension);
    });
  });
});