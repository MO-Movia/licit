/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import Keymap from 'browserkeymap';

import browser from './browser';

import { makeKeyMapWithCommon } from '@modusoperandi/licit-doc-attrs-step';

// https://tinyurl.com/ybwf3wex

export function tooltip(keymap?: Keymap): string | null {
  if (keymap) {
    let shortcut;
    if (browser.isMac()) {
      shortcut = keymap.mac
        .replace(/Cmd/i, '⌘')
        .replace(/Shift/i, '⇧')
        .replace(/Ctrl/i, '^')
        .replace(/Alt/i, '⌥');
    } else {
      shortcut = keymap.windows;
    }
    return `${keymap.description} (${shortcut})`;
  }
  return null;
}

export function findShortcutByKeymap(keymap: Keymap): string | null {
  if (browser.isMac()) {
    return keymap.mac as string | null;;
  }

  return keymap.windows as string | null;;
}
export const KEY_SPLIT_LIST_ITEM = makeKeyMapWithCommon(
  'Split list item',
  'Enter'
);

export const ALL_KEYS = [KEY_SPLIT_LIST_ITEM];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findKeymapByDescription(description: string): any {
  const matches = ALL_KEYS.filter((keymap) => {
    return keymap.description.toUpperCase() === description.toUpperCase();
  });
  return matches[0];
}

export function findShortcutByDescription(description: string): string | null {
  const keymap = findKeymapByDescription(description);
  if (keymap) {
    return findShortcutByKeymap(keymap);
  }
  return null;
}
