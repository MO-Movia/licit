// @flow

// This implements the interface of `EditorRuntime`.
// import type {ImageLike} from '../../src/Types';
// import {POST} from '../../src/client/http';

import type {ImageLike, StyleProps} from '@modusoperandi/licit';
import {POST, GET, DELETE, PATCH} from '@modusoperandi/licit';
// import {setStyle} from '@modusoperandi/licit';

const STYLES_URI = '/style-service';
class CustomLicitRuntime {
  // keep styles locally
  customStyles: StyleProps[] = null;

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
          resolve(img);
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
        (data) => {},
        (err) => {}
      );
    });
    // Refresh from server after save
    // This could probably be done here in memory
    this.styleProps = await this.fetchStyles();
    return this.styleProps;
  }

  /**
   * Returns styles to editor
   */
  async getStylesAsync(): Promise<StyleProps[]> {
    if (!this.styleProps) {
      this.styleProps = this.fetchStyles();
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
    this.customStyles = [];
    const obj = {
      oldName: oldStyleName,
      newName: newStyleName,
    };
    const url = this.buildRoute('styles/rename');
    await new Promise((resolve, reject) => {
      PATCH(url, JSON.stringify(obj), 'application/json; charset=utf-8').then(
        (data) => {},
        (err) => {}
      );
    });
    // Refresh from server after rename?
    // This could probably be done here in memory
    this.styleProps = await this.fetchStyles();
    return this.styleProps;
  }

  /**
   * Remove an existing style from the service
   * @param styleName Name of style to delete
   */
  async removeStyle(styleName: string): Promise<StyleProps[]> {
    const url = this.buildRoute('styles', encodeURIComponent(styleName));
    await new Promise((resolve, reject) => {
      // No post processing required since result is ignored beyond Angular's
      // built in testing.
      //
      // Until it's known how to deal with request errors, they will be
      // rejected and sent to editor as-is.
      DELETE(url, 'text/plain').then(
        (data) => {},
        (err) => {}
      );
    });

    // Editor handling of response seems to be incomplete in 0.0.20
    // Returning styleProps here jut to be consistent with the other
    // methods.
    //
    // Refresh from server after rename?
    // This could probably be done here in memory.
    this.styleProps = await this.fetchStyles();
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
          const style = JSON.parse(data);
          resolve(style);
          this.customStyles = style;
          // setStyle(style);
        },
        (err) => {
          resolve(null);
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
}
export default CustomLicitRuntime;
