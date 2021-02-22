// @flow

// This implements the interface of `EditorRuntime`.
import type {ImageLike, StyleProps} from '../Types';
import {POST, GET, DELETE, PATCH} from './http';
import {setStyles} from '../customStyle';
class LicitRuntime {
  // keep styles locally
  customStyles = new Array<StyleProps>();
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
    // [FS-AFQ][03-MAR-2020][IRAD-884#2]
    // Note: Resolving the promise blindly after 3 seconds causes two issues,
    // 1. Even if an image upload finishes in 700ms, it will take 3s for resolving the promise.
    // 2. If the image upload takes more than 3s, then the promise will be incorrectly resolved before completing the upload.
    // The following structure may be good to solve the issue.
    return new Promise((resolve, reject) => {
      // Use uploaded image URL.
      const url = '/saveimage?fn=' + blob.name;
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

  // [FS] IRAD-1128 2021-02-02
  // To save a new style or modify/replace an existing style.
  saveStyle(style: StyleProps) {
    this.customStyles = [];
    let styles;
    const url = this.buildRoute('styles');
    POST(url, JSON.stringify(style), 'application/json; charset=utf-8').then(
      (data) => {
        styles = JSON.parse(data);
        this.customStyles = styles;
        setStyles(styles);
      },
      (err) => {}
    );
  }

  // [FS] IRAD-1128 2021-02-02
  // Retrieve all styles from the service
  getStyles() {
    let style;
    if (this.customStyles.length > 0) {
      return new Promise((resolve, reject) => {
        resolve(this.customStyles);
      });
    }
    return new Promise((resolve, reject) => {
      const url = this.buildRoute('styles');
      GET(url).then(
        (data) => {
          style = JSON.parse(data);
          resolve(style);
          this.customStyles = style;
          setStyles(style);
        },
        (err) => {
          style = null;
          resolve(style);
        }
      );
    });
  }

  // [FS] IRAD-1128 2021-02-03
  // Get all styles
  async getStylesAsync() {
    return await this.getStyles();
  }

  //[FS] IRAD-1128 2021-02-03
  //To rename an existing style on the service
  renameStyle(oldStyleName, newStyleName) {
    this.customStyles = [];
    let styles = null;
    const obj = {
      oldName: oldStyleName,
      newName: newStyleName,
    };
    return new Promise((resolve, reject) => {
      const url = this.buildRoute('styles/rename');
      PATCH(url, JSON.stringify(obj), 'application/json; charset=utf-8').then(
        (data) => {
          //need list of styles here
          console.log(data);
        },
        (err) => {
          styles = null;
          resolve(styles);
        }
      );
    });
  }

  // [FS] IRAD-1128 2021-02-03
  // To remove a single style from the service.
  removeStyle(name: string) {
    this.customStyles = [];
    const url = this.buildRoute(`styles/${name}`);

    DELETE(url, 'text/plain').then(
      (data) => {
        this.customStyles = data;
        setStyles(data);
      },
      (err) => {}
    );
  }

  // [FS] IRAD-1128 2021-02-03
  // get the service url
  // to change server edit here
  buildRoute(...path) {
    // const root = 'http://localhost:3000';
    const root = '/style-service';
    return [root, ...path].join('/');
  }
}

export default LicitRuntime;
