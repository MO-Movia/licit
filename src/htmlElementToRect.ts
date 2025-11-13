/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

export type Rect = {
  h: number;
  w: number;
  x: number;
  y: number;
};

export default function htmlElementToRect(el: HTMLElement): Rect {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    w: rect.width,
    h: rect.height,
  };
}
