/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import {v1 as uuidv1} from 'uuid';

export default function uuid(): string {
  return uuidv1() as string;
}
