import { IApi } from '@mongchhi/types';
import { localUmiAppData } from '@mongchhi/utils';
import getUmiAppData from './getUmiAppData';

export default (api: IApi) => {
  api.onStart(() => {
    // @ts-ignore
    if (api.service.opts.frameworkName === 'mongchhi') {
      getUmiAppData();
    } else {
      localUmiAppData.update((appData) => ({
        ...appData,
        ...api.appData,
      }));
    }
  });
};
