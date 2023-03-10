import { IApi } from '@mongchhi/types';
import { FRAMEWORK_NAME } from '../constants';

export default (api: IApi) => {
  api.modifyAppData((memo) => {
    memo.umi.name = FRAMEWORK_NAME;
    return memo;
  });
};
