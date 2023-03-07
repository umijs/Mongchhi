import { transform } from '@mongchhi/ast';
import { winPath } from '@umijs/utils';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { basename, join } from 'path';
import { expect } from 'vitest';
import { BLOCK_LAYOUT_PREFIX, UMI_UI_FLAG_PLACEHOLDER } from '../constants';

const fixtures = join(winPath(__dirname), 'fixtures');

function testTransform(dir) {
  const filename = existsSync(join(fixtures, dir, 'origin.js'))
    ? join(fixtures, dir, 'origin.js')
    : join(fixtures, dir, 'origin.tsx');
  const origin = readFileSync(filename, 'utf-8');
  const { code } = transform(origin, {
    filename: `/tmp/pages/${basename(filename)}`,
    presets: [
      [
        require.resolve('@umijs/babel-preset-umi'),
        {
          presetEnv: {},
          presetReact: {},
          presetTypeScript: {},
          pluginTransformRuntime: {},
          pluginLockCoreJS: {},
          pluginDynamicImportNode: false,
        },
      ],
    ],
    plugins: [
      [
        // TODO: why cannot find module?
        // require.resolve('./index'),
        require.resolve('../../dist/babel-plugin-ui/index'),
        {
          BLOCK_LAYOUT_PREFIX,
          UMI_UI_FLAG_PLACEHOLDER,
          doTransform() {
            return true;
          },
        },
      ],
    ],
  });
  const expectedFile = existsSync(join(fixtures, dir, 'expected.js'))
    ? join(fixtures, dir, 'expected.js')
    : join(fixtures, dir, 'expected.tsx');
  const expected = readFileSync(expectedFile, 'utf-8');
  const { code: expectCode } = transform(expected, {
    filename: `/tmp/pages/${basename(filename)}`,
    presets: [
      [
        require.resolve('@umijs/babel-preset-umi'),
        {
          presetEnv: {},
          presetReact: {},
          presetTypeScript: {},
          pluginTransformRuntime: {},
          pluginLockCoreJS: {},
          pluginDynamicImportNode: false,
        },
      ],
    ],
  });
  // 处理下 babel 的问题
  const replaceCode = (res: string) =>
    res
      .trim()
      .replace(/[A-Z]:/g, '')
      // 把生成的单引号都换成双引号，因为切换 jest 和 vitest 的时候，这两个表现有差异，懒得改。
      // 如果遇到引号问题引起的错误，再修改。
      .replace(/'/g, '"')
      .replace(/\/\*#__PURE__\*\//gm, '');

  // window 专用，去掉一下盘符，其实表现是正常的，但是为了保证测试通过
  expect(replaceCode(code)).toEqual(replaceCode(expectCode));
}

readdirSync(fixtures).forEach((dir) => {
  if (dir.charAt(0) !== '.') {
    const fn = dir.endsWith('-only') ? test.only : test;
    fn(dir, () => {
      testTransform(dir);
    });
  }
});
