import { IApi } from '@mongchhi/types';

export default (api: IApi) => {
  api.describe({
    key: 'blocks',
    config: {
      schema: (Joi) => {
        return Joi.any();
      },
    },
  });

  
};
