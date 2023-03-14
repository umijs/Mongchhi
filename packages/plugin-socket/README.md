# mongchhi socket

## 插件中添加

```tsx
import { MongChhiIApi } from '@mongchhi/types';

export default (api: IApi) => {
    api.onMongChhiSocket(({ type, send, payload }) => {
        switch (type) {
            case 'call':
              // 给前端发数据
              send({ type: 'MongChhi serve', data: 'first' });
              break;
            default:
            // Do nothing
        }
    });
};
```
##  前端添加监听

```ts
import { socket } from 'umi';
useEffect(() => {
    return socket.listen((type) => {
        console.log(type);
    });
}, []);
```

## 前端发送消息

```ts
import { socket } from 'umi';
socket.send({type:'call'})
```