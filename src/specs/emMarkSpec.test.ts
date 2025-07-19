import EMMarkSpec from './emMarkSpec'; // Adjust import path
import { Mark } from 'prosemirror-model';

describe('EMMarkSpec', () => {
  it('parseDOM should parse <em> and <i> tags', () => {
    const domElementI = { tagName: 'i' }; // Simulate <i> tag
    const parsedAttrsI = EMMarkSpec.parseDOM.find(rule => rule.tag === domElementI.tagName);
    expect(parsedAttrsI).toBeTruthy(); // Since we only care about whether <i> triggers this

    const domElementEm = { tagName: 'em' }; // Simulate <em> tag
    const parsedAttrsEm = EMMarkSpec.parseDOM.find(rule => rule.tag === domElementEm.tagName);
    expect(parsedAttrsEm).toBeTruthy(); // Check if <em> tag is recognized

    const domElementStyle = { style: 'font-style=italic' }; // Simulate <em> tag
    const parsedAttrsStyle = EMMarkSpec.parseDOM.find((rule:any) => rule.style === domElementStyle.style);
    expect(parsedAttrsStyle).toBeTruthy(); // Check if <em> tag is recognized
  });

  it('toDOM should return <em> tag with correct DOM structure', () => {
    const markSpec = EMMarkSpec;

    // Create a mock Mark instance
    const mockMark = {
      attrs: {}
    } as Mark;

    // Check the output of the toDOM method
    const domOutput = markSpec.toDOM(mockMark, false);
    expect(domOutput).toEqual(['em', 0]); // Should return <em> with no additional attributes
  });
});
