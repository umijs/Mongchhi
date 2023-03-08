import { IApi } from '@mongchhi/types';
import { logger } from '@umijs/utils';
import { localUmiAppData } from './temp';

const getAppDataUrl = (port: number | string) => {
  return `http://localhost:${port}/__umi/api/app-data`;
};

const getUmiAppByPort = async (port: number | string) => {
  // 控制器对象 用于终止fetch
  let controller = new AbortController();
  let signal = controller.signal;

  // 计时器
  let timeoutPromise = (timeout = 3000) => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject('time is up');
        controller.abort();
      }, timeout);
    });
  };
  let json: any = null;
  try {
    const { default: fetch } = await import('node-fetch');
    const url = getAppDataUrl(port);
    // 给fetch设置超时时间(请求56652端口会严重超时)
    json = await Promise.race([
      timeoutPromise(1000),
      fetch(url, { signal: signal }).then((rest) => rest.json()),
    ]);
  } catch (e) {}
  return json;
};

/**
 * 检测端口是否被占用
 * @param port 端口号
 * @returns 端口是否被占用 true or false
 */
const isPortOccupied = (port: number) => {
  const net = require('net');
  let listener = net.createServer().listen(port);
  return new Promise((resolve) => {
    // 如果监听成功，表示端口没有被其他服务占用，端口可用，取消监听，返回结果false
    listener.on('listening', () => {
      listener.close();
      resolve(false);
    });
    // 如果监听出错，并且错误原因是端口正在使用中, 返回结果true, 其它情况返回false
    listener.on('error', (err: any) => {
      listener.close();
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

/**
 * 查找正在使用中的端口
 * @returns 存储所有正在使用中端口的数组
 */
const findPortsInUse = async () => {
  let result: number[] = [];
  // 0~1023为系统端口 1024为保留端口
  for (let i = 1025; i < 65535; i++) {
    try {
      const status = await isPortOccupied(i);
      if (status) {
        result.push(i);
      }
    } catch (e: any) {
      break;
    }
  }
  return result;
};

export default (api: IApi) => {
  api.registerCommand({
    name: 'mongchhi',
    alias: 'mc',
    description: 'call to mongchhi',
    async fn() {
      logger.info('I am here!');
      // 读取 appData 缓存
      // 从缓存页面中读取，或者从页面中打开磁盘目录
      // find live umi app
      const liveUmiApp = localUmiAppData.get();
      logger.profile('find', 'find live umi app...');
      // 寻找占用中的端口
      const portsInUse = await findPortsInUse();
      for (const port of portsInUse) {
        const json: any = await getUmiAppByPort(port);
        if (json && json?.cwd) {
          liveUmiApp[json?.cwd] = json;
        }
      }
      logger.profile('find');
      const keys = Object.keys(liveUmiApp);
      if (keys && keys.length > 0) {
        logger.info('I find some live umi app:');
        keys.forEach((key) => {
          const {
            port = 'unknown',
            host = 'unknown',
            ip = 'unknown',
            pkg: { name },
          } = liveUmiApp[key];
          // "port": 8001,
          // "host": "0.0.0.0",
          // "ip": "10.128.4.158",
          logger.info(
            `${
              name ?? key
            } listening at ${host}:${port},Network: ${ip}:${port}`,
          );
        });
      }
      // 写入 appData 缓存
      localUmiAppData.set(liveUmiApp);
    },
  });
};
