import type { FC } from 'react';
import React from 'react';
import { useIntl } from 'umi';

const NotFoundPage: FC = () => {
  const intl = useIntl();
  return (
    <div>
      {intl.formatMessage({
        id: 'not-found',
      })}
    </div>
  );
};

export default NotFoundPage;
