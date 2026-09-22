import LandscapePlugin from './LandscapePlugin.js';
import ResizeObserver from './ui/ResizeObserver.js';

jest.mock('./ui/ResizeObserver.js', () => ({
  __esModule: true,
  default: {
    observe: jest.fn(),
    unobserve: jest.fn(),
  },
}));

describe('LandscapePlugin scroll proxy', () => {
  let animationCallbacks;

  beforeEach(() => {
    animationCallbacks = [];
    window.requestAnimationFrame = jest.fn((callback) => {
      animationCallbacks.push(callback);
      return animationCallbacks.length;
    });
    window.cancelAnimationFrame = jest.fn();
  });

  function setElementWidth(element, width) {
    Object.defineProperty(element, 'clientWidth', {
      configurable: true,
      value: width,
    });
  }

  function setElementRect(element, { height = 100, left = 0, top = 0, width }) {
    element.getBoundingClientRect = () => ({
      bottom: top + height,
      height,
      left,
      right: left + width,
      top,
      width,
      x: left,
      y: top,
    });
  }

  function createPluginView(sectionCount = 3) {
    const frameBody = document.createElement('div');
    frameBody.className = 'czi-editor-frame-body';

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'czi-editor-frame-body-scroll';

    const editorDom = document.createElement('div');
    const sections = Array.from({ length: sectionCount }, () => {
      const section = document.createElement('section');
      section.className = 'section-landscape';
      editorDom.appendChild(section);
      return section;
    });

    scrollContainer.appendChild(editorDom);
    frameBody.appendChild(scrollContainer);
    document.body.appendChild(frameBody);

    const plugin = new LandscapePlugin();
    const pluginView = plugin.spec.view({
      dom: editorDom,
      state: { doc: {} },
    });

    return { editorDom, frameBody, pluginView, scrollContainer, sections };
  }

  afterEach(() => {
    document.body.innerHTML = '';
    delete window.requestAnimationFrame;
    delete window.cancelAnimationFrame;
  });

  it('scrolls every landscape section when the proxy scrollbar is moved', () => {
    const { pluginView, sections } = createPluginView();

    pluginView._setActiveLandscape(sections[0]);
    pluginView.proxyScrollbar.scrollLeft = 120;
    pluginView._onProxyScroll();

    expect(sections.map((section) => section.scrollLeft)).toEqual([
      120,
      120,
      120,
    ]);

    pluginView.destroy();
  });

  it('keeps every landscape section aligned when the active section scrolls', () => {
    const { pluginView, sections } = createPluginView();

    pluginView._setActiveLandscape(sections[0]);
    sections[0].scrollLeft = 80;
    pluginView._onLandscapeScroll();

    expect(pluginView.proxyScrollbar.scrollLeft).toBe(80);
    expect(sections.map((section) => section.scrollLeft)).toEqual([
      80,
      80,
      80,
    ]);

    pluginView.destroy();
  });

  it('refreshes the proxy when the editor viewport resizes', () => {
    const { pluginView, scrollContainer, sections } = createPluginView(1);
    const section = sections[0];

    setElementRect(scrollContainer, { height: 500, left: 0, width: 900 });
    setElementWidth(scrollContainer, 900);
    setElementRect(section, { height: 100, left: 0, top: 100, width: 900 });
    Object.defineProperty(section, 'scrollWidth', {
      configurable: true,
      value: 1054,
    });
    setElementWidth(section, 900);

    const resizeCallback = ResizeObserver.observe.mock.calls[0][1];
    resizeCallback();
    animationCallbacks.shift()();
    expect(pluginView.proxyScrollbar.classList.contains('czi-visible')).toBe(true);

    setElementWidth(section, 1054);
    resizeCallback();
    animationCallbacks.shift()();
    expect(pluginView.proxyScrollbar.classList.contains('czi-visible')).toBe(false);

    pluginView.destroy();
  });

  it('hides the proxy when the complete landscape width is visible', () => {
    const { pluginView, sections } = createPluginView(1);
    const section = sections[0];

    Object.defineProperty(section, 'scrollWidth', {
      configurable: true,
      value: 1054,
    });
    setElementWidth(section, 900);
    pluginView._setActiveLandscape(section);
    pluginView._syncProxyWithActiveLandscape();
    expect(pluginView.proxyScrollbar.classList.contains('czi-visible')).toBe(true);

    setElementWidth(section, 1054);
    pluginView._syncProxyWithActiveLandscape();
    expect(pluginView.proxyScrollbar.classList.contains('czi-visible')).toBe(false);

    pluginView.destroy();
  });

  it('removes resize observation and pending work on destroy', () => {
    const { frameBody, pluginView } = createPluginView(1);
    const resizeCallback = ResizeObserver.observe.mock.calls[0][1];
    resizeCallback();
    const resizeFrameID = pluginView.resizeFrameID;

    pluginView.destroy();

    expect(ResizeObserver.unobserve).toHaveBeenCalledWith(
      frameBody,
      pluginView._onEditorResize
    );
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(resizeFrameID);
  });
});
