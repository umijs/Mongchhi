import React from 'react';
import { socket } from 'umi';

function HomePage() {
  return (
    <div>
      <h2
        onClick={() => {
          socket.send({
            type: 'call',
            payload: {
              type: 'something back!',
            },
          });
        }}
      >
        Yay! Welcome to umi!
      </h2>
    </div>
  );
}

export default HomePage;
