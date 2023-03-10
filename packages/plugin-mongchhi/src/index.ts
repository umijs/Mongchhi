import { IApi } from '@mongchhi/types';
import { localUmiAppData, type IAppData } from '@mongchhi/utils';
import getUmiAppData from './getUmiAppData';

export default (api: IApi) => {
  if (api.appData.umi.name === 'mongchhi') {
    api.onStart(() => {
      // mongchhi 主程序，回去全部 appData
      getUmiAppData();
    });
  } else {
    api.onDevCompileDone(() => {
      // 用户项目，获取当前项目 appData
      localUmiAppData.update((appData: IAppData) => ({
        ...appData,
        [api.appData.cwd]: api.appData,
      }));
    });
  }
};
