// [FS] IRAD-1005 2020-07-07
// Upgrade outdated packages.
import {v1 as uuidv1} from 'uuid';
import '../styles/czi-custom-button.css';

export default function uuid(): string {
  return uuidv1();
}
