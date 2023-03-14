import React from 'react';
import { createRoot } from 'react-dom/client';

const doc = window.document;
const node = doc.createElement('div');
doc.body.appendChild(node);

class UI extends React.Component {
  render() {
    const style: any = {
      position: 'fixed',
      right: '8px',
      bottom: '8px',
    };
    return <div style={style}>todo</div>;
  }
}

export default () => {
  const root = createRoot(node);
  root.render(
    // <ErrorBoundary>
    <UI />,
  );
};
