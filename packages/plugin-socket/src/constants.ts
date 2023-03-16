import { join } from 'path';

export const TEMPLATES_DIR = join(__dirname, '../templates');

export enum MESSAGE_TYPE {
  ok = 'ok',
  warnings = 'warnings',
  errors = 'errors',
  hash = 'hash',
  stillOk = 'still-ok',
  invalid = 'invalid',
}

export const DIR_NAME = 'plugin-mongchhi-socket';
