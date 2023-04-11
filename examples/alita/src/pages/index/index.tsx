import { call } from '@/services/api';
import { socket, useRequest } from 'alita';
import { Button } from 'antd-mobile';
import { useEffect } from 'react';
import styles from './index.css';

export default function ({}) {
  const { run, data = {} } = useRequest(call, {
    manual: true,
  });
  console.log(data);
  useEffect(() => {
    // 支持卸载
    return socket.listen(({ type }) => {
      console.log(type);
      switch (type) {
        case 'simple-hi':
          alert('hello');
          break;
        default:
          break;
      }
    });
  }, []);
  return (
    <div className={styles.normal}>
      <div className={styles.welcome} />
      <p className={styles.description}>
        To get started, edit <code>src/pages/index.js</code> and save to reload.
      </p>
      <Button
        size="large"
        color="primary"
        fill="solid"
        block
        onClick={() =>
          run({
            type: 'call',
            payload: {
              type: 'simple-hi',
            },
          })
        }
      >
        Call HTTP, Back Socket!
      </Button>
    </div>
  );
}
