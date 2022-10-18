// @flow

// This implements the interface of `EditorRuntime`.
// To  run  editor directly:
import type { ImageLike } from '../../src/Types';
import { POST, req } from '../../src/client/http';

// When use it in a componet:

/*
 import type {ImageLike} from '@modusoperandi/licit';
 import {POST } from '@modusoperandi/licit';
 */

class CustomLicitRuntime {
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
    // This simulate a fake proxy.
    const suffix = 'proxied=1';
    return src.indexOf('?') === -1 ? `${src}?${suffix}` : `${src}&${suffix}`;
  }

  getVideoSrc(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const token =
        'Bearer <access_token>';
      const endPoint = 'https://moviacloud.modusoperandi.com/movia/content';

      (async () => {
        // Video that will be fetched and appended
        const remoteVidUrl = endPoint + '/id/' + id;

        // Fetch remote URL, getting contents as binary blob
        const vidBlob = await (
          await fetch(remoteVidUrl, { headers: { Authorization: token } })
        ).blob();

        const videoEle = document.createElement('video');
        videoEle.src = URL.createObjectURL(vidBlob);
        videoEle.addEventListener('loadedmetadata', function () {
          resolve(videoEle.src);
        });
      })();
    });
  }

  // Video Upload
  canUploadVideo(): boolean {
    return true;
  }

  uploadVideo(blob: Object, id: string): Promise<ImageLike> {
    let img: ImageLike;
    return new Promise((resolve, reject) => {
      // Use uploaded image URL.
      const formData = new FormData();
      formData.append('label', blob.name);
      formData.append('file', blob);
      const token =
        'Bearer <access_token>';
      const endPoint = 'https://moviacloud.modusoperandi.com/movia/content';
      req({
        url: endPoint,
        method: 'POST',
        body: formData,
        headers: {
          Authorization: token,
        },
      }).then((data) => {
        const resp = JSON.parse(data);
        const id = resp.entity.id.substring(
          resp.entity.id.lastIndexOf('/') + 1
        );

        (async () => {
          // Video that will be fetched and appended
          const remoteVidUrl = endPoint + '/id/' + id;

          // Fetch remote URL, getting contents as binary blob
          const vidBlob = await (
            await fetch(remoteVidUrl, { headers: { Authorization: token } })
          ).blob();

          const videoEle = document.createElement('video');
          videoEle.src = URL.createObjectURL(vidBlob);
          videoEle.addEventListener('loadedmetadata', function () {
            img = {
              id: id,
              width: this.videoWidth,
              height: this.videoHeight,
              src: videoEle.src,
            };
            resolve(img);
          });
        })();
      });
    });
  }
}
export default CustomLicitRuntime;
