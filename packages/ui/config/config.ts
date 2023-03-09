import { defineConfig } from 'umi';

export default defineConfig({
  plugins: [
    '@umijs/plugins/dist/antd',
    'umi-plugin-route-mdx',
    '@mongchhi/plugin-socket',
  ],
  antd: {},
});
