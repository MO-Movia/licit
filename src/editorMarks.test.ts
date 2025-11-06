import OrderedMap from 'orderedmap'; // Ensure it's imported
import {
  MARK_LINK,
  MARK_NO_BREAK,
  MARK_CODE,
  MARK_EM,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_SPACER,
  MARK_STRIKE,
  MARK_STRONG,
  MARK_SUPER,
  MARK_SUB,
  MARK_TEXT_COLOR,
  MARK_TEXT_HIGHLIGHT,
  MARK_TEXT_SELECTION,
  MARK_UNDERLINE
} from '@modusoperandi/licit-ui-commands';
import { updateEditorMarks } from './editorMarks';
import CodeMarkSpec from './specs/codeMarkSpec';
import EMMarkSpec from './specs/emMarkSpec';
import FontSizeMarkSpec from './specs/fontSizeMarkSpec';
import FontTypeMarkSpec from './specs/fontTypeMarkSpec';
import LinkMarkSpec from './specs/linkMarkSpec';
import SpacerMarkSpec from './specs/spacerMarkSpec';
import StrikeMarkSpec from './specs/strikeMarkSpec';
import StrongMarkSpec from './specs/strongMarkSpec';
import TextColorMarkSpec from './specs/textColorMarkSpec';
import TextHighlightMarkSpec from './specs/textHighlightMarkSpec';
import TextNoWrapMarkSpec from './specs/textNoWrapMarkSpec';
import TextSelectionMarkSpec from './specs/textSelectionMarkSpec';
import TextSubMarkSpec from './specs/textSubMarkSpec';
import TextSuperMarkSpec from './specs/textSuperMarkSpec';
import TextUnderlineMarkSpec from './specs/textUnderlineMarkSpec';


// Mock OrderedMap properly
jest.mock('orderedmap', () => {
  return jest.fn().mockImplementation(() => ({
    addToEnd: jest.fn().mockReturnThis(), // Simulate method chaining
  }));
});

describe('updateEditorMarks', () => {
  it('should add the correct MarkSpec objects to the OrderedMap', () => {
    // Mock instance of OrderedMap
    const OrderedMapMock = new (OrderedMap as unknown as jest.Mock)();

    // Call the function
    updateEditorMarks(OrderedMapMock);

    // Assert that addToEnd was called with the correct arguments
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_LINK, LinkMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_NO_BREAK, TextNoWrapMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_CODE, CodeMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_EM, EMMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_FONT_SIZE, FontSizeMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_FONT_TYPE, FontTypeMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_SPACER, SpacerMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_STRIKE, StrikeMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_STRONG, StrongMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_SUPER, TextSuperMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_SUB, TextSubMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_TEXT_COLOR, TextColorMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_TEXT_HIGHLIGHT, TextHighlightMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_TEXT_SELECTION, TextSelectionMarkSpec);
    expect(OrderedMapMock.addToEnd).toHaveBeenCalledWith(MARK_UNDERLINE, TextUnderlineMarkSpec);
  });

  it('should return the updated OrderedMap', () => {
    const OrderedMapMock = new (OrderedMap as unknown as jest.Mock)();
    const updatedMap = updateEditorMarks(OrderedMapMock);

    // Ensure that the updated map is returned
    expect(updatedMap).toBe(OrderedMapMock);
  });
});
