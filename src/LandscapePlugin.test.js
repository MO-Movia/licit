import LandscapePlugin from './LandscapePlugin.js';

describe('LandscapePlugin scroll proxy', () => {
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

    return { pluginView, sections };
  }

  afterEach(() => {
    document.body.innerHTML = '';
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
});
