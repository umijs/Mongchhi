import { Button } from 'antd';
import React from 'react';
import { useIntl, useOutlet } from 'umi';

const NotFoundLayout = () => {
  const outlet = useOutlet();
  const intl = useIntl();
  return (
    <main
      style={{
        textAlign: 'center',
        padding: '40px 16px',
      }}
    >
      {outlet}
      <Button>
        {intl.formatMessage({
          id: 'button.back',
        })}
      </Button>
      [404 Layout]
    </main>
  );
};

export { NotFoundLayout };
