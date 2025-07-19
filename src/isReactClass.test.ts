import isReactClass from './isReactClass';
import React from 'react';

// Mock a valid React class component
class ClassComponent extends React.Component {
    render() {
        return null;
    }
}

// Mock a functional component
const FunctionalComponent = () => null;

// Mock a non-component function
function regularFunction() {
    return 'Hello';
}

describe('isReactClass', () => {
    test('returns true for a React class component', () => {
        expect(isReactClass(ClassComponent)).toBe(true);
    });

    test('returns false for a functional component', () => {
        expect(isReactClass(FunctionalComponent)).toBe(false);
    });

    test('returns false for a regular function', () => {
        expect(isReactClass(regularFunction)).toBe(false);
    });

    test('returns false for an object', () => {
        expect(isReactClass({})).toBe(false);
    });

    test('returns false for a string', () => {
        expect(isReactClass('not a function')).toBe(false);
    });

    test('returns false for null', () => {
        expect(isReactClass(null)).toBe(false);
    });

    test('returns false for undefined', () => {
        expect(isReactClass(undefined)).toBe(false);
    });

    test('returns false for an arrow function without a prototype', () => {
        const arrowFunction = () => { };
        expect(isReactClass(arrowFunction)).toBe(false);
    });

    test('returns false for a class without extending React.Component', () => {
        class RegularClass { }
        expect(isReactClass(RegularClass)).toBe(false);
    });
});
