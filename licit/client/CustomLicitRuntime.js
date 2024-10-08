// @flow

// This implements the interface of `EditorRuntime`.
// To  run  editor directly:
import type { ImageLike, RecentColor } from '../../src/Types.js';
import { POST } from '../../src/client/http.js';

// When use it in a componet:

/*
 import type {ImageLike} from '@modusoperandi/licit';
 import {POST } from '@modusoperandi/licit';
 */

// const GLOSSARY_URI = 'http://greathints.com:3003';

type Glossary = {
  id: string,
  term: string,
  description: string,
};

class CustomLicitRuntime {
  getAcronyms(abbreviation: string): Promise<Glossary[]> {
    return new Promise((resolve, _reject) => {
      resolve([
        {
          id: '1',
          term: 'ASAP',
          description:
            'ASAP is an acronym for as soon as possible. This common phrase means you will do something when you have the chance.',
        },
        {
          id: '2',
          term: 'IMAX',
          description:
            'The IMAX in IMAX Theater actually stands for Image Maximum. This is a large-format movie theater.',
        },
        {
          id: '3',
          term: 'PIN',
          description:
            'When in all-caps, the word PIN stands for �personal identification number.� This is a secret number you create to access private documents, files and account information.',
        },
        {
          id: '4',
          term: 'RADAR',
          description:
            'RADAR stands for �radio detection and ranging.� This technology is rarely called anything other than its acronym.',
        },
        {
          id: '5',
          term: 'TASER',
          description:
            'The electrical weapon actually is an acronym for �Thomas A. Swift�s Electric Rifle.�',
        },
        {
          id: '6',
          term: 'SCUBA',
          description:
            'This piece of diving equipment is an acronym for �self-contained underwater breathing apparatus.�',
        },
        {
          id: '7',
          term: 'NASA',
          description:
            'NASA stands for �National Aeronautics and Space Administration,� and this organization once took a man to the moon.',
        },
        {
          id: '8',
          term: 'NAFTA',
          description:
            'NAFTA is the acronym or the �North American Free Trade Agreement.� This organization governs trade among North American countries.',
        },
        {
          id: '9',
          term: 'HIPAA',
          description:
            'The �Health Insurance Portability Accountability Act� is responsible for keeping medical information private.',
        },
        {
          id: '10',
          term: 'DARE',
          description:
            'Most people no longer remember that DARE stands for �Drug Abuse Resistance Education�',
        },
        { id: 11, term: 'AEF', description: 'air expeditionary force' },
        { id: 12, term: 'AFDP', description: 'Air Force Doctrine Publication' },
        {
          id: 13,
          term: 'AvFID',
          description: 'aviation foreign internal defense',
        },
        { id: 14, term: 'BSZ', description: 'base security zone' },
        { id: 15, term: 'CS', description: 'combat support' },
        {
          id: 16,
          term: 'COMAFFOR',
          description: 'commander, Air Force forces',
        },
        {
          id: 17,
          term: 'COMAFSOF',
          description: 'commander, Air Force special operations forces',
        },
        { id: 18, term: 'CoL', description: 'continuum of learning' },
        {
          id: 19,
          term: 'CTO',
          description: 'counterthreat operations; cyber tasking order',
        },
        { id: 20, term: 'DFC', description: 'defense force commander' },
        { id: 21, term: 'DCS', description: 'defensive counterspace' },
        {
          id: 22,
          term: 'DIRSPACEFOR',
          description: 'director of space forces',
        },
        {
          id: 23,
          term: 'EBAO',
          description: 'effects-based approach to operations',
        },
        {
          id: 24,
          term: 'EWIR',
          description: 'electronic warfare integrated reprogramming',
        },
        { id: 25, term: 'FPI', description: 'force protection intelligence' },
        {
          id: 26,
          term: 'GAMSS',
          description: 'Global Air Mobility Support System',
        },
        { id: 27, term: 'JPPA', description: 'joint planning process for air' },
        { id: 28, term: 'OA', description: 'operational-level assessment' },
        { id: 29, term: 'OCS', description: 'offensive counterspace' },
        { id: 30, term: 'OWS', description: 'operational weather squadron' },
      ]);
    });
  }

  getGlossary(term: string): Promise<Glossary[]> {
    return new Promise((resolve, _reject) => {
      resolve([
        { id: '1', term: 'IAS', description: 'Indian Administrative Service' },
        { id: '2', term: 'IIT', description: 'Indian Institute of Technology' },
        { id: '3', term: 'CAS', description: 'Close Air Support' },
        { id: '4', term: 'CAS', description: 'Continuous Aerial Surveillance' },
        {
          id: '5',
          term: 'Analysis of Variance (ANOVA)',
          description:
            'A statistical tool used to analyze the differences among means.',
        },
        {
          id: '6',
          term: 'Confidence Interval (CI)',
          description:
            'The mean of an estimate 4/- the variation in the estimate.',
        },
        {
          id: '7',
          term: 'Comma Separated Value (CSV)',
          description:
            'A text file that uses a comma (,) to separate each value inputted.',
        },
        {
          id: '8',
          term: 'Mean Squared Error (MSE)',
          description:
            'A measurement of how close a fitted line is to plotted data points.',
        },
        {
          id: '9',
          term: 'Odds Ratio (OR)',
          description:
            'A quantification of the strength of association between two events.',
        },
        {
          id: '10',
          term: 'Process Behavior Analysis (PBA)',
          description: 'Written analysis of a Process Behavior Chart (PBC.)',
        },
        {
          id: '11',
          term: 'Quality Assurance (QA)',
          description:
            'Systematic monitoring and evaluation to ensure standards are met.',
        },
        {
          id: '12',
          term: 'Root Mean Square (RMC)',
          description:
            'The square root of the mean square, or the quadratic mean.',
        },
      ]);
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

  getRecentColors(): Promise<RecentColor[]> {
    const apiUrl =
      window.location.protocol +
      '//' +
      window.location.hostname +
      ':3004/getrecentcolors';
    // const apiUrl = 'http://88.99.193.94:3004/getrecentcolors'
    const requestOptions = {
      method: 'GET'
    };

    return new Promise((resolve, reject) => {
      fetch(apiUrl, requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          resolve(data); // Resolve with the response data
        })
        .catch(error => {
          resolve([]);
          // reject(error); // Reject with the error
        });
    });
  }

  saveRecentColor(colorValue: any): Promise<RecentColor> {

    const apiUrl =
      window.location.protocol +
      '//' +
      window.location.hostname +
      ':3004/saverecentcolor';
    // const apiUrl = 'http://88.99.193.94:3004/saverecentcolor'
    // Fetch options
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(colorValue)
    };

    // Return a Promise for the API call
    return new Promise((resolve, reject) => {
      fetch(apiUrl, requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log(data.message); // JSON data saved successfully
          // Handle the response data as needed
          resolve(data);
        })
        .catch(error => {
          console.error('Error:', error);
          // Handle errors
          // reject(error);
          resolve(undefined);
        });
    });
  }

  deleteRecentColorById(id: string): Promise<void> {

    const apiUrl =
      window.location.protocol +
      '//' +
      window.location.hostname +
      ':3004/deleterecentcolor/';
    // const apiUrl = 'http://88.99.193.94:3004/deleterecentcolor'
    return new Promise((resolve, reject) => {
      try {
        const response = fetch(`${apiUrl}${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const responseData = response.json();
          resolve(responseData.message);
        } else {
          resolve(undefined);
        }
      } catch (error) {
        resolve(undefined);
      }
    });
  }



}
export default CustomLicitRuntime;