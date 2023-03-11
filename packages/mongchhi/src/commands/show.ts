// TODO: show 命令好怪啊！但是 dev watch 和 preview 都被占用了
import type { IApi } from '@mongchhi/types';
import { createHttpsServer, createProxy } from '@umijs/bundler-utils';
import express from '@umijs/bundler-utils/compiled/express';
import { createWebSocketServer } from '@umijs/bundler-webpack/dist/server/ws';
import { chalk, logger, portfinder, winPath } from '@umijs/utils';
import http from 'http';
import { dirname, join } from 'path';
import sirv from 'sirv';

export default (api: IApi) => {
  api.registerCommand({
    name: 'show',
    description: 'run ui client',
    async fn() {
      const distDir = winPath(
        join(
          dirname(require.resolve('@mongchhi/ui-client/package.json')),
          'dist',
        ),
      );

      const app = express();
      let ws: ReturnType<typeof createWebSocketServer>;

      // cros
      app.use((_req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
          'Access-Control-Allow-Headers',
          'Content-Type, Content-Length, Authorization, Accept, X-Requested-With',
        );
        res.header(
          'Access-Control-Allow-Methods',
          'GET, HEAD, PUT, POST, PATCH, DELETE, OPTIONS',
        );
        next();
      });

      // compression
      app.use(require('@umijs/bundler-webpack/compiled/compression')());

      // proxy
      const { proxy } = api.userConfig;

      if (proxy) {
        createProxy(proxy, app);
      }
      app.use(
        '/',
        sirv(distDir, {
          etag: true,
          dev: true,
          single: true,
        }),
      );

      // history fallback
      app.use(
        require('@umijs/bundler-webpack/compiled/connect-history-api-fallback')(),
      );

      // https 复用用户配置
      const server = api.userConfig.https
        ? await createHttpsServer(app, api.userConfig.https)
        : http.createServer(app);

      if (!server) {
        return null;
      }
      ws = createWebSocketServer(server);
      // 将 socket 连接共享给插件
      (global as any).g_mongchhi_ws = ws;
      // onDevCompileDone 在 umi dev 的时候才会触发，这里手动执行一下
      api.applyPlugins({
        key: 'onDevCompileDone',
        args: {},
      });

      // 找一个可用端口（默认3000）
      const port = await portfinder.getPortPromise({
        port: parseInt(String(api.args.port || 3000), 10),
      });

      const protocol = api.userConfig.https ? 'https:' : 'http:';

      server.listen(port, () => {
        const host =
          api.args.host && api.args.host !== '0.0.0.0'
            ? api.args.host
            : 'localhost';

        logger.ready(
          `Mongchhi listening at ${chalk.green(
            `${protocol}//${host}:${port}`,
          )}`,
        );
      });
    },
  });
};
