import { IApi } from 'umi';
import { FRAMEWORK_NAME } from './constants';

export default (api: IApi) => {
  // why?
  // ui 应该属于 mongchhi 项目收集的时候，应该忽略自己？
  api.modifyAppData((memo) => {
    memo.umi.name = FRAMEWORK_NAME;
    return memo;
  });
};
