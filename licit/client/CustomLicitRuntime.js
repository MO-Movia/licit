// @flow

// This implements the interface of `EditorRuntime`.
// To  run  editor directly:
import type {ImageLike, StyleProps, Citation} from '../../src/Types';
import {POST, GET, DELETE, PATCH} from '../../src/client/http';
import {setStyles, setCitations} from '../../src/customStyle';

// When use it in a componet:

/*
 import type {ImageLike, StyleProps} from '@modusoperandi/licit';
 import {POST, GET, DELETE, PATCH} from '@modusoperandi/licit';
 import {setStyles} from '@modusoperandi/licit';
 */

const STYLES_URI = 'http://localhost:3000';
const CITATION_URI = 'http://localhost:3006';

class CustomLicitRuntime {
  // keep styles locally
  styleProps: StyleProps[] = null;
  citations: Citation[] = null;

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
   * Save or update a style on the service.
   *
   * @param style Style to update.
   */
  async saveStyle(style: StyleProps): Promise<StyleProps[]> {
    const url = this.buildRoute('styles');
    await new Promise((resolve, reject) => {
      POST(url, JSON.stringify(style), 'application/json; charset=utf-8').then(
        (data) => {
          // Refresh from server after save
          this.fetchStyles().then(
            (result) => {
              resolve(result);
            },
            (error) => {
              reject(this.styleProps);
            }
          );
        },
        (err) => {}
      );
      // Refresh from server after save
      this.styleProps = this.fetchStyles();
      resolve(this.styleProps);
    });

    return this.styleProps;
  }

  /**
   * Returns styles to editor
   */
  async getStylesAsync(): Promise<StyleProps[]> {
    if (!this.styleProps) {
      this.fetchStyles();
    }
    return this.styleProps;
  }

  /**
   * Renames an existing style on the service.
   *
   * @param oldStyleName name of style to rename
   * @param newStyleName new name to apply to style
   */
  async renameStyle(oldStyleName, newStyleName) {
    const obj = {
      oldName: oldStyleName,
      newName: newStyleName,
    };
    const url = this.buildRoute('styles/rename');
    await new Promise((resolve, reject) => {
      PATCH(url, JSON.stringify(obj), 'application/json; charset=utf-8').then(
        (data) => {
          // Refresh from server after rename
          this.fetchStyles().then(
            (result) => {
              resolve(result);
            },
            (error) => {
              reject(null);
            }
          );
        },
        (err) => {
          reject(null);
        }
      );
    });

    return this.styleProps;
  }

  /**
   * Remove an existing style from the service
   * @param styleName Name of style to delete
   */
  async removeStyle(styleName: string): Promise<StyleProps[]> {
    const url = this.buildRoute('styles', encodeURIComponent(styleName));
    await new Promise((resolve, reject) => {
      DELETE(url, 'text/plain').then(
        (data) => {
          // Refresh from server after remove
          this.fetchStyles().then(
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
    return this.styleProps;
  }

  fetchStyles(): Promise<StyleProps[]> {
    const url = this.buildRoute('styles');
    return new Promise((resolve, reject) => {
      // No post processing required since same array format is saved.
      //
      // Until it's known how to deal with request errors, they will be
      // rejected and sent to editor as-is.
      GET(url).then(
        (data) => {
          const styles = JSON.parse(data);
          this.styleProps = styles;
          setStyles(styles);
          resolve(styles);
        },
        (err) => {
          reject(null);
        }
      );
    });
  }

  /**
   * Helper method for building URI
   *
   * @param path  path segments to join.
   */
  buildRoute(...path: string) {
    return [STYLES_URI, ...path].join('/');
  }

  buildRouteForCitation(...path: string) {
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
      POST(url, JSON.stringify(citation), 'application/json; charset=utf-8').then(
        (data) => {
          // Refresh from server after save
          this.fetchCitations().then(
            (result) => {
              resolve(result);
            },
            (error) => {
              reject(this.styleProps);
            }
          );
        },
        (err) => {}
      );
    });

    return this.styleProps;
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
    const url = this.buildRouteForCitation('citations', encodeURIComponent(referenceId));
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
