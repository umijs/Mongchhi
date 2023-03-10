# Mongchhi 插件 api

> 为了有更好的类型提示，请结合 `@mongchhi/types` 使用。

## onMongChhiSocket

扩展 Socket 响应的 node 端服务，拥有三个参数 `type, payload, send`，主要行为是根据 `type` 识别是否是自己需要响应的事件。

```ts
export interface SocketAction {
  type?: string;
  payload?: any;
  send?: any;
}
```

比如：

```ts
import { IApi } from '@mongchhi/types';

export default (api: IApi) => {
  api.onMongChhiSocket(async ({ type, send }) => {
    switch (type) {
      case 'app-data':
        // 发送 localUmiAppData
        send(
          JSON.stringify({
            type: 'app-data',
            payload: {},
          }),
        );
        break;
    }
  });
};
```

> 存在一个特殊的服务是 `type:'call'`，它用于前端和前端通信使用，所以在定义 ui 服务的时候，请不要使用这个 type。