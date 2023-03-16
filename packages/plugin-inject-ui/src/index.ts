import { IApi } from '@mongchhi/types';
import { Mustache, winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import {
  BLOCK_LAYOUT_PREFIX,
  DIR_NAME,
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
        return Joi.object({
          useDnD: Joi.boolean(),
        });
      },
      default: {
        useDnD: false,
      },
    },
  });

  api.addExtraBabelPlugins(() => {
    const { useDnD = false } = api.userConfig.injectUi;
    const routesFilename = Object.values(api.appData.routes)
      .map((value: any) => {
        if (value.isLayout) {
          return null;
        }
        return value?.__absFile;
      })
      .filter(Boolean);
    // 都看到这里了，给你个神器，保护眼睛 https://astexplorer.net/
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
      useDnD
        ? [
            require.resolve('./babel-plugin-ui/dnd'),
            {
              doTransform(filename: string) {
                return routesFilename.includes(filename);
              },
            },
          ]
        : null,
    ].filter(Boolean);
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
        const isIE = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
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
  const { useDnD = false } = api.userConfig.injectUi;
  if (!useDnD) return;
  api.register({
    key: 'onGenerateFiles',
    fn: async () => {
      const dndkit = winPath(
        dirname(require.resolve('@dnd-kit/core/package.json')),
      );
      // runtime.tsx
      api.writeTmpFile({
        path: `${DIR_NAME}/runtime.tsx`,
        noPluginDir: true,
        content: `
import React from 'react';
import { DndContext } from '${dndkit}';

export function dataflowProvider(container, opts) {
  return React.createElement(DndContext, opts, container);
}
      `,
      });
      // index.ts for export
      api.writeTmpFile({
        path: `${DIR_NAME}/index.tsx`,
        noPluginDir: true,
        tplPath: join(TEMPLATES_DIR, 'DnDable.tsx.tpl'),
        context: { dndkit },
      });
    },
  });
  api.addRuntimePlugin(() => {
    return [`${api.paths.absTmpPath}/${DIR_NAME}/runtime.tsx`];
  });
  api.onMongChhiSocket(async ({ type, payload }) => {
    switch (type) {
      // 获取主题 token
      case '@@mongchhi:onDragEnd':
        console.log(payload);
        break;
      default:
        break;
    }
  });
};
