import { defineConfig } from 'umi';

export default defineConfig({
  presets: [require.resolve('@mongchhi/preset-mongchhi')],
  plugins: [require.resolve('@mongchhi/plugin-inject-ui')],
  routes: [
    { path: '/', component: 'index' },
    { path: '/docs', component: 'docs' },
  ],
  injectUi: true,
  npmClient: 'pnpm',
});
