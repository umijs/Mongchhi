import { join } from 'path';

export const TEMPLATES_DIR = join(__dirname, '../templates');
export const UI_DIR = join(__dirname, './ui');

export enum MESSAGE_TYPE {
  ok = 'ok',
  warnings = 'warnings',
  errors = 'errors',
  hash = 'hash',
  stillOk = 'still-ok',
  invalid = 'invalid',
}

export const DIR_NAME = 'plugin-mengchhi';

export const BLOCK_LAYOUT_PREFIX = 'l-';
export const UMI_UI_FLAG_PLACEHOLDER = 'UmiUIFlag';
export const UI_ADD_COMPONENT = 'GUmiUIFlag';
