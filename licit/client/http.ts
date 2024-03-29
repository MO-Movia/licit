/* eslint-disable */

// A simple wrapper for XHR.

type ErrorType = Error & {
  status;
};

type PromiseType = Promise<unknown> & {
  abort;
};

export function req(conf) {
  let req = new XMLHttpRequest(),
    aborted = false;
  let result = new Promise((success, failure) => {
    req.open(conf.method, conf.url, true);
    req.addEventListener('load', () => {
      if (aborted) return;
      if (req.status < 400) {
        success(req.responseText);
      } else {
        let text = req.responseText;
        if (text && /html/.test(req.getResponseHeader('content-type')))
          text = makePlain(text);
        let err = new Error(
          'Request failed: ' + req.statusText + (text ? '\n\n' + text : '')
        );
        (err as ErrorType).status = req.status;

        failure(err);
      }
    });
    req.addEventListener('error', () => {
      if (!aborted) failure(new Error('Network error'));
    });
    if (conf.headers)
      for (let header in conf.headers)
        req.setRequestHeader(header, conf.headers[header]);
    req.send(conf.body || null);
  });
  (result as PromiseType).abort = () => {
    if (!aborted) {
      req.abort();
      aborted = true;
    }
  };
  return result;
}

function makePlain(html) {
  var elt = document.createElement('div');
  elt.innerHTML = html;
  return elt.textContent.replace(/\n[^]*|\s+$/g, '');
}

export function GET(url) {
  return req({ url, method: 'GET' });
}

export function POST(url, body, type) {
  return req({ url, method: 'POST', body, headers: { 'Content-Type': type } });
}

// [FS] IRAD-1128 2021-02-03
// http DELETE request overrided
export function DELETE(url, type) {
  return req({ url, method: 'DELETE', headers: { 'Content-Type': type } });
}

// [FS] IRAD-1128 2021-02-03
// http PATCH request overrided
export function PATCH(url, body, type) {
  return req({ url, method: 'PATCH', body, headers: { 'Content-Type': type } });
}
