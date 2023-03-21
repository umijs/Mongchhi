import { FormatPainterFilled } from '@ant-design/icons';
import { Button, Drawer, FloatButton, Space } from 'antd';
import React, { useEffect, useState } from 'react';
// @ts-ignore
import { socket } from 'umi';
import ThemeEditor from './ThemeEditor';

const get_antd_theme = 'get-antd-theme';

let initTheme = {}; // 初始主题

const AntdThemeEditor: React.FC<{ cwd: string }> = (props) => {
  const { cwd } = props;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [theme, setTheme] = useState(initTheme);

  // 更新主题
  const syncTheme = (theme: any) => {
    // 更新编辑器主题
    setTheme(theme);
    // 更新项目主题
    if ((window as any).__mongchhi_antd_set_theme) {
      (window as any).__mongchhi_antd_set_theme(theme);
    }
  };

  // 保存主题
  const saveTheme = () => {
    socket.send({
      type: 'save-antd-theme',
      payload: theme,
    });
  };

  useEffect(() => {
    // onready
    socket.send({
      type: get_antd_theme,
      payload: {
        token: cwd,
      },
    });
    // 监听 ws
    socket.listen((message: any) => {
      const { type, payload } = message;
      switch (type) {
        // 获得初始主题
        case get_antd_theme:
          initTheme = payload;
          setTheme(payload);
          break;
        default:
      }
    });
  }, []);

  return (
    <>
      <Drawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={900}
        mask={false}
        extra={
          <Space>
            <Button onClick={() => syncTheme(initTheme)}>重置</Button>
            <Button type="primary" onClick={saveTheme}>
              保存
            </Button>
          </Space>
        }
      >
        <ThemeEditor
          theme={theme}
          onThemeChange={(t: any) => syncTheme(t.config)}
        />
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

export default AntdThemeEditor;
