// @flow

// This implements the interface of `StyleRuntime`.
// To  run  editor directly:
import type { Style } from '@modusoperandi/licit-customstyles';
import { POST, GET, DELETE, PATCH } from '../../src/client/http';

// When use it in a componet:
/*
 import type {Style} from '@modusoperandi/licit-customstyles';
 import {POST, GET, DELETE, PATCH } from '@modusoperandi/licit';
 */
const STYLES_URI = 'http://greathints.com:3000';
const TYPE_JSON = 'application/json; charset=utf-8';

class CustomStyleRuntime {
  /**
   * Cached styles fetched from the service to avoid saturating
   * service with HTTP requests.
   * @private
   */
  stylePromise: Promise<Style[]>;

  /**
   * Save or update a style.
   *
   * @param style Style to update.
   * @return Updated array of styles.
   */
  async saveStyle(style: Style): Promise<Style[]> {
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
  getStylesAsync(): Promise<Style[]> {
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
  async renameStyle(oldName: string, newName: string): Promise<Style[]> {
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
  async removeStyle(styleName: string): Promise<Style[]> {
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
   * @returns Style array or empty array on error.
   * @private
   */
  async fetchStyles(): Promise<Style[]> {
    let styles: Style[];
    try {
      styles = JSON.parse(await GET(this.buildRoute('styles')));
    } catch (error) {
      // HTTP request or parsing of response failed.
      // In either case, log an error and treat as if an empty array was
      // returned.
      styles = [];
      console.error('Failed to fetch styles from service', error);
    }

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
}
export default CustomStyleRuntime;
