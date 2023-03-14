import { Mustache, winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from 'umi';
import {
  BLOCK_LAYOUT_PREFIX,
  TEMPLATES_DIR,
  UI_ADD_COMPONENT,
  UI_DIR,
  UMI_UI_FLAG_PLACEHOLDER,
} from './constants';

export default (api: IApi) => {
  api.describe({
    key: 'injectUi',
    config: {
      schema: (Joi) => {
        return Joi.boolean();
      },
      default: false,
    },
  });

  api.addExtraBabelPlugins(() => {
    const routesFilename = Object.values(api.appData.routes)
      .map((value: any) => {
        if (value.isLayout) {
          return null;
        }
        return value?.__absFile;
      })
      .filter(Boolean);
    return [
      [
        require.resolve('./babel-plugin-ui'),
        {
          BLOCK_LAYOUT_PREFIX,
          UMI_UI_FLAG_PLACEHOLDER,
          // 提出来是为了自定义
          GUmiUIFlag: UI_ADD_COMPONENT,
          doTransform(filename: string) {
            return routesFilename.includes(filename);
          },
        },
      ],
    ];
  });

  api.addEntryCodeAhead(() => {
    const injectUIFlagTpl = readFileSync(
      join(TEMPLATES_DIR, 'injectUIFlag.ts.tpl'),
      'utf-8',
    );
    return Mustache.render(injectUIFlagTpl, {
      UI_ADD_COMPONENT,
      GUmiUIFlagPath: winPath(require.resolve(join(UI_DIR, 'GUmiUIFlag'))),
    });
  });

  api.addEntryCodeAhead(
    () => `
    (() => {
      try {
        const ua = window.navigator.userAgent;
        const isIE = ua.indexOf(MSIE ') > -1 || ua.indexOf('Trident/') > -1;
        if (isIE) return;

        // Mongchhi UI Buddle
        require('${winPath(join(__dirname, './ui/bubble'))}').default({
          path: '${winPath(api.cwd)}',
        });
      } catch (e) {
        console.warn('Mongchhi UI render error:', e);
      }
    })();
  `,
  );
};
