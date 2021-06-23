// @flow

// This implements the interface of `EditorRuntime`.
// To  run  editor directly:
import type { ImageLike, StyleProps, Citation } from '../../src/Types';
import { POST, GET, DELETE, PATCH } from '../../src/client/http';
import { setStyles, setCitations } from '../../src/customStyle';

// When use it in a componet:

/*
 import type {ImageLike, StyleProps, Citation} from '@modusoperandi/licit';
 import {POST, GET, DELETE, PATCH} from '@modusoperandi/licit';
 import {setStyles, setCitations} from '@modusoperandi/licit';
 */

const STYLES_URI = 'http://greathints.com:3000';
const CITATION_URI = 'http://greathints.com:3003';
const TYPE_JSON = 'application/json; charset=utf-8';

class CustomLicitRuntime {
  /**
   * Cached styles fetched from the service to avoid saturating
   * service with HTTP requests.
   * @private
   */
  stylePromise: Promise<StyleProps[]> = null;

  citations: Citation[] = [];
  // Image Proxy
  canProxyImageSrc(): boolean {
    return false;
  }

  getProxyImageSrc(src: string): string {
    // This simulate a fake proxy.
    const suffix = 'proxied=1';
    return src.indexOf('?') === -1 ? `${src}?${suffix}` : `${src}&${suffix}`;
  }

  // Image Upload
  canUploadImage(): boolean {
    return true;
  }

  uploadImage(blob: Object): Promise<ImageLike> {
    let img: ImageLike;
    // Note: While looking at the uploadImage() function, it is found that a promise is resolved blindly after 3 seconds. Is it a
    // requirement? If not, then I think it causes two issues, 1. Even if an image upload finishes in 700ms, it will take 3s for
    // resolving the promise. 2. If the image upload takes more than 3s, then the promise will be incorrectly resolved before
    // completing the upload.
    // The following structure may be good to solve the issue.
    return new Promise((resolve, reject) => {
      // Use uploaded image URL.
      const url =
        window.location.protocol +
        '//' +
        window.location.hostname +
        ':3004/saveimage?fn=' +
        blob.name;
      POST(url, blob, 'application/octet-stream').then(
        (data) => {
          img = JSON.parse(data);
          resolve(img);
        },
        (err) => {
          img = {
            id: '',
            width: 0,
            height: 0,
            src: '',
          };
          reject(img);
        }
      );
    });
  }

  /**
   * Save or update a style.
   *
   * @param style Style to update.
   * @return Updated array of styles.
   */
  async saveStyle(style: StyleProps): Promise<StyleProps[]> {
    try {
      const json = JSON.stringify(style);
      const url = this.buildRoute('styles');
      // Issue HTTP request and save style to service.
      await POST(url, json, TYPE_JSON);
    } catch (error) {
      // Log error to console, but otherwise ignore it. In the place in the
      // editor where this method is called, there is no accommodation for
      // handling errors.
      console.error('Failed to save style', style, error);
    }

    // Refresh styles from service. This becomes the new cache.
    this.stylePromise = this.fetchStyles();
    return this.stylePromise;
  }

  /**
   * Fetch list of styles.
   *
   * @returns Array of styles or empty array
   */
  getStylesAsync(): Promise<StyleProps[]> {
    if (!this.stylePromise) {
      this.stylePromise = this.fetchStyles();
    }
    return this.stylePromise;
  }

  /**
   * Renames an existing style on the service.
   *
   * @param oldName name of style to rename
   * @param newName new name to apply to style
   */
  async renameStyle(oldName: string, newName: string): Promise<StyleProps[]> {
    try {
      const json = JSON.stringify({ oldName, newName });
      const url = this.buildRoute('styles/rename');
      await PATCH(url, json, TYPE_JSON);
    } catch (error) {
      // Log error to console, but otherwise ignore it. In the place in the
      // editor where this method is called, there is no accommodation for
      // handling errors.
      console.error('Failed to rename style', oldName, newName, error);
    }

    // Refresh styles from service. This becomes the new cache.
    this.stylePromise = this.fetchStyles();
    return this.stylePromise;
  }

  /**
   * Remove an existing style from the service.
   * @param styleName Name of style to delete
   */
  async removeStyle(styleName: string): Promise<StyleProps[]> {
    try {
      const url = this.buildRoute('styles', encodeURIComponent(styleName));
      // Issue the HTTP request to delete the named style.
      await DELETE(url, 'text/plain');
    } catch (error) {
      // Log error to console, but otherwise ignore it. In the place in the
      // editor where this method is called, there is no accommodation for
      // handling errors.
      console.error('Failed to delete style', styleName, error);
    }

    // Refresh styles from service. This becomes the new cache.
    this.stylePromise = this.fetchStyles();
    return this.stylePromise;
  }

  /**
   * Issue HTTP request to fetch styles from service.  Used internally by
   * runtime, but should not be used externally.
   *
   * @returns StyleProps array or empty array on error.
   * @private
   */
  async fetchStyles(): Promise<StyleProps[]> {
    let styles: StyleProps[];
    try {
      styles = JSON.parse(await GET(this.buildRoute('styles')));
    } catch (error) {
      // HTTP request or parsing of response failed.
      // In either case, log an error and treat as if an empty array was
      // returned.
      styles = [];
      console.error('Failed to fetch styles from service', error);
    }

    // TODO: remove this side effect!
    // Runtime should not be making calls into editor code!
    setStyles(styles);

    // Return the styles.
    return styles;
  }

  /**
   * Helper method for building URI
   *
   * @param path  path segments to join.
   */
  buildRoute(...path: string[]) {
    return [STYLES_URI, ...path].join('/');
  }

  buildRouteForCitation(...path: string[]) {
    return [CITATION_URI, ...path].join('/');
  }

  /**
   * Save or update a citation on the service.
   *
   * @param citation Citation to update.
   */
  async saveCitation(citation: Citation): Promise<Citation[]> {
    const url = this.buildRouteForCitation('citations');
    await new Promise((resolve, reject) => {
      POST(url, JSON.stringify(citation), TYPE_JSON).then(
        (data) => {
          // Refresh from server after save
          this.fetchCitations().then(
            (result) => {
              resolve(result);
            },
            (error) => {
              reject(this.citations);
            }
          );
        },
        (err) => {}
      );
    });

    return this.citations;
  }

  // to get all saved citations
  fetchCitations(): Promise<Citation[]> {
    const url = this.buildRouteForCitation('citations');
    return new Promise((resolve, reject) => {
      GET(url).then(
        (data) => {
          const citations = JSON.parse(data);
          this.citations = citations;
          setCitations(citations);
          resolve(citations);
        },
        (err) => {
          reject(null);
        }
      );
    });
  }

  /**
   * Returns all the citations to editor
   */
  async getCitationsAsync(): Promise<Citation[]> {
    if (!this.citations) {
      this.fetchCitations();
    }
    return this.citations;
  }

  /**
   * Delete an existing citation from the service
   * @param referenceId of the citation to delete
   */
  async removeCitation(referenceId: string): Promise<Citation[]> {
    const url = this.buildRouteForCitation(
      'citations',
      encodeURIComponent(referenceId)
    );
    await new Promise((resolve, reject) => {
      DELETE(url, 'text/plain').then(
        (data) => {
          // Refresh from server after remove
          this.fetchCitations().then(
            (result) => {
              resolve(result);
            },
            (error) => {
              reject(null);
            }
          );
        },
        (err) => {}
      );
    });

    return this.citations;
  }
}
export default CustomLicitRuntime;
