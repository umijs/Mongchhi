import { defineConfig } from 'umi';
const ENTRY_PATH = '/__block_ui/entry';

export default defineConfig({
  publicPath: `${ENTRY_PATH}/`,
  base: ENTRY_PATH,
  plugins: [
    require.resolve('@umijs/plugins/dist/locale'),
    require.resolve('@mongchhi/plugin-socket'),
    'umi-plugin-route-mdx',
  ],
  icons: {
    autoInstall: {},
  },
  mfsu: false,
  locale: {
    // 默认使用 src/locales/zh-CN.ts 作为多语言文件
    default: 'zh-CN',
    baseSeparator: '-',
    antd: false,
  },
});
