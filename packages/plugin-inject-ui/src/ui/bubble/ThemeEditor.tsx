import { ThemeEditor } from 'antd-token-previewer';
import React, { useState } from 'react';

export default () => {
  const [theme, setTheme] = useState(
    (window as any).__mongchhi_antd_theme?.theme ?? {},
  );
  // todo 样式开发
  return (
    <ThemeEditor
      theme={{ name: 'Custom Theme', key: 'test', config: theme }}
      style={{ height: 'calc(100vh)' }}
      onThemeChange={(t: any) => {
        setTheme(t.config);
        if (
          typeof (window as any).__mongchhi_antd_theme?.setTheme === 'function'
        ) {
          (window as any).__mongchhi_antd_theme.setTheme(t.config);
        }
      }}
    ></ThemeEditor>
  );
};
