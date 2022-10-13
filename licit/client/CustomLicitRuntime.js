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
        'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIyNFY3bWd1LXp1dDYtS29aMFR2Y2RQUDkyUkxmQkdVejFIZkNRTzJRN1NnIn0.eyJleHAiOjE2NjU1ODA0MTgsImlhdCI6MTY2NTU4MDExOCwiYXV0aF90aW1lIjoxNjY1NTc5NjQzLCJqdGkiOiIxOTUxNzgwYi1hOWI0LTQ0NGItOGY3NS0wOTI0MDJkZGQxZTIiLCJpc3MiOiJodHRwczovL21vdmlhY2xvdWQubW9kdXNvcGVyYW5kaS5jb20vYXV0aC9yZWFsbXMvbW92aWEiLCJhdWQiOlsid29ya2Zsb3ctY2xpZW50IiwiYWNjb3VudCJdLCJzdWIiOiI0M2MwMmI4OC0xOGU3LTRjZWYtODRkOS03ZjFiNjY2ZGQ1OTYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJ1aS1jbGllbnQiLCJub25jZSI6ImFmYzBlYTI4LWE4MTMtNDA5Yy1iYTliLWFmYjFjMjk2YWM4NSIsInNlc3Npb25fc3RhdGUiOiIwOGU1ZGNkZi00N2U1LTQ0MjUtYTg5MS04YzlkM2QzMDA1YmUiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiLCJodHRwOi8vbG9jYWxob3N0Il0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsidWktY2xpZW50Ijp7InJvbGVzIjpbIl9jYW5fcmVhZF9vbnRvbG9neSIsIl9jYW5fbWFuYWdlX2VudGl0eSIsIl9jYW5fbWFuYWdlX2FsZXJ0cyIsIl9jYW5fbWFuYWdlX29udG9sb2d5IiwiX2Nhbl9lZGl0X29udG9sb2d5IiwiX2Nhbl9lZGl0X2RvY3VtZW50IiwiZGV2ZWxvcGVyIiwiYmxhZGVfdXNlciIsIl9jYW5fZWRpdF9lbnRpdHkiXX0sIndvcmtmbG93LWNsaWVudCI6eyJyb2xlcyI6WyJzZWN1cml0eS1yb2xlLXVzZXIiLCJ3b3JrZmxvdy1yb2xlIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiVmlzYWtoIE1zIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidmlzYWtoLm1zIiwiZ2l2ZW5fbmFtZSI6IlZpc2FraCIsImZhbWlseV9uYW1lIjoiTXMifQ.HlFIqL23i7ibi5uUMqskf7ikRUYoNlh92737a900YlzqIfjH3HuqoQ1tH5i-uk-O0I__ntHG2cco9vZ492PpTRGKCLxGzalRi93rQMMpe8rmCf-8nI8pp1El-4_-n-LgPcH-qmzCYCOQNs5nFjybf63GScgjutveejO1SXxmRxMFvWWPHvMReo_NMPD5YG4Pv48q5gQIUzyqTWcyAOTIzieZbrkdd1fRPB8hFawg22ffMSlrlhVup7lAE_zYFwOjNdYOvGb4M5Rf5nwJxZ4KHfldaB2-esJW7hIyHpzXqCPTuQ4udxuYawS7y21jcS3H8MLUlL_UnnPku_uTTeECnA';
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
