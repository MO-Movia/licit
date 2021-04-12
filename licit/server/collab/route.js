// @flow

import {parse} from 'url';

// A URL router for the server.
class Router {
  // fix_flow_errors:  declarion to  avoid flow errors
  routes = [];
  // end
  constructor() {
    this.routes = [];
  }

  add(method: any, url: any, handler: any) {
    this.routes.push({method, url, handler});
  }

  matchEx(pattern: any, path: any) {
    const parts = path.slice(1).split('/');
    if (parts.length && !parts[parts.length - 1]) parts.pop();
    if (parts.length != pattern.length) return null;
    const result = [];
    for (let i = 0; i < parts.length; i++) {
      const pat = pattern[i];
      if (pat) {
        if (pat != parts[i]) return null;
      } else {
        result.push(parts[i]);
      }
    }
    return result;
  }

  // : (union<string, RegExp, Array>, string) → union<Array, null>
  // Check whether a route pattern matches a given URL path.
  match(pattern: any, path: any) {
    let result;
    if (typeof pattern == 'string') {
      if (pattern == path) result = [];
    } else if (pattern instanceof RegExp) {
      const match = pattern.exec(path);
      if (match) {
        result = match.slice(1);
      }
    } else {
      result = this.matchEx(pattern, path);
    }
    return result;
  }

  // Resolve a request, letting the matching route write a response.
  resolve(request: any, response: any) {
    const parsed = parse(request.url, true);
    const path = parsed.pathname;
    request.query = parsed.query;

    return this.routes.some((route) => {
      const match =
        route.method == request.method && this.match(route.url, path);
      if (!match) return false;

      const urlParts = match.map(decodeURIComponent);
      route.handler(request, response, ...urlParts);
      return true;
    });
  }
}

export default Router;
