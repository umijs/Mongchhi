import WebSocket from '@umijs/bundler-webpack/compiled/ws';
import type { IApi as IUmiApi } from '@umijs/preset-umi';

// from @umijs/core
export interface IEvent<T> {
  (fn: { (args: T): void }): void;
  (args: {
    fn: {
      (args: T): void;
    };
    name?: string;
    before?: string | string[];
    stage?: number;
  }): void;
}

export interface SocketAction {
  type?: string;
  payload?: any;
  send?: any;
}

export type IApi = IUmiApi & {
  onMongChhiSocket: IEvent<SocketAction>;
};

export interface GlobalWebSocketServer {
  send(message: string): void;
  wss: WebSocket.Server<WebSocket.WebSocket>;
  close(): void;
}
