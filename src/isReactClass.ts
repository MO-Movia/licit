/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

export default function isReactClass(maybe: unknown): boolean {
  if (typeof maybe !== 'function') {
    return false;
  }
  const proto = maybe.prototype;
  if (!proto) {
    return false;
  }
  return !!proto.isReactComponent;
}
