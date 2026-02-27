
/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { Plugin, PluginKey, TextSelection, EditorState, Transaction } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import LandscapeSectionNodeSpec from '../specs/landscapeSectionNodeSpec';
import { LandscapeCommand } from '../commands/LandscapeCommand';
import { keymap } from 'prosemirror-keymap';
import { EditorView } from 'prosemirror-view';

const LANDSCAPE_NODE_SELECTOR = 'section.section-landscape';
const EDITOR_SCROLL_SELECTOR = '.czi-editor-frame-body-scroll';
const PROXY_SCROLLBAR_CLASS = 'czi-landscape-horizontal-proxy';
const PROXY_SCROLLBAR_TRACK_CLASS = 'czi-landscape-horizontal-proxy-track';
const PROXY_SCROLLBAR_VISIBLE_CLASS = 'czi-visible';
const PROXY_SCROLLBAR_CONTAINER_CLASS = 'czi-landscape-proxy-visible';

class LandscapeScrollProxyView {
    private editorView: EditorView;
    private scrollContainer: HTMLElement = null;
    private frameBodyContainer: HTMLElement = null;
    private proxyScrollbar: HTMLElement = null;
    private proxyScrollbarTrack: HTMLElement = null;
    private observer: IntersectionObserver = null;
    private activeLandscape: HTMLElement = null;
    private syncingFromProxy = false;
    private syncingFromLandscape = false;

    constructor(editorView: EditorView) {
        this.editorView = editorView;
        this.scrollContainer = this.findScrollContainer();
        this.frameBodyContainer = this.findFrameBodyContainer();

        if (!this.scrollContainer || !this.frameBodyContainer) {
            return;
        }

        this.ensureProxyScrollbar();
        this.bindProxyScrollbar();
        this.bindEditorScroll();
        this.observeLandscapeNodes();
        this.refresh();
    }

    update(editorView: EditorView, prevState: EditorState): void {
        this.editorView = editorView;

        if (!this.scrollContainer) {
            this.scrollContainer = this.findScrollContainer();
            this.frameBodyContainer = this.findFrameBodyContainer();
            if (!this.scrollContainer || !this.frameBodyContainer) {
                return;
            }
            this.ensureProxyScrollbar();
            this.bindProxyScrollbar();
            this.bindEditorScroll();
            this.observeLandscapeNodes();
        }

        if (prevState?.doc !== editorView.state.doc) {
            this.observeLandscapeNodes();
        }

        this.refresh();
    }

    destroy(): void {
        this.observer?.disconnect();
        this.observer = null;

        this.scrollContainer?.removeEventListener('scroll', this.onEditorScroll);

        if (this.activeLandscape) {
            this.activeLandscape.removeEventListener('scroll', this.onLandscapeScroll);
            this.activeLandscape = null;
        }

        if (this.proxyScrollbar) {
            this.proxyScrollbar.removeEventListener('scroll', this.onProxyScroll);
            this.proxyScrollbar.remove();
            this.proxyScrollbar = null;
            this.proxyScrollbarTrack = null;
        }

        this.scrollContainer?.classList.remove(PROXY_SCROLLBAR_CONTAINER_CLASS);
    }

    private findScrollContainer(): HTMLElement {
        const closest = this.editorView?.dom?.closest(EDITOR_SCROLL_SELECTOR);
        if (closest instanceof HTMLElement) {
            return closest;
        }
        const fallback = document.querySelector(EDITOR_SCROLL_SELECTOR);
        return fallback instanceof HTMLElement ? fallback : null;
    }

    private findFrameBodyContainer(): HTMLElement {
        if (!this.scrollContainer) {
            return null;
        }
        const parent = this.scrollContainer.parentElement;
        if (parent instanceof HTMLElement && parent.classList.contains('czi-editor-frame-body')) {
            return parent;
        }
        return parent instanceof HTMLElement ? parent : null;
    }

    private ensureProxyScrollbar(): void {
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

    private bindProxyScrollbar(): void {
        this.proxyScrollbar?.removeEventListener('scroll', this.onProxyScroll);
        this.proxyScrollbar?.addEventListener('scroll', this.onProxyScroll, {
            passive: true,
        });
    }

    private bindEditorScroll(): void {
        this.scrollContainer?.removeEventListener('scroll', this.onEditorScroll);
        this.scrollContainer?.addEventListener('scroll', this.onEditorScroll, {
            passive: true,
        });
    }

    private onEditorScroll = (): void => {
        this.refresh();
    };

    private onProxyScroll = (): void => {
        if (!this.activeLandscape || !this.proxyScrollbar || this.syncingFromLandscape) {
            return;
        }
        this.syncingFromProxy = true;
        this.activeLandscape.scrollLeft = this.proxyScrollbar.scrollLeft;
        this.syncingFromProxy = false;
    };

    private onLandscapeScroll = (): void => {
        if (!this.activeLandscape || !this.proxyScrollbar || this.syncingFromProxy) {
            return;
        }
        this.syncingFromLandscape = true;
        this.proxyScrollbar.scrollLeft = this.activeLandscape.scrollLeft;
        this.syncingFromLandscape = false;
    };

    private observeLandscapeNodes(): void {
        this.observer?.disconnect();
        this.observer = null;

        if (!this.scrollContainer || typeof IntersectionObserver === 'undefined') {
            return;
        }

        const nodes = this.getLandscapeNodes();
        this.observer = new IntersectionObserver(this.onIntersection, {
            root: this.scrollContainer,
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        });

        nodes.forEach((node) => this.observer.observe(node));
    }

    private onIntersection = (): void => {
        this.refresh();
    };

    private refresh(): void {
        const nextActiveLandscape = this.pickActiveLandscapeNode();
        this.setActiveLandscape(nextActiveLandscape);
        this.syncProxyWithActiveLandscape();
    }

    private getLandscapeNodes(): HTMLElement[] {
        if (!this.editorView?.dom) {
            return [];
        }
        return Array.from(
            this.editorView.dom.querySelectorAll(LANDSCAPE_NODE_SELECTOR)
        ) as HTMLElement[];
    }

    private pickActiveLandscapeNode(): HTMLElement {
        if (!this.scrollContainer) {
            return null;
        }

        const rootRect = this.scrollContainer.getBoundingClientRect();
        const nodes = this.getLandscapeNodes();
        let bestNode: HTMLElement = null;
        let bestScore = Number.NEGATIVE_INFINITY;

        nodes.forEach((node) => {
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

    private setActiveLandscape(node: HTMLElement): void {
        if (this.activeLandscape === node) {
            return;
        }

        if (this.activeLandscape) {
            this.activeLandscape.removeEventListener('scroll', this.onLandscapeScroll);
        }

        this.activeLandscape = node;

        if (this.activeLandscape) {
            this.activeLandscape.addEventListener('scroll', this.onLandscapeScroll, {
                passive: true,
            });
        }
    }

    private syncProxyWithActiveLandscape(): void {
        if (!this.scrollContainer || !this.proxyScrollbar || !this.proxyScrollbarTrack) {
            return;
        }

        if (!this.activeLandscape) {
            this.hideProxyScrollbar();
            return;
        }

        const totalWidth = this.activeLandscape.scrollWidth;
        const visibleWidth = this.activeLandscape.clientWidth;
        const maxScroll = totalWidth - visibleWidth;

        if (maxScroll <= 1) {
            this.hideProxyScrollbar();
            return;
        }

        this.proxyScrollbar.classList.add(PROXY_SCROLLBAR_VISIBLE_CLASS);
        this.scrollContainer.classList.add(PROXY_SCROLLBAR_CONTAINER_CLASS);
        const proxyViewportWidth =
            this.proxyScrollbar.clientWidth || this.scrollContainer.clientWidth;
        this.proxyScrollbarTrack.style.width = `${
            Math.ceil(proxyViewportWidth + maxScroll)
        }px`;

        if (!this.syncingFromLandscape) {
            this.proxyScrollbar.scrollLeft = this.activeLandscape.scrollLeft;
        }
    }

    private hideProxyScrollbar(): void {
        if (!this.proxyScrollbar || !this.proxyScrollbarTrack) {
            return;
        }
        this.proxyScrollbar.classList.remove(PROXY_SCROLLBAR_VISIBLE_CLASS);
        this.proxyScrollbarTrack.style.width = '0px';
        this.proxyScrollbar.scrollLeft = 0;
        this.scrollContainer?.classList.remove(PROXY_SCROLLBAR_CONTAINER_CLASS);
    }
}

export class LandscapePlugin extends Plugin {
    _command: LandscapeCommand;

    constructor() {
        super({
            key: new PluginKey('LandscapePlugin'),
            view(editorView: EditorView) {
                return new LandscapeScrollProxyView(editorView);
            },
        });
        this._command = new LandscapeCommand();
    }

    getEffectiveSchema(schema: Schema): Schema {
        const nodes = schema.spec.nodes;
        const marks = schema.spec.marks;

        // Add landscape_section to nodes
        const newNodes = nodes.addToEnd(
            'landscape_section',
            LandscapeSectionNodeSpec
        );

        return new Schema({
            nodes: newNodes,
            marks: marks,
        });
    }

    initKeyCommands(): Plugin {
        return keymap({
            'Mod-Enter': (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
                const { $head, $from } = state.selection;

                // Strategy: find the nearest landscape_section ancestor
                let landscapeDepth = -1;
                for (let d = $from.depth; d > 0; d--) {
                    if ($from.node(d).type.name === 'landscape_section') {
                        landscapeDepth = d;
                        break;
                    }
                }

                if (landscapeDepth > -1) {
                    const landscapeNode = $from.node(landscapeDepth);

                    // Check if we are at the end of the landscape section content
                    const indexAfter = $from.indexAfter(landscapeDepth);
                    const isLastNode = indexAfter === landscapeNode.childCount;

                    // Also need to check if the selection is at the end of its parent content
                    const parent = $from.parent;
                    const isAtEnd = $head.parentOffset === parent.content.size;

                    if (isLastNode && isAtEnd) {
                        if (dispatch) {
                            // Start position of the next node after landscape section
                            const posAfter = $from.after(landscapeDepth);
                            // Insert a new paragraph after the landscape section
                            const tr = state.tr.insert(
                                posAfter,
                                state.schema.nodes.paragraph.createAndFill()
                            );
                            tr.setSelection(TextSelection.create(tr.doc, posAfter + 1));
                            dispatch(tr);
                        }
                        return true;
                    }
                }
                return false;
            },
        });
    }

    initButtonCommands(_theme: string): LandscapeCommand {
        return this._command;
    }
}

export default LandscapePlugin;
