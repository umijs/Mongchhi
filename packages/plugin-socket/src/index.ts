import type { IApi, SocketAction, SocketMessage } from '@mongchhi/types';
import bodyParser from 'body-parser';
import { join } from 'path';
import url from 'url';
import { DIR_NAME, MESSAGE_TYPE, TEMPLATES_DIR } from './constants';
const clients: any = {};
let g_mongchhi_ws: any;
// TODO: socket 插件是否需要拆分前端和服务端
// TODO: socket client 应该支持连接到 mongchhi，就是说它不仅要连接自己的服务，还要连接统一的 mongchhi 服务
export default (api: IApi) => {
  api.register({
    key: 'onGenerateFiles',
    fn: async () => {
      api.writeTmpFile({
        noPluginDir: true,
        path: `${DIR_NAME}/client.ts`,
        tplPath: join(TEMPLATES_DIR, 'client.ts.tpl'),
        context: {},
      });
      // index.ts for export
      api.writeTmpFile({
        noPluginDir: true,
        path: `${DIR_NAME}/index.tsx`,
        content: `
export { createSocket, socket, callRemote, listenRemote } from './client';
`,
      });
    },
  });
  const onSocketMiddleware = async (g_ws, msg) => {
    if (!g_ws) return;
    function send(action: any) {
      let message = action;
      if (typeof action !== 'string') {
        message = JSON.stringify(action);
      }
      g_ws!.send(message);
    }
    function success(type: string, payload: any) {
      send({ type: `${type}/success`, payload });
    }
    function failure(type: string, payload: any) {
      send({ type: `${type}/failure`, payload });
    }
    function progress(type: string, payload: any) {
      send({ type: `${type}/progress`, payload });
    }
    let action: SocketMessage = {};
    try {
      action = JSON.parse(msg);
    } catch (error) {
      action = {};
    }
    const { type = '', payload = {} } = action;
    const serviceArgs = {
      type,
      payload,
      send,
      success: success.bind(this, type),
      failure: failure.bind(this, type),
      progress: progress.bind(this, type),
    } as SocketAction;
    switch (type) {
      case MESSAGE_TYPE.hash:
      case MESSAGE_TYPE.stillOk:
      case MESSAGE_TYPE.ok:
      case MESSAGE_TYPE.errors:
      case MESSAGE_TYPE.warnings:
        // Do nothing webpack-hmr
        // 过滤 hmr 消息
        break;
      case 'call':
        // 用于和客户端通信，比如从项目的客户端发给 ui 的客户端
        console.log('[MongChhi] call me!', payload?.type ?? '');
        send({
          type: payload?.type ?? 'call',
          payload: payload,
        });
        break;
      default:
        await api.applyPlugins({
          key: 'onMongChhiSocket',
          type: api.ApplyPluginsType.event,
          args: serviceArgs,
        });
        break;
    }
  };
  api.addBeforeMiddlewares(async () => {
    return [
      (req, res, next) => {
        const { path } = req;
        // api
        if (path.startsWith('/__mongchhi/socket')) {
          const jsonOpts = { limit: '5mb', strict: false };
          const urlEncodedOpts = { limit: '5mb', extended: true };
          bodyParser.json(jsonOpts)(req, res, () => {
            bodyParser.urlencoded(urlEncodedOpts)(req, res, () => {
              if (req?.body?.type) {
                onSocketMiddleware(g_mongchhi_ws, JSON.stringify(req.body));
                res.send({
                  message: 'ok',
                  success: true,
                });
              } else {
                res.send({
                  message: 'type is a required field',
                  success: false,
                });
              }
            });
          });
        } else {
          return next();
        }
      },
    ];
  });
  api.addEntryCode(() => {
    return [
      `import { createSocket } from '@@/${DIR_NAME}/client';createSocket()`,
    ];
  });
  api.onDevCompileDone(({ ws: g_ws }) => {
    // mongchhi 主程序时，g_ws 为 g_mongchhi_ws
    // dev 时，g_ws 为 g_umi_ws
    if (!g_ws) return;
    g_mongchhi_ws = g_ws;
    g_ws.wss.on('connection', async (ws, req: any) => {
      const urlParts = url.parse(req.url, true);
      const query = urlParts.query;
      const who = query.who as string;
      if (who && !clients[who]) {
        clients[who] = true;
        // 接收前端的数据
        ws.on('message', async (msg: any) => {
          onSocketMiddleware(g_ws, msg);
        });
      }
    });
  });
};
