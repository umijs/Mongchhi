import { IApi } from '@mongchhi/types';

export default (api: IApi) => {
  api.registerMethod({ name: 'onMongChhiSocket' });
};
