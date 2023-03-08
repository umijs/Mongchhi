import { useEffect, useState } from 'react';
import { socket } from 'umi';

function HomePage() {
  const [appData, setAppData] = useState({});

  useEffect(() => {
    socket.send(
      JSON.stringify({
        type: 'app-data',
      }),
    );
    // 支持卸载
    return socket.listen(({ type, payload }) => {
      console.log(type, payload);
      switch (type) {
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
    </div>
  );
}

export default HomePage;
