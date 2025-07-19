import {
    BACKSPACE,
    DELETE,
    DOWN_ARROW,
    ENTER,
    LEFT_ARROW,
    RIGHT_ARROW,
    TAB,
    UP_ARROW,
  } from './keyCodes';
  
  describe('Key Codes', () => {
    it('should have the correct BACKSPACE key code', () => {
      expect(BACKSPACE).toBe(8);
    });
  
    it('should have the correct DELETE key code', () => {
      expect(DELETE).toBe(46);
    });
  
    it('should have the correct DOWN_ARROW key code', () => {
      expect(DOWN_ARROW).toBe(40);
    });
  
    it('should have the correct ENTER key code', () => {
      expect(ENTER).toBe(13);
    });
  
    it('should have the correct LEFT_ARROW key code', () => {
      expect(LEFT_ARROW).toBe(37);
    });
  
    it('should have the correct RIGHT_ARROW key code', () => {
      expect(RIGHT_ARROW).toBe(39);
    });
  
    it('should have the correct TAB key code', () => {
      expect(TAB).toBe(9);
    });
  
    it('should have the correct UP_ARROW key code', () => {
      expect(UP_ARROW).toBe(38);
    });
  });
  