import { TheFooter } from '@/components/TheFooter';
import { useDark } from '@/hooks/useDark';
import { App, ConfigProvider, Layout, theme } from 'antd';
import React, { useState } from 'react';
import { useLocation } from 'umi';
import { NotFoundLayout } from './404';
import { DefaultLayout } from './default';
import { HomeLayout } from './home';

const { darkAlgorithm, defaultAlgorithm } = theme;

export default () => {
  const { pathname } = useLocation();
  const [darkTheme, changeTheme] = useDark();
  const [colorPrimary, setColorPrimary] = useState<any>();
  let layout = <DefaultLayout />;
  switch (pathname) {
    case '/':
      layout = <HomeLayout />;
      break;
    case '/404':
      layout = <NotFoundLayout />;
      break;
    default:
      break;
  }
  return (
    <ConfigProvider
      theme={{
        algorithm: [darkTheme ? darkAlgorithm : defaultAlgorithm],
        // colorInfo is colorPrimary for antd@4
        token: !!colorPrimary ? { colorPrimary, colorInfo: colorPrimary } : {},
      }}
    >
      <App>
        <Layout
          hasSider={false}
          style={{
            minHeight: '100vh',
            margin: 0,
            padding: 0,
          }}
        >
          {layout}
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
