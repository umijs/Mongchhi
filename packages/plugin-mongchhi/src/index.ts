import { IApi } from "@mongchhi/types";
import { logger } from "@umijs/utils";

const getAppDataUrl = (port: number | string) => {
  return `http://localhost:${port}/__umi/api/app-data`;
};

const getUmiAppByPort = async (port: number | string) => {
  let json: any = null;
  try {
    const { default: fetch } = await import("node-fetch");
    const url = getAppDataUrl(port);
    json = await fetch(url).then((rest) => rest.json());
  } catch (e) {}
  return json;
};

export default (api: IApi) => {
  api.registerCommand({
    name: "mongchhi",
    alias: "mc",
    description: "call to mongchhi",
    async fn({ args }) {
      logger.info("I am here!");
      // TODO: 读取 local all umi app
      // 从缓存页面中读取，或者从页面中打开磁盘目录
      // find live umi app
      const liveUmiApp = {} as any;
      logger.profile("find", "find live umi app...");
      for (let index = 8000; index < 8010; index++) {
        const json: any = await getUmiAppByPort(index);
        if (json && json?.cwd) {
          liveUmiApp[json?.cwd] = json;
        }
      }
      logger.profile("find");
      const keys = Object.keys(liveUmiApp);
      if (keys && keys.length > 0) {
        logger.info("I find some live umi app:");
        keys.forEach((key) => {
          const {
            port = "unknown",
            host = "unknown",
            ip = "unknown",
            pkg: { name },
          } = liveUmiApp[key];
          // "port": 8001,
          // "host": "0.0.0.0",
          // "ip": "10.128.4.158",
          logger.info(
            `${name ?? key} listening at ${host}:${port},Network: ${ip}:${port}`
          );
        });
      }
      // TODO: 通过找到的 umi 项目在本地的地址，在缓存文件中自动添加 local all umi app
    },
  });
};
