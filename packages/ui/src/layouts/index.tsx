import { TheFooter } from '@/components/TheFooter';
import { useDark } from '@/hooks/useDark';
import { App, ConfigProvider, Layout, theme } from 'antd';
import React, { useState } from 'react';
import { Outlet, useLocation } from 'umi';
import { NotFoundLayout } from './404';

const { darkAlgorithm, defaultAlgorithm, useToken } = theme;

const Content = () => {
  const { pathname } = useLocation();
  const {
    token: { colorBgContainer },
  } = useToken();
  let layout = <Outlet />;
  if (pathname === '/404') {
    layout = <NotFoundLayout />;
  }

  return (
    <Layout.Content
      style={{
        margin: '24px 16px',
        padding: 24,
        minHeight: 280,
        background: colorBgContainer,
      }}
    >
      {layout}
    </Layout.Content>
  );
};
const BaseLayout = () => {
  const [darkTheme, changeTheme] = useDark();
  const [colorPrimary, setColorPrimary] = useState<any>();
  return (
    <ConfigProvider
      theme={{
        algorithm: [darkTheme ? darkAlgorithm : defaultAlgorithm],
        // colorInfo is colorPrimary for antd@4
        token: !!colorPrimary ? { colorPrimary, colorInfo: colorPrimary } : {},
      }}
    >
      <App>
        {Math.random()}
        <Layout
          hasSider={false}
          style={{
            minHeight: '100vh',
            margin: 0,
            padding: 0,
          }}
        >
          <Content />
          {Math.random()}
          <Layout.Footer style={{ textAlign: 'center' }}>
            <TheFooter
              changeTheme={changeTheme}
              selectTheme={(color) => {
                setColorPrimary(color.hex);
              }}
            />
          </Layout.Footer>
        </Layout>
      </App>
    </ConfigProvider>
  );
};

export default BaseLayout;
