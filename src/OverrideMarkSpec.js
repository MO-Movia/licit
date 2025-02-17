const OverrideMarkSpec: MarkSpec = {
    attrs: {
        strong: { default: false },
        em: { default: false },
        underline: { default: false },
        strike: { default: false },
    },
    inline: true,
    group: 'inline',
    parseDOM: [
        {
            tag: 'span',
            getAttrs: (dom) => {
                const strong = dom.getAttribute('cs-strong') === 'true';
                const em = dom.getAttribute('cs-em') === 'true';
                const underline = dom.getAttribute('cs-underline') === 'true';
                const strike = dom.getAttribute('cs-strike') === 'true';

                // Only create the mark if at least one attribute is true
                if (strong || em || underline || strike) {
                    return { strong, em, underline, strike };
                }

                return false; // Ignore spans where all attributes are false
            },
        },
    ],
    toDOM: (mark) => {
        // Only render the <span> if at least one attribute is true
        if (mark.attrs.strong || mark.attrs.em || mark.attrs.underline || mark.attrs.strike) {
            return [
                'span',
                {
                    'cs-strong': mark.attrs.strong,
                    'cs-em': mark.attrs.em,
                    'cs-underline': mark.attrs.underline,
                    'cs-strike': mark.attrs.strike,
                },
                0,
            ];
        }

        // If no attributes are true, return nothing (ProseMirror will ignore this)
        return null;
    },
};

export default OverrideMarkSpec;
