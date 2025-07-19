// browser.test.ts
import browser from './browser';

describe('browser', () => {
  it('should return true when isMac is called', () => {
    // Call the isMac method
    const result = browser.isMac();

    // Assert that the result is true
    expect(result).toBe(true);
  });

  it('should return false when isMac is mocked to return false', () => {
    // Mock the isMac method to return false
    jest.spyOn(browser, 'isMac').mockReturnValue(false);

    // Call the isMac method after mocking
    const result = browser.isMac();

    // Assert that the result is false after mocking
    expect(result).toBe(false);
  });
});
