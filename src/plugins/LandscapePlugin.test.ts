import { Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { LandscapePlugin } from './LandscapePlugin';
import { LandscapeCommand } from '../commands/LandscapeCommand';

describe('LandscapePlugin', () => {
    let schema: Schema;

    beforeEach(() => {
        schema = new Schema({
            nodes: {
                doc: { content: 'block+' },
                paragraph: { content: 'text*', group: 'block' },
                text: { group: 'inline' },
            },
            marks: {},
        });
    });

    test('should initialize with a LandscapeCommand', () => {
        const plugin = new LandscapePlugin();
        expect(plugin).toBeInstanceOf(Plugin);
        const command = plugin.initButtonCommands(null);
        expect(command).toBeInstanceOf(LandscapeCommand);
    });

    test('should add landscape_section to the schema', () => {
        const plugin = new LandscapePlugin();
        const effectiveSchema = plugin.getEffectiveSchema(schema);
        expect(effectiveSchema.nodes['landscape_section']).toBeDefined();
    });

    test('should return a keymap plugin', () => {
        const plugin = new LandscapePlugin();
        const keymapPlugin = plugin.initKeyCommands();
        expect(keymapPlugin).toBeInstanceOf(Plugin);
    });
});
