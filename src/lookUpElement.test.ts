/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import lookUpElement from './lookUpElement';

// Define a minimal type with only what lookUpElement actually uses
interface MinimalElement {
  nodeName: string;
  parentElement: MinimalElement | null;
}

class MockElement implements MinimalElement {
  nodeName: string;
  parentElement: MinimalElement | null;

  constructor(nodeName: string, parentElement: MinimalElement | null = null) {
    this.nodeName = nodeName;
    this.parentElement = parentElement;
  }
}

describe('lookUpElement', () => {
  it('should return the matching ancestor element', () => {
    const grandParent = new MockElement('DIV');
    const parent = new MockElement('SECTION', grandParent);
    const child = new MockElement('P', parent);

    const result = lookUpElement(child as unknown as Element, (el) => el.nodeName === 'DIV');
    expect(result).toBe(grandParent);
  });

  it('should return null if no ancestor matches', () => {
    const parent = new MockElement('SPAN');
    const child = new MockElement('P', parent);

    const result = lookUpElement(child as unknown as Element, (el) => el.nodeName === 'DIV');
    expect(result).toBeNull();
  });

  it('should return null if element is null', () => {
    const result = lookUpElement(null, () => true);
    expect(result).toBeNull();
  });
});
