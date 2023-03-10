import { useEffect, useState } from 'react';
// @ts-ignore
import { socket } from 'umi';

function HomePage() {
  const [appData, setAppData] = useState({});

  // 请求最新应用信息 appData
  const refreshAppData = () => {
    socket.send(
      JSON.stringify({
        type: 'app-data',
      }),
    );
  };

  useEffect(() => {
    // 获取 appData
    refreshAppData();
    // 支持卸载
    return socket.listen(({ type, payload }) => {
      console.log(type, payload);
      switch (type) {
        // 得到最新应用信息 appData
        case 'app-data':
          setAppData(payload);
          break;
        default:
      }
    });
  }, []);
  return (
    <div>
      <h2
        onClick={() => {
          socket.send(
            JSON.stringify({
              type: 'call',
              payload: {
                type: 'something back!',
              },
            }),
          );
        }}
      >
        Yay! Welcome to umi!
      </h2>
      {Object.keys(appData).map((path) => (
        <div key={path}>{path}</div>
      ))}
      {Object.keys(appData).length > 0 && (
        <div>
          <button type='submit' onClick={refreshAppData}>refresh</button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
