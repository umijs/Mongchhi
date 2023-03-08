import { useEffect } from 'react';
import { socket } from 'umi';

function HomePage() {
  useEffect(() => {
    // 支持卸载
    return socket.listen((type) => {
      console.log(type);
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
    </div>
  );
}

export default HomePage;
