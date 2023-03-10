import { IApi } from '@mongchhi/types';
import { localUmiAppData, type IAppData } from '@mongchhi/utils';
import getUmiAppData from './getUmiAppData';

export default (api: IApi) => {
  api.onStart(() => {
    // @ts-ignore
    if (api.service.opts.frameworkName === 'mongchhi') {
      // mongchhi 主程序，回去全部 appData
      getUmiAppData();
    }
  });

  api.onDevCompileDone(() => {
    // 用户项目，获取当前项目 appData
    localUmiAppData.update((appData: IAppData) => ({
      ...appData,
      [api.appData.cwd]: api.appData,
    }));
  });
};
