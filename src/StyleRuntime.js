// @flow

export type Style = {
  /**
   * Name of the style. Case insensitive value must be unique.
   */
  styleName: string, // Style name to display
  mode?: number, // For Style Editor UI behaviour //0 = new , 1- modify, 2- rename, 3- editall
  description?: string, // style description
  styles?: {
    align?: string, // Text align
    boldNumbering?: boolean, // true= Bold the Numbering part
    boldPartial?: boolean, // true = Bold first word
    boldSentence?: boolean, // true = Bold first sentence
    fontName?: string, // Font Name
    fontSize?: string, // Font size
    strong?: boolean, // Bold
    em?: boolean, // Italic
    underline?: boolean, // Text Underline
    color?: string, // Text colour
    textHighlight?: string, // Text highlight
    hasNumbering?: boolean, // true= The style has numbering
    paragraphSpacingAfter?: string, // Spacing after a Paragraph
    paragraphSpacingBefore?: string, // Spacing before a Paragraph
    styleLevel?: number, // Numbering heirachy level
    lineHeight?: string, // Line spacing
    isLevelbased?: boolean, // true= Text indent will be based on Level
    indent?: string, // Text indent
  },
};

export type StyleRuntime = {

  /**
   * Gets array of styles asynchronously from the service
   */
  getStylesAsync: () => Promise<Style[]>,

  // Adds / Replaces supplied style on service.
  // Resolves to server-processed style on success.
  // Rejects with Error('reason') on network or other failure.
  saveStyle(style: Style): Promise<Style>;
  /**
   * Renames an existing style from the service.
   * @param oldStyleName
   * @param newStyleName
   */
  renameStyle: (
    oldStyleName: string,
    newStyleName: string
  ) => Promise<Style[]>,

  /**
   * Remove an existing style from the service.
   * @param name
   */
  removeStyle: (name: string) => Promise<Style[]>,
};
