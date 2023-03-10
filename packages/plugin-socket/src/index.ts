import type {
  GlobalWebSocketServer,
  IApi,
  SocketAction,
} from '@mongchhi/types';
import { join } from 'path';
import url from 'url';
import { DIR_NAME, MESSAGE_TYPE, TEMPLATES_DIR } from './constants';

const clients: any = {};

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
export { createSocket, socket } from './client';
`,
      });
    },
  });
  api.addEntryCode(() => {
    return [
      `import { createSocket } from '@@/${DIR_NAME}/client';createSocket()`,
    ];
  });
  api.onDevCompileDone(() => {
    const g_ws: GlobalWebSocketServer =
      (global as any)?.g_mongchhi_ws || (global as any)?.g_umi_ws;
    if (g_ws) {
      g_ws.wss.on('connection', async (ws, req: any) => {
        const urlParts = url.parse(req.url, true);
        const query = urlParts.query;
        const who = query.who as string;
        if (who && !clients[who]) {
          clients[who] = true;
          // 接收前端的数据
          ws.on('message', async (msg: any) => {
            let action: SocketAction = {};
            try {
              action = JSON.parse(msg);
            } catch (error) {
              action = {};
            }
            const { type, payload } = action;
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
                g_ws.send(
                  JSON.stringify({
                    type: payload?.type ?? 'call',
                    payload: payload,
                  }),
                );
                break;
              default:
                await api.applyPlugins({
                  key: 'onMongChhiSocket',
                  type: api.ApplyPluginsType.event,
                  args: { send: g_ws.send, type, payload },
                });
                break;
            }
          });
        }
      });
      // 给前端发数据
      // global.g_umi_ws.send(JSON.stringify({ type: 'MongChhi serve', data: 'first' }));

      // 插件中添加
      // import { MongChhiIApi } from '../types';

      // export default (api: IApi) => {
      //   api.onMongChhiSocket(({ type, send, payload }) => {
      //     switch (type) {
      //       case 'call':
      //         break;
      //       default:
      //       // Do nothing
      //     }
      //   });
      // };

      // 前端添加 监听
      // import { socket } from 'umi';
      // useEffect(() => {
      //   // 支持卸载
      //   return socket.listen((type) => {
      //     console.log(type);
      //   });
      // }, []);

      // 前端发送
      // import { socket } from 'umi';
      // socket.send()
    }
  });
};
