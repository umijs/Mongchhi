import { FormatPainterFilled } from '@ant-design/icons';
import { Drawer, FloatButton } from 'antd';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ThemeEditor from './ThemeEditor';

const doc = window.document;
const node = doc.createElement('div');
doc.body.appendChild(node);

const UI: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  return (
    <>
      <Drawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
        mask={false}
      >
        {drawerVisible && <ThemeEditor />}
      </Drawer>
      <FloatButton
        shape="circle"
        type="primary"
        icon={<FormatPainterFilled />}
        onClick={() => setDrawerVisible(true)}
        style={{ right: '8px' }}
      />
    </>
  );
};

export default () => {
  const root = createRoot(node);
  root.render(
    // <ErrorBoundary>
    <UI />,
  );
};
