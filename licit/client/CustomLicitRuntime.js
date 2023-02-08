// @flow

// This implements the interface of `EditorRuntime`.
// To  run  editor directly:
import type { ImageLike } from '../../src/Types';
import { POST } from '../../src/client/http';

// When use it in a componet:

/*
 import type {ImageLike} from '@modusoperandi/licit';
 import {POST } from '@modusoperandi/licit';
 */

const GLOSSARY_URI = 'http://greathints.com:3003';

type Glossary = {
  id: string;
  term: string;
  description: string;
};

class CustomLicitRuntime {

  getAcronyms(abbreviation: string): Promise<Glossary[]> {
    return new Promise((resolve, _reject) => {
      resolve([{ id: '1', term: 'SFI', description: 'Students Federation of India' }, { id: '2', term: 'IT', description: 'Information Technology' }
      , { id: '3', term: 'CAS', description: 'Close Air Support' }, { id: '4', term: 'CAS', description: 'Continuous Aerial Surveillance' }]);
    });
  }

  getGlossary(term: string): Promise<Glossary[]> {
    return new Promise((resolve, _reject) => {
      resolve([{ id: '1', term: 'IAS', description: 'Indian Administrative Service' }, { id: '2', term: 'IIT', description: 'Indian Institute of Technology' }
      , { id: '3', term: 'CAS', description: 'Close Air Support' }, { id: '4', term: 'CAS', description: 'Continuous Aerial Surveillance' }]);
    });
  }

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

  // Video Proxy
  canProxyVideoSrc(): boolean {
    return false;
  }

  getProxyVideoSrc(src: string): string {
    // eslint-disable-next-line
    return getProxyImageSrc(src);
  }

  // Video Upload
  canUploadVideo(): boolean {
    return true;
  }

  uploadVideo(blob: Object): Promise<ImageLike> {
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
}
export default CustomLicitRuntime;
