import type { MarkSpec } from 'prosemirror-model';

// https://bitbucket.org/atlassian/atlaskit/src/34facee3f461/packages/editor-core/src/schema/nodes/?at=master
const StrikeMarkSpec: MarkSpec = {
  attrs: {
    overridden: { default: false }, // Optional attribute for additional logic
  },
  parseDOM: [
    {
      tag: 'strike',
      getAttrs: (dom: HTMLElement) => {
        const _overridden = dom?.getAttribute('overridden');
        return { overridden: _overridden === 'true' };
      }
    },
  ],
  toDOM(mark) {
    return ['strike', { overridden: mark.attrs?.overridden }, 0];
  },
};

export default StrikeMarkSpec;
