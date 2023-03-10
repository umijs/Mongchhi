import { IApi } from '@mongchhi/types';
import getUmiAppData from './getUmiAppData';

export default (api: IApi) => {
  api.onStart(() => {
    if (['dev']).includes(api.name) === true) {
      getUmiAppData();
    }
  });
};
