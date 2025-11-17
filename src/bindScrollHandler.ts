/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

type ScrollHandle = {
  dispose: () => void;
};

export default function bindScrollHandler(
  target: Element,
  callback: () => void
): ScrollHandle {
  const defaultView = target.ownerDocument.defaultView;
  const els = [];

  let rid = 0;

  let onScroll = () => {
    // Debounce the scroll handler.
    if (rid) cancelAnimationFrame(rid);
    rid = requestAnimationFrame(callback);
  };

  let el = target;

  // Scroll event does not bubble, so we need to look up all the scrollable
  // elements.
  while (el) {
    const overflow = defaultView.getComputedStyle(el).overflow;
    if ((onScroll && overflow === 'auto') || overflow === 'scroll') {
      el.addEventListener('scroll', onScroll, false);
      els.push(el);
    }
    el = el.parentElement;
  }

  return {
    dispose() {
      while (onScroll && els.length) {
        el = els.pop();
        el?.removeEventListener('scroll', onScroll, false);
      }
      onScroll = null;
      if (rid) window.cancelAnimationFrame(rid);
      rid = 0;
    },
  };
}
