import { Schema, NodeSpec } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { getEffectiveSchema, LicitPlugin } from './convertFromJSON';

describe('getEffectiveSchema', () => {
    let defaultSchema: Schema;
    let defaultPlugins: Plugin[];

    beforeEach(() => {
        defaultSchema = new Schema({
            nodes: {
                doc: {} as NodeSpec,
                paragraph: {} as NodeSpec,
                text: {} as NodeSpec,
            },
            marks: {},
        });

        defaultPlugins = [new Plugin({})];
    });

    test('should return default schema when no plugins are provided', () => {
        const result = getEffectiveSchema(defaultSchema, defaultPlugins);
        expect(result).toBe(defaultSchema);
    });

    test('should return updated schema if plugin has getEffectiveSchema', () => {
        const mockPlugin: LicitPlugin = {
            ...new Plugin({}),
            getEffectiveSchema: jest.fn((schema) => {
                return new Schema({
                    nodes: schema.spec.nodes.append({
                        customNode: {} as NodeSpec, // Properly define NodeSpec
                    }),
                    marks: schema.spec.marks,
                });
            }),
            initKeyCommands: jest.fn(() => new Plugin({})),
            initButtonCommands: jest.fn(),
            getState: jest.fn()
        };

        const result = getEffectiveSchema(defaultSchema, defaultPlugins, [mockPlugin]);

        expect(mockPlugin.getEffectiveSchema).toHaveBeenCalledWith(defaultSchema);
        expect(result.spec.nodes.get('customNode')).toBeDefined(); // Correct check
    });

    test('should add key command plugins when initKeyCommands exists', () => {
        const keyCommandPlugin = new Plugin({});
        const mockPlugin: LicitPlugin = {
            ...new Plugin({}),
            getEffectiveSchema: jest.fn((schema) => schema),
            initKeyCommands: jest.fn(() => keyCommandPlugin),
            initButtonCommands: jest.fn(),
            getState: jest.fn()
        };

        const result = getEffectiveSchema(defaultSchema, defaultPlugins, [mockPlugin]);

        expect(mockPlugin.initKeyCommands).toHaveBeenCalled();
        expect(result).toBe(defaultSchema);
    });

    test('should avoid adding duplicate plugins', () => {
        const mockPlugin: LicitPlugin = {
            ...new Plugin({}),
            getEffectiveSchema: jest.fn((schema) => schema),
            initKeyCommands: jest.fn(() => new Plugin({})),
            initButtonCommands: jest.fn(),
            getState: jest.fn()
        };

        const result = getEffectiveSchema(defaultSchema, [...defaultPlugins, mockPlugin], [mockPlugin]);

        expect(defaultPlugins.length).toBe(1); // Ensures no duplicates are added
        expect(result).toBe(defaultSchema);
    });
});
