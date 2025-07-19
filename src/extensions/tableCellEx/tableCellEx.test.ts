import { TableCellEx } from './tableCellEx';

describe('TableCellEx Extension', () => {
    let extension: any;

    beforeEach(() => {
        extension = TableCellEx;
    });

    test('should extend TableCell and add custom attributes', () => {
        const attributes = extension.config.addAttributes();

        expect(attributes).toHaveProperty('backgroundColor');
        expect(attributes).toHaveProperty('borderColor');

        // Default values
        expect(attributes.backgroundColor.default).toBeNull();
        expect(attributes.borderColor.default).toBeNull();
    });

    test('should render backgroundColor correctly', () => {
        const { renderHTML } = extension.config.addAttributes().backgroundColor;

        expect(renderHTML({ backgroundColor: 'red' })).toEqual({ style: 'background-color: red' });
        expect(renderHTML({})).toEqual({});
    });

    test('should parse backgroundColor correctly', () => {
        const { parseHTML } = extension.config.addAttributes().backgroundColor;

        const element = document.createElement('td');
        element.style.backgroundColor = 'blue';

        expect(parseHTML(element)).toBe('blue');
    });

    test('should render borderColor correctly', () => {
        const { renderHTML } = extension.config.addAttributes().borderColor;

        expect(renderHTML({ borderColor: 'green' })).toEqual({ style: 'border-color: green' });
        expect(renderHTML({})).toEqual({});
    });

    test('should parse borderColor correctly', () => {
        const { parseHTML } = extension.config.addAttributes().borderColor;

        const element = document.createElement('td');
        element.style.borderColor = 'black';

        expect(parseHTML(element)).toBe('black');
    });
});
