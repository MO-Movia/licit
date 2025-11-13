/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { preLoadFonts } from '../specs/fontTypeMarkSpec'; 

describe('preLoadFonts', () => {
  it('should preload fonts without throwing', () => {
    expect(() => preLoadFonts()).not.toThrow();
  });
});
