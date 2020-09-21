// @flow

import canUseCSSFont from './canUseCSSFont';
import katex from 'katex';

// [FS] IRAD-1061 2020-09-19
// Now loaded locally, so that it work in closed network as well.
//import injectStyleSheet from './injectStyleSheet';
import 'katex/dist/katex.min.css';

const latexEl: any = document.createElement('div');
const cached: Object = {};

// Use KatexVersion "0.10.1" to fix format issue.
// See https://github.com/sailinglab/pgm-spring-2019/pull/30
const CSS_CDN_URL =
  '//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.10.1/katex.min.css';

const CSS_FONT = 'KaTeX_Main';

(async function() {
  const fontSupported = await canUseCSSFont(CSS_FONT);
  if (!fontSupported) {
    console.info('Add CSS from ', CSS_CDN_URL);
    // [FS] IRAD-1061 2020-09-19
    // Now loaded locally, so that it work in closed network as well.
    //injectStyleSheet(CSS_CDN_URL);
  }
})();

export default function renderLaTeXAsHTML(latex: ?string): string {
  if (cached.hasOwnProperty(latex)) {
    return cached[latex];
  }

  const latexText = latex || '';
  latexEl.innerHTML = '';
  if (!latexText) {
    return latexText;
  }
  try {
    katex.render(latex, latexEl);
  } catch (ex) {
    console.warn(ex.message, latex);
    latexEl.innerHTML = '';
    latexEl.appendChild(document.createTextNode(latexText));
  }
  const html = latexEl.innerHTML;
  latexEl.innerHTML = '';
  cached[latex] = html;
  return html;
}
