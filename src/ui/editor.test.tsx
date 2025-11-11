import { preLoadFonts } from '../specs/fontTypeMarkSpec'; 

describe('preLoadFonts', () => {
  it('should preload fonts without throwing', () => {
    expect(() => preLoadFonts()).not.toThrow();
  });
});
