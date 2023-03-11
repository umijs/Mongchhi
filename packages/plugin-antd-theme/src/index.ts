import { IApi } from '@mongchhi/types';
import fs from 'fs';
import path from 'path';

export default (api: IApi) => {
  const getAntdThemeFromFile = (cwd = api.cwd as string): object => {
    const themeFile = path.join(cwd, 'src/theme-token.json');
    if (fs.existsSync(themeFile)) {
      const content = fs.readFileSync(themeFile, 'utf-8');
      try {
        const theme = JSON.parse(content);
        return theme;
      } catch (e) {}
    }
    return {};
  };

  const saveAntdThemeToFile = (
    cwd = api.cwd as string,
    token: object,
  ): void => {
    const themeFile = path.join(cwd, 'src/theme-token.json');
    fs.writeFileSync(themeFile, JSON.stringify(token), 'utf-8');
  };

  api.onMongChhiSocket(async ({ type, send, payload }) => {
    switch (type) {
      // 获取主题 token
      case 'get-antd-theme':
        send(
          JSON.stringify({
            type: 'get-antd-theme',
            payload: {
              token: getAntdThemeFromFile(payload?.cwd),
            },
          }),
        );
        break;
      // 写入主题 token
      case 'save-antd-theme':
        // 告诉客户端写入成功
        saveAntdThemeToFile(payload?.cwd, payload?.token ?? {});
        send(
          JSON.stringify({
            type: 'save-antd-theme-success',
          }),
        );
      default:
    }
  });
};
