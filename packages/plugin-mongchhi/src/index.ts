import { IApi } from '@mongchhi/types';
import { localUmiAppData, type IAppData } from '@mongchhi/utils';
import launchEditor from '@umijs/launch-editor';
import getUmiAppData from './getUmiAppData';

export default (api: IApi) => {
  api.onStart(() => {
    if (api.appData.umi.name === 'mongchhi') {
      // mongchhi 主程序，获取全部 appData
      getUmiAppData();
    }
  });
  api.onDevCompileDone(() => {
    if (api.appData.umi.name !== 'mongchhi') {
      // 用户项目，获取当前项目 appData
      localUmiAppData.update((appData: IAppData) => ({
        ...appData,
        [api.appData.cwd]: api.appData,
      }));
      // todo 告诉主程序，有应用启动了
      // todo 主程序 ui 收到消息，刷新 app-data
    }
  });
  api.onMongChhiSocket(async ({ type, send, payload }) => {
    switch (type) {
      case 'app-data':
        // 发送 localUmiAppData
        send(
          JSON.stringify({
            type: 'app-data',
            payload: localUmiAppData.get(),
          }),
        );
        break;
      case 'openProjectInEditor':
        try {
          await launchEditor(payload.cwd);
        } catch (e) {
          console.error(e);
        }
        break;
    }
  });
};
