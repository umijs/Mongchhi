interface MongChhiScoket extends WebSocket {
  listen: (callback: Subscription<SocketAction>) => any;
  send: (action: any) => void;
}
let socket: MongChhiScoket;

type Subscription<T> = (val: T) => void;

class EventEmitter<T> {
  private subscriptions = new Set<Subscription<T>>();

  emit = (val: T) => {
    for (const subscription of this.subscriptions) {
      subscription(val);
    }
  };

  useSubscription = (callback: Subscription<T>) => {
    function subscription(val: T) {
      if (callback) {
        callback(val);
      }
    }
    this.subscriptions.add(subscription);
    return () => this.subscriptions.delete(subscription);
  };
}
interface SocketAction {
  type: string;
  payload?: any;
  send?: any;
}

const socketEmitter = new EventEmitter<SocketAction>();

function getSocketHost() {
  const url: any = location;
  const host = url.host;
  const isHttps = url.protocol === 'https:';
  const key = Math.random().toString(36).slice(5);
  return `${isHttps ? 'wss' : 'ws'}://${host}?who=MongChhi${key}`;
}

const messageQueue = new Set();
let isOpen = false;

export function createSocket() {
  // 连接中，直接返回
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }
  const _socket = new WebSocket(getSocketHost(), 'webpack-hmr') as MongChhiScoket;
  function send(action: any) {
    let message = action;
    if (typeof action !== 'string') {
      message = JSON.stringify(action);
    }
    if (isOpen) {
      _socket.send(message);
    } else {
      messageQueue.add(message);
    }
  }
  let pingTimer: NodeJS.Timer;

  _socket.listen = (callback: Subscription<SocketAction>) => {
    return socketEmitter.useSubscription(callback);
  };

  _socket.onopen = () => {
    isOpen = true;
    // 发送队列中的消息
    for (const message of messageQueue) {
      _socket.send(message);
      messageQueue.delete(message);
    }
  };

  _socket.onmessage = async (message) => {
    let { data } = message;
    data = JSON.parse(data);
    switch (data.type) {
      case 'connected':
        console.log(`[MongChhi] connected.`);
        // 心跳包
        pingTimer = setInterval(() => send('ping'), 30000);
        break;
      case 'reload':
        window.location.reload();
        break;
      case 'pong':
        console.log(`[MongChhi] I am live.`);
        break;
      default:
        socketEmitter.emit({
          send,
          ...data,
        });
        break;
    }
  };
  _socket.onclose = async () => {
    isOpen = false;
    if (pingTimer) clearInterval(pingTimer);
    console.info('[MongChhi] Dev server disconnected. Polling for restart...');
    // webpack-hmr 会尝试重连，这里可以忽略
  };

  socket = { ..._socket, send }
  return socket;
}

// 默认一个监听，供页面快速使用
socketEmitter.useSubscription(({ type, payload }) => {
  messageHandlers.forEach((h) => {
    h({ type, payload });
  });
})

const messageHandlers: any[] = [];

function callRemote(action) {
  return new Promise((resolve, reject) => {
    function removeHandler() {
      for (const [i, h] of messageHandlers.entries()) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (h === handler) {
          messageHandlers.splice(i, 1);
          break;
        }
      }
    }
    function handler({ type, payload }) {
      if (type === `${action.type}/success`) {
        if (!action.keep) removeHandler();
        resolve(payload);
      }
      if (type === `${action.type}/failure`) {
        if (!action.keep) removeHandler();
        reject(payload);
      }
      if (type === `${action.type}/progress` && action.onProgress) {
        action.onProgress(payload);
      }
    }

    messageHandlers.push(handler);
    socket.send(
      JSON.stringify({
        ...action,
      }),
    );
  });
}

function listenRemote(action) {
  function handler({ type, payload }) {
    if (type === action.type) {
      action.onMessage(payload);
    }
  }
  messageHandlers.push(handler);
  return () => {
    for (const [i, h] of messageHandlers.entries()) {
      if (h === handler) {
        messageHandlers.splice(i, 1);
        break;
      }
    }
  };
}

export { socket, callRemote, listenRemote };
