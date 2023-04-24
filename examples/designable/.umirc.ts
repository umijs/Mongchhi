import { defineConfig } from 'umi';

export default defineConfig({
  presets: [require.resolve('@mongchhi/preset-mongchhi')],
  routes: [
    { path: '/', component: 'index' },
    { path: '/docs', component: 'docs' },
  ],
  injectUi: {
    useDnD: false,
  },
  npmClient: 'pnpm',
  mfsu: false,
});
