// A simple wrapper for XHR.
export function req(conf) {
  const req = new XMLHttpRequest(),
    aborted = false;
  const result = new Promise((success, failure) => {
    req.open(conf.method, conf.url, true);
    req.addEventListener('load', () => {
      if (aborted) return;
      if (req.status < 400) {
        success(req.responseText);
      } else {
        const text = req.responseText;
        const err = new Error(
          'Request failed: ' + req.statusText + (text ? '\n\n' + text : '')
        );
        err.status = req.status;

        failure(err);
      }
    });
    req.addEventListener('error', () => {
      if (!aborted) failure(new Error('Network error'));
    });
    if (conf.headers)
      for (const header in conf.headers)
        req.setRequestHeader(header, conf.headers[header]);
    req.send(conf.body || null);
  });
  result.abort = () => {
    if (!aborted) {
      req.abort();
      aborted = true;
    }
  };
  return result;
}

export function GET(url) {
  return req({ url, method: 'GET' });
}

export function POST(url, body, type) {
  return req({ url, method: 'POST', body, headers: { 'Content-Type': type } });
}

export function PUT(url, body, type) {
  return req({ url, method: 'PUT', body, headers: { 'Content-Type': type } });
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
