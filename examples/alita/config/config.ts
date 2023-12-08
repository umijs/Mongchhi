import { defineConfig } from 'alita';

export default defineConfig({
  presets: [require.resolve('@umijs/preset-blocks')],
  appType: 'h5',
  keepalive: [/users/],
  aconsole: {
    console: {},
    inspx: {},
  },
  mobileLayout: 'mobile5',
  block: {
    defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
    npmClient: 'pnpm',
    closeFastGithub: true,
    homedir: false,
    useUI: true,
  },
  mfsu: false,
  hash: false,
});
