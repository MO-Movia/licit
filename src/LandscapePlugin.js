// @flow

import { keymap } from 'prosemirror-keymap';
import { EditorState, Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { LANDSCAPE_SECTION } from './NodeNames.js';

const LANDSCAPE_NODE_SELECTOR = 'section.section-landscape';
const EDITOR_SCROLL_SELECTOR = '.czi-editor-frame-body-scroll';
const PROXY_SCROLLBAR_CLASS = 'czi-landscape-horizontal-proxy';
const PROXY_SCROLLBAR_TRACK_CLASS = 'czi-landscape-horizontal-proxy-track';
const PROXY_SCROLLBAR_VISIBLE_CLASS = 'czi-visible';
const PROXY_SCROLLBAR_CONTAINER_CLASS = 'czi-landscape-proxy-visible';

class LandscapeScrollProxyView {
  editorView: EditorView;
  scrollContainer: ?HTMLElement = null;
  frameBodyContainer: ?HTMLElement = null;
  proxyScrollbar: ?HTMLElement = null;
  proxyScrollbarTrack: ?HTMLElement = null;
  observer: ?IntersectionObserver = null;
  activeLandscape: ?HTMLElement = null;
  syncingFromProxy: boolean = false;
  syncingFromLandscape: boolean = false;

  constructor(editorView: EditorView) {
    this.editorView = editorView;
    this.scrollContainer = this._findScrollContainer();
    this.frameBodyContainer = this._findFrameBodyContainer();

    if (!this.scrollContainer || !this.frameBodyContainer) {
      return;
    }

    this._ensureProxyScrollbar();
    this._bindProxyScrollbar();
    this._bindEditorScroll();
    this._observeLandscapeNodes();
    this._refresh();
  }

  update(editorView: EditorView, prevState: EditorState): void {
    this.editorView = editorView;

    if (!this.scrollContainer) {
      this.scrollContainer = this._findScrollContainer();
      this.frameBodyContainer = this._findFrameBodyContainer();
      if (!this.scrollContainer || !this.frameBodyContainer) {
        return;
      }
      this._ensureProxyScrollbar();
      this._bindProxyScrollbar();
      this._bindEditorScroll();
      this._observeLandscapeNodes();
    }

    if (prevState?.doc !== editorView.state.doc) {
      this._observeLandscapeNodes();
    }

    this._refresh();
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.scrollContainer?.removeEventListener('scroll', this._onEditorScroll);

    if (this.activeLandscape) {
      this.activeLandscape.removeEventListener('scroll', this._onLandscapeScroll);
      this.activeLandscape = null;
    }

    if (this.proxyScrollbar) {
      this.proxyScrollbar.removeEventListener('scroll', this._onProxyScroll);
      this.proxyScrollbar.remove();
      this.proxyScrollbar = null;
      this.proxyScrollbarTrack = null;
    }

    this.scrollContainer?.classList.remove(PROXY_SCROLLBAR_CONTAINER_CLASS);
  }

  _findScrollContainer(): ?HTMLElement {
    const closest = this.editorView?.dom?.closest(EDITOR_SCROLL_SELECTOR);
    if (closest instanceof HTMLElement) {
      return closest;
    }
    const fallback = document.querySelector(EDITOR_SCROLL_SELECTOR);
    return fallback instanceof HTMLElement ? fallback : null;
  }

  _findFrameBodyContainer(): ?HTMLElement {
    if (!this.scrollContainer) {
      return null;
    }
    const parent = this.scrollContainer.parentElement;
    if (
      parent instanceof HTMLElement &&
      parent.classList.contains('czi-editor-frame-body')
    ) {
      return parent;
    }
    return parent instanceof HTMLElement ? parent : null;
  }

  _ensureProxyScrollbar(): void {
    if (!this.frameBodyContainer || this.proxyScrollbar) {
      return;
    }

    const proxy = document.createElement('div');
    proxy.className = PROXY_SCROLLBAR_CLASS;

    const track = document.createElement('div');
    track.className = PROXY_SCROLLBAR_TRACK_CLASS;
    proxy.appendChild(track);

    this.frameBodyContainer.appendChild(proxy);
    this.proxyScrollbar = proxy;
    this.proxyScrollbarTrack = track;
  }

  _bindProxyScrollbar(): void {
    this.proxyScrollbar?.removeEventListener('scroll', this._onProxyScroll);
    this.proxyScrollbar?.addEventListener('scroll', this._onProxyScroll, {
      passive: true,
    });
  }

  _bindEditorScroll(): void {
    this.scrollContainer?.removeEventListener('scroll', this._onEditorScroll);
    this.scrollContainer?.addEventListener('scroll', this._onEditorScroll, {
      passive: true,
    });
  }

  _onEditorScroll = (): void => {
    this._refresh();
  };

  _onProxyScroll = (): void => {
    if (!this.activeLandscape || !this.proxyScrollbar || this.syncingFromLandscape) {
      return;
    }
    this.syncingFromProxy = true;
    this._syncLandscapeNodesScrollLeft(this.proxyScrollbar.scrollLeft);
    this.syncingFromProxy = false;
  };

  _onLandscapeScroll = (): void => {
    if (!this.activeLandscape || !this.proxyScrollbar || this.syncingFromProxy) {
      return;
    }
    this.syncingFromLandscape = true;
    this.proxyScrollbar.scrollLeft = this.activeLandscape.scrollLeft;
    this._syncLandscapeNodesScrollLeft(
      this.activeLandscape.scrollLeft,
      this.activeLandscape
    );
    this.syncingFromLandscape = false;
  };

  _observeLandscapeNodes(): void {
    this.observer?.disconnect();
    this.observer = null;

    if (!this.scrollContainer || typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.observer = new IntersectionObserver(this._onIntersection, {
      root: this.scrollContainer,
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    });

    this._getLandscapeNodes().forEach((node) => this.observer?.observe(node));
  }

  _onIntersection = (): void => {
    this._refresh();
  };

  _refresh(): void {
    this._setActiveLandscape(this._pickActiveLandscapeNode());
    this._syncProxyWithActiveLandscape();
  }

  _getLandscapeNodes(): Array<HTMLElement> {
    if (!this.editorView?.dom) {
      return [];
    }
    return Array.from(this.editorView.dom.querySelectorAll(LANDSCAPE_NODE_SELECTOR));
  }

  _syncLandscapeNodesScrollLeft(
    scrollLeft: number,
    sourceNode?: ?HTMLElement
  ): void {
    this._getLandscapeNodes().forEach((node) => {
      if (node !== sourceNode && node.scrollLeft !== scrollLeft) {
        node.scrollLeft = scrollLeft;
      }
    });
  }

  _pickActiveLandscapeNode(): ?HTMLElement {
    if (!this.scrollContainer) {
      return null;
    }

    const rootRect = this.scrollContainer.getBoundingClientRect();
    let bestNode = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    this._getLandscapeNodes().forEach((node) => {
      const rect = node.getBoundingClientRect();
      const overlap = Math.min(rect.bottom, rootRect.bottom) - Math.max(rect.top, rootRect.top);
      if (overlap <= 0) {
        return;
      }

      const distanceFromTop = Math.abs(rect.top - rootRect.top);
      const score = overlap - distanceFromTop * 0.01;
      if (score > bestScore) {
        bestScore = score;
        bestNode = node;
      }
    });

    return bestNode;
  }

  _setActiveLandscape(node: ?HTMLElement): void {
    if (this.activeLandscape === node) {
      return;
    }

    if (this.activeLandscape) {
      this.activeLandscape.removeEventListener('scroll', this._onLandscapeScroll);
    }

    this.activeLandscape = node;

    if (this.activeLandscape) {
      this.activeLandscape.addEventListener('scroll', this._onLandscapeScroll, {
        passive: true,
      });
    }
  }

  _syncProxyWithActiveLandscape(): void {
    if (!this.scrollContainer || !this.proxyScrollbar || !this.proxyScrollbarTrack) {
      return;
    }

    if (!this.activeLandscape) {
      this._hideProxyScrollbar();
      return;
    }

    const totalWidth = this.activeLandscape.scrollWidth;
    const visibleWidth = this.activeLandscape.clientWidth;
    const maxScroll = totalWidth - visibleWidth;

    if (maxScroll <= 1) {
      this._hideProxyScrollbar();
      return;
    }

    this.proxyScrollbar.classList.add(PROXY_SCROLLBAR_VISIBLE_CLASS);
    this.scrollContainer.classList.add(PROXY_SCROLLBAR_CONTAINER_CLASS);
    const proxyViewportWidth =
      this.proxyScrollbar.clientWidth || this.scrollContainer.clientWidth;
    this.proxyScrollbarTrack.style.width = `${Math.ceil(proxyViewportWidth + maxScroll)}px`;

    if (!this.syncingFromLandscape) {
      this.proxyScrollbar.scrollLeft = this.activeLandscape.scrollLeft;
    }
  }

  _hideProxyScrollbar(): void {
    if (!this.proxyScrollbar || !this.proxyScrollbarTrack) {
      return;
    }
    this.proxyScrollbar.classList.remove(PROXY_SCROLLBAR_VISIBLE_CLASS);
    this.proxyScrollbarTrack.style.width = '0px';
    this.proxyScrollbar.scrollLeft = 0;
    this.scrollContainer?.classList.remove(PROXY_SCROLLBAR_CONTAINER_CLASS);
  }
}

class LandscapePlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('LandscapePlugin'),
      view(editorView: EditorView) {
        return new LandscapeScrollProxyView(editorView);
      },
    });
  }

  initKeyCommands(): Plugin {
    return keymap({
      'Mod-Enter': (
        state: EditorState,
        dispatch: ?(tr: Transform) => void
      ): boolean => {
        const { $head, $from } = state.selection;
        let landscapeDepth = -1;

        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name === LANDSCAPE_SECTION) {
            landscapeDepth = depth;
            break;
          }
        }

        if (landscapeDepth < 0) {
          return false;
        }

        const landscapeNode = $from.node(landscapeDepth);
        const isLastNode = $from.indexAfter(landscapeDepth) === landscapeNode.childCount;
        const isAtEnd = $head.parentOffset === $from.parent.content.size;

        if (!isLastNode || !isAtEnd) {
          return false;
        }

        if (dispatch) {
          const posAfter = $from.after(landscapeDepth);
          const tr = state.tr.insert(
            posAfter,
            state.schema.nodes.paragraph.createAndFill()
          );
          tr.setSelection(TextSelection.create(tr.doc, posAfter + 1));
          dispatch(tr);
        }
        return true;
      },
    });
  }
}

export default LandscapePlugin;
