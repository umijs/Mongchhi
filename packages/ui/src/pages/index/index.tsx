function HomePage() {
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
