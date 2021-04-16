// @flow

import cx from 'classnames';
import {Node} from 'prosemirror-model';
import {Decoration} from 'prosemirror-view';
import {NodeSelection} from 'prosemirror-state';
import * as React from 'react';
import ReactDOM from 'react-dom';

import CustomNodeView from './CustomNodeView';
import {FRAMESET_BODY_CLASSNAME} from './EditorFrameset';
import Icon from './Icon';
import ImageInlineEditor from './ImageInlineEditor';
import ImageResizeBox from './ImageResizeBox';
import {MIN_SIZE} from './ImageResizeBox';
import {atAnchorBottomCenter} from './PopUpPosition';
import ResizeObserver from './ResizeObserver';
import createPopUp from './createPopUp';
import resolveImage from './resolveImage';
import uuid from './uuid';

import './czi-image-view.css';

import type {EditorRuntime} from '../Types';
import type {NodeViewProps} from './CustomNodeView';
import type {ResizeObserverEntry} from './ResizeObserver';

const EMPTY_SRC =
  'data:image/gif;base64,' +
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
export const EMPTY_DIAGRAM_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAACsXRFWHRteGZpbGUAJTNDbXhmaWxlJTIwaG9zdCUzRCUyMmFwcC5kaWFncmFtcy5uZXQlMjIlMjBtb2RpZmllZCUzRCUyMjIwMjEtMDQtMDlUMDUlM0E0NSUzQTA0LjIzNFolMjIlMjBhZ2VudCUzRCUyMjUuMCUyMChXaW5kb3dzJTIwTlQlMjA2LjMlM0IlMjBXaW42NCUzQiUyMHg2NCklMjBBcHBsZVdlYktpdCUyRjUzNy4zNiUyMChLSFRNTCUyQyUyMGxpa2UlMjBHZWNrbyklMjBDaHJvbWUlMkY4OS4wLjQzODkuMTE0JTIwU2FmYXJpJTJGNTM3LjM2JTIyJTIwZXRhZyUzRCUyMlVpWDl0Q1dqNTlMRjlWSVZTSHJVJTIyJTIwdmVyc2lvbiUzRCUyMjE0LjUuNCUyMiUyMHR5cGUlM0QlMjJkZXZpY2UlMjIlM0UlM0NkaWFncmFtJTIwaWQlM0QlMjJfb3BOR19iTGFXOEg5c1lOZVlBTiUyMiUyMG5hbWUlM0QlMjJQYWdlLTElMjIlM0VkWkU5RDRJd0VJWiUyRlRYZG9EZUtNcUlzVGczTkRUOXFrY0UycEFmMzFRa3JGQmwyYTYzUHZmUk5XdE9QWmNpT3ZLRUFUbW9pUnNDT2hOTSUyRnk2WjNCMDROZGxualFXQ1U4U2xkUXFSY3NNTWdlU2tBZkNSMmlkc3JFc01hdWc5cEZqRnVMUXl5N280NnJHdDdBQmxRMTExdDZVOExKWlN5NlglMkZrRlZDTkQ1VFE3ZUUlMkZMZzNpWnBKZGM0UENGV0VsWVlSR2R0OXF4QUQzdkx1ekZ4NTMlMkJlRCUyQk5XZWpjajRESldITlBuJTJCaEFySHdEJTNDJTJGZGlhZ3JhbSUzRSUzQyUyRm14ZmlsZSUzRQ9mAI4AAAAXSURBVChTY2QgEjASqY5hVCHekCI6eAAKaQALl4wrOAAAAABJRU5ErkJggg==';

/* This value must be synced with the margin defined at .czi-image-view */
const IMAGE_MARGIN = 2;

const MAX_SIZE = 100000;
const IMAGE_PLACEHOLDER_SIZE = 24;

const DEFAULT_ORIGINAL_SIZE = {
  src: '',
  complete: false,
  height: 0,
  width: 0,
};

const SIZE_OVERFLOW = 100;

let iframe = null;

// Get the maxWidth that the image could be resized to.
function getMaxResizeWidth(el: any): number {
  // Ideally, the image should bot be wider then its containing element.
  let node: any = el.parentElement;
  while (node && !node.offsetParent) {
    node = node.parentElement;
  }
  if (
    node &&
    node.offsetParent &&
    node.offsetParent.offsetWidth &&
    node.offsetParent.offsetWidth > 0
  ) {
    const {offsetParent} = node;
    const style = el.ownerDocument.defaultView.getComputedStyle(offsetParent);
    let width = offsetParent.clientWidth - IMAGE_MARGIN * 2;
    if (style.boxSizing === 'border-box') {
      const pl = parseInt(style.paddingLeft, 10);
      const pr = parseInt(style.paddingRight, 10);
      width -= pl + pr;
    }
    return Math.max(width, MIN_SIZE);
  }
  // Let the image resize freely.
  return MAX_SIZE;
}

function resolveURL(runtime: ?EditorRuntime, src: ?string): ?string {
  if (!runtime) {
    return src;
  }
  const {canProxyImageSrc, getProxyImageSrc} = runtime;
  if (src && canProxyImageSrc && getProxyImageSrc && canProxyImageSrc(src)) {
    return getProxyImageSrc(src);
  }
  return src;
}

class ImageViewBody extends React.PureComponent<any, any> {
  props: NodeViewProps;

  _body = null;
  _id = uuid();
  _inlineEditor = null;
  _mounted = false;

  state = {
    maxSize: {
      width: MAX_SIZE,
      height: MAX_SIZE,
      complete: false,
    },
    originalSize: DEFAULT_ORIGINAL_SIZE,
  };

  componentDidMount(): void {
    this._mounted = true;
    this._resolveOriginalSize();
    this._renderInlineEditor();
  }

  componentWillUnmount(): void {
    this._mounted = false;
    this._inlineEditor && this._inlineEditor.close();
    this._inlineEditor = null;
  }

  componentDidUpdate(prevProps: NodeViewProps): void {
    const prevSrc = prevProps.node.attrs.src;
    const {node} = this.props;
    const {src} = node.attrs;
    if (prevSrc !== src) {
      // A new image is provided, resolve it.
      this._resolveOriginalSize();
    }
    this._renderInlineEditor();
  }

  render(): React.Element<any> {
    const {originalSize, maxSize} = this.state;
    const {editorView, node, selected, focused} = this.props;
    const {readOnly} = editorView;
    const {attrs} = node;
    const {align, crop, rotate} = attrs;

    // It's only active when the image's fully loaded.
    const loading = originalSize === DEFAULT_ORIGINAL_SIZE;
    const active = !loading && focused && !readOnly && originalSize.complete;
    const src = originalSize.complete ? originalSize.src : EMPTY_SRC;
    const aspectRatio = loading ? 1 : originalSize.width / originalSize.height;
    const error = !loading && !originalSize.complete;

    let {width, height} = attrs;

    if (loading) {
      width = width || IMAGE_PLACEHOLDER_SIZE;
      height = height || IMAGE_PLACEHOLDER_SIZE;
    }

    if (width && !height) {
      height = width / aspectRatio;
    } else if (height && !width) {
      width = height * aspectRatio;
    } else if (!width && !height) {
      width = originalSize.width;
      height = originalSize.height;
    }

    let scale = 1;
    if (width > maxSize.width && (!crop || crop.width > maxSize.width)) {
      // Scale image to fit its containing space.
      // If the image is not cropped.
      width = maxSize.width;
      height = width / aspectRatio;
      scale = maxSize.width / width;
    }

    const className = cx('czi-image-view-body', {
      active,
      error,
      focused,
      loading,
      selected,
    });

    const resizeBox =
      active && !crop && !rotate ? (
        <ImageResizeBox
          height={height}
          onResizeEnd={this._onResizeEnd}
          src={src}
          width={width}
        />
      ) : null;

    const imageStyle: Object = {
      display: 'inline-block',
      height: height + 'px',
      left: '0',
      top: '0',
      width: width + 'px',
      position: 'relative',
    };

    const clipStyle: Object = {};
    if (crop) {
      const cropped = {...crop};
      if (scale !== 1) {
        scale = maxSize.width / cropped.width;
        cropped.width *= scale;
        cropped.height *= scale;
        cropped.left *= scale;
        cropped.top *= scale;
      }
      clipStyle.width = cropped.width + 'px';
      clipStyle.height = cropped.height + 'px';
      imageStyle.left = cropped.left + 'px';
      imageStyle.top = cropped.top + 'px';
    }

    if (rotate) {
      clipStyle.transform = `rotate(${rotate}rad)`;
    }

    const errorView = error ? Icon.get('error') : null;
    const errorTitle = error
      ? `Unable to load image from ${attrs.src || ''}`
      : undefined;

    return (
      <span
        className={className}
        data-active={active ? 'true' : undefined}
        data-original-src={String(attrs.src)}
        id={this._id}
        ref={this._onBodyRef}
        title={errorTitle}
      >
        <span className="czi-image-view-body-img-clip" style={clipStyle}>
          <span style={imageStyle}>
            <img
              alt=""
              className="czi-image-view-body-img"
              data-align={align}
              height={height}
              id={`${this._id}-img`}
              src={src}
              width={width}
            />
            {errorView}
          </span>
        </span>
        {resizeBox}
      </span>
    );
  }

  _renderInlineEditor(): void {
    this.exportAndExitIFrame();
    const el = document.getElementById(this._id);
    if (!el || el.getAttribute('data-active') !== 'true') {
      this._inlineEditor && this._inlineEditor.close();
      return;
    }

    const {node} = this.props;
    const editorProps = {
      value: node.attrs,
      onSelect: this._onChange,
    };
    if (this._inlineEditor) {
      this._inlineEditor.update(editorProps);
    } else {
      this._inlineEditor = createPopUp(ImageInlineEditor, editorProps, {
        anchor: el,
        autoDismiss: false,
        container: el.closest(`.${FRAMESET_BODY_CLASSNAME}`),
        position: atAnchorBottomCenter,
        onClose: () => {
          this._inlineEditor = null;
        },
      });
    }
  }

  _resolveOriginalSize = async (): Promise<void> => {
    if (!this._mounted) {
      // unmounted;
      return;
    }

    this.setState({originalSize: DEFAULT_ORIGINAL_SIZE});
    const src = this.props.node.attrs.src;
    const url = resolveURL(this.props.editorView.runtime, src);
    const originalSize = await resolveImage(url);
    if (!this._mounted) {
      // unmounted;
      return;
    }
    if (this.props.node.attrs.src !== src) {
      // src had changed.
      return;
    }
    // [FS] IRAD-992 2020-06-25
    // Fix:Image exceeds the canvas
    const clientHeight = document.getElementsByClassName(
      'czi-prosemirror-editor'
    )[0].offsetHeight;
    if (originalSize.height > clientHeight) {
      originalSize.height = clientHeight - SIZE_OVERFLOW;
    }
    if (!originalSize.complete) {
      originalSize.width = MIN_SIZE;
      originalSize.height = MIN_SIZE;
    }
    this.setState({originalSize});
  };

  _onResizeEnd = (width: number, height: number): void => {
    const {getPos, node, editorView} = this.props;
    const pos = getPos();
    const attrs = {
      ...node.attrs,
      // TODO: Support UI for cropping later.
      crop: null,
      width,
      height,
    };

    let tr = editorView.state.tr;
    const {selection} = editorView.state;
    tr = tr.setNodeMarkup(pos, null, attrs);
    // [FS] IRAD-1005 2020-07-09
    // Upgrade outdated packages.
    // reset selection to original using the latest doc.
    const origSelection = NodeSelection.create(tr.doc, selection.from);
    tr = tr.setSelection(origSelection);
    editorView.dispatch(tr);
  };

  _onChange = (value: ?{align: ?string}): void => {
    if (!this._mounted) {
      return;
    }
    const align = value ? value.align : null;
    if (
      this.props.node.attrs.diagram === '1' &&
      ('edit_full_screen' === align || 'edit' === align)
    ) {
      this.createIframe();
      this.openDiagramNet(value ? value.align || '' : '');
    } else {
      const {getPos, node, editorView} = this.props;
      const pos = getPos();
      const attrs = {
        ...node.attrs,
        align,
      };

      let tr = editorView.state.tr;
      const {selection} = editorView.state;
      tr = tr.setNodeMarkup(pos, null, attrs);
      // [FS] IRAD-1005 2020-07-09
      // Upgrade outdated packages.
      // reset selection to original using the latest doc.
      const origSelection = NodeSelection.create(tr.doc, selection.from);
      tr = tr.setSelection(origSelection);
      editorView.dispatch(tr);
    }
  };

  _onBodyRef = (ref: any): void => {
    if (ref) {
      this._body = ref;
      // Mounting
      const el = ReactDOM.findDOMNode(ref);
      if (el instanceof HTMLElement) {
        ResizeObserver.observe(el, this._onBodyResize);
      }
    } else {
      // Unmounting.
      const el = this._body && ReactDOM.findDOMNode(this._body);
      if (el instanceof HTMLElement) {
        ResizeObserver.unobserve(el);
      }
      this._body = null;
    }
  };

  _onBodyResize = (info: ResizeObserverEntry): void => {
    const width = this._body
      ? getMaxResizeWidth(ReactDOM.findDOMNode(this._body))
      : MAX_SIZE;

    this.setState({
      maxSize: {
        width,
        height: MAX_SIZE,
        complete: !!this._body,
      },
    });
  };

  createIframe() {
    iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
  }

  exportAndExitIFrame() {
    if (iframe) {
      // Sends a request to export the diagram as XML with embedded PNG
      iframe.contentWindow.postMessage(
        JSON.stringify({
          action: 'export',
          format: 'xmlpng',
          spinKey: 'saving',
        }),
        '*'
      );
    }
  }

  saveImage(data) {
    const src = data;
    const {getPos, node, editorView} = this.props;
    const pos = getPos();
    const attrs = {
      ...node.attrs,
      src,
    };

    let tr = editorView.state.tr;
    tr = tr.setNodeMarkup(pos, null, attrs);
    editorView.dispatch(tr);
  }

  isDefaultData(src) {
    return EMPTY_DIAGRAM_SRC === src ? '' : src;
  }

  destroyIFrame() {
    if (iframe) {
      iframe.remove();
      iframe = null;
    }
    //this.updateDiagramEditState(1);
  }

  updateDiagramEditState(value: Number) {
    const {getPos, node, editorView} = this.props;
    const pos = getPos();
    const newattrs = Object.assign({}, node.attrs);
    newattrs.diagram = value;
    let tr = editorView.state.tr;
    tr = tr.setNodeMarkup(pos, null, newattrs);
    editorView.dispatch(tr);
  }

  openDiagramNet(editMode: string) {
    const url =
      this.props.editorView.runtime.buildRouteForDiagrams() +
      '?embed=1&ui=min&modified=0&proto=json&noSaveBtn=1';

    const source = document.getElementsByClassName(
      'czi-image-resize-box-image'
    )[0]; // Implements protocol for loading and exporting with embedded XML
    const inline = document.getElementsByClassName('czi-inline-editor')[0];
    let parent: ?Element;
    let rect: window.ClientRect;
    let inlineHeight;
    if (
      source &&
      source.parentElement &&
      source.parentElement.parentElement &&
      source.parentElement.parentElement.parentElement
    ) {
      parent = source.parentElement.parentElement.parentElement;
      rect = parent.getBoundingClientRect();
      inlineHeight = inline.getBoundingClientRect().height;
    }

    // Implements protocol for loading and exporting with embedded XML
    const receive = (evt) => {
      if (evt.data.length > 0) {
        const msg = JSON.parse(evt.data);

        // Received if the editor is ready
        if (msg.event == 'init' && iframe && iframe.contentWindow) {
          // Sends the data URI with embedded XML to editor
          //  this.updateDiagramEditState(2);
          iframe.contentWindow.postMessage(
            JSON.stringify({
              action: 'load',
              xmlpng:
                editMode === 'new'
                  ? ''
                  : this.isDefaultData(source.getAttribute('src')),
            }),
            '*'
          );
        }
        // Received if the user clicks save
        else if (msg.event == 'save') {
          this.exportAndExitIFrame();
        }
        // Received if the export request was processed
        else if (msg.event == 'export') {
          // Updates the data URI of the image
          this.saveImage(msg.data);
        }

        // Received if the user clicks exit or after export
        if (msg.event == 'exit' || msg.event == 'export') {
          // Closes the editor

          window.removeEventListener('message', receive);
          this.destroyIFrame();
        }
      }
    };

    window.addEventListener('message', receive);

    if ('edit' === editMode) {
      const offsetLeft = document.getElementsByClassName(
        'ProseMirror czi-prosemirror-editor'
      )[0].offsetLeft;
      const offsetTop = document.getElementsByClassName(
        'czi-image-view ProseMirror-selectednode'
      )[0].offsetTop;
      if (iframe && rect && parent) {
        iframe.setAttribute('src', url);
        iframe.setAttribute(
          'style',
          'z-index: 9999; position: absolute; top: ' +
            (offsetTop - 2) +
            'px; left: ' +
            (rect.left - (offsetLeft + 2)) +
            'px; height: ' +
            (rect.height + inlineHeight + 8) +
            'px; width: ' +
            (rect.width + 4) +
            'px;' +
            'box-shadow: 0 0 2px 2px'
        );

        parent.appendChild(iframe);
      }
      if (this._inlineEditor) {
        this._inlineEditor.close();
      }
    } else {
      if (iframe) {
        iframe.setAttribute('class', 'iframe-diagram');

        if (null != document.body) {
          document.body.appendChild(iframe);
        }
      }
    }
  }
}

class ImageNodeView extends CustomNodeView {
  // @override
  createDOMElement(): HTMLElement {
    const el = document.createElement('span');
    el.className = 'czi-image-view';
    this._updateDOM(el);
    return el;
  }

  // @override
  update(node: Node, decorations: Array<Decoration>): boolean {
    super.update(node, decorations);
    this._updateDOM(this.dom);
    return true;
  }

  // @override
  renderReactComponent(): React.Element<any> {
    return <ImageViewBody {...this.props} />;
  }

  _updateDOM(el: HTMLElement): void {
    const {align} = this.props.node.attrs;
    let className = 'czi-image-view';
    if (align) {
      className += ' align-' + align;
    }
    el.className = className;
  }
}

export default ImageNodeView;
