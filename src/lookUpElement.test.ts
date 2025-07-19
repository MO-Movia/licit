import lookUpElement from './lookUpElement';

// Mock Element class for testing purposes
class MockElement {
  nodeName: string;
  parentElement: MockElement | null;

  constructor(nodeName: string, parentElement: MockElement | null = null) {
    this.nodeName = nodeName;
    this.parentElement = parentElement;
  }
}

describe('lookUpElement', () => {
  it('should return null if the element is null', () => {
    const result = lookUpElement(null, (el) => el.nodeName === 'DIV');
    expect(result).toBeNull();
  });

  it('should return the element if it matches the predicate', () => {
    const element = new MockElement('DIV');
    const result = lookUpElement(element as any, (el) => el.nodeName === 'DIV');
    expect(result).toBe(element);
  });

  it('should return the closest element that matches the predicate', () => {
    const parent = new MockElement('SECTION');
    const child = new MockElement('DIV', parent);

    const result = lookUpElement(child as any, (el) => el.nodeName === 'SECTION');
    expect(result).toBe(parent);
  });

  it('should return null if no element matches the predicate', () => {
    const parent = new MockElement('SECTION');
    const child = new MockElement('SPAN', parent);

    const result = lookUpElement(child as any, (el) => el.nodeName === 'DIV');
    expect(result).toBeNull();
  });

  it('should return null if the element does not match and has no matching parents', () => {
    const element = new MockElement('SPAN');
    const result = lookUpElement(element as any, (el) => el.nodeName === 'DIV');
    expect(result).toBeNull();
  });

  it('should handle deeply nested elements', () => {
    const grandParent = new MockElement('DIV');
    const parent = new MockElement('SECTION', grandParent);
    const child = new MockElement('P', parent);

    const result = lookUpElement(child as any, (el) => el.nodeName === 'DIV');
    expect(result).toBe(grandParent);
  });
});
