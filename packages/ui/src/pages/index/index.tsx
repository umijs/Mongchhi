import { DnDable } from '@/components/DnDable/DnDable';
import React from 'react';
import { socket } from 'umi';

function HomePage() {
  return (
    <div>
      <DnDable data={{ type: '112' }}>
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
      </DnDable>
      <DnDable data={{ type: '2222' }}>
        <h1>234343</h1>
      </DnDable>
    </div>
  );
}

export default HomePage;
