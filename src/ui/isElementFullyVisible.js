// @flow

import { fromHTMlElement } from '@modusoperandi/licit-ui-commands';

export default function isElementFullyVisible(el: HTMLElement): boolean {
  const { x, y, w, h } = fromHTMlElement(el);
  // to handle the rounded border scenario.
  const factor = '10px' === el.style.borderRadius ? 3 : 1;
  // Only checks the top-left point.
  const nwEl =
    w && h ? el.ownerDocument.elementFromPoint(x + factor, y + factor) : null;

  return !nwEl ? false : nwEl === el || el.contains(nwEl);
}
