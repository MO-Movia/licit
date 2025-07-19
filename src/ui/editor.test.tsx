import { preLoadFonts } from '../specs/fontTypeMarkSpec'; 

// Mock the preLoadFonts function
jest.mock('../specs/fontTypeMarkSpec', () => ({
    ...jest.requireActual('../specs/fontTypeMarkSpec'),
  preLoadFonts: jest.fn(),
}));

describe('Editor Initialization', () => {
  it('should call preLoadFonts during module import', () => {
    require('./editor');
    // Verify that preLoadFonts was called
    expect(preLoadFonts).toHaveBeenCalled();
  });
});
