import { defineConfig } from 'alita';

export default defineConfig({
  presets: [require.resolve('@mongchhi/preset-mongchhi')],
  appType: 'h5',
  keepalive: [/users/],
  aconsole: {
    console: {},
    inspx: {},
  },
  mobileLayout: 'mobile5',
  mfsu: false,
  hash: false,
});
