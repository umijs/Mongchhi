import useControlledTheme from 'antd-token-previewer/es/hooks/useControlledTheme';
import TokenPanelPro from 'antd-token-previewer/es/token-panel-pro';
import React from 'react';

const defaultTheme = {
  name: 'Custom Theme',
  key: 'test',
  config: {},
};

const ThemeEditor () => {
  const { theme, infoFollowPrimary, onInfoFollowPrimaryChange } =
    useControlledTheme({
      theme: {
        ... defaultTheme,
        config: (window as any).__mongchhi_antd_theme?.theme ?? {},
      },
      defaultTheme,
      onChange: (theme: any) => {
        if ((window as any).__mongchhi_antd_theme?.setTheme) {
          (window as any).__mongchhi_antd_theme.setTheme(t.config);
        }
      },
    });

  return (
    <TokenPanelPro
      aliasOpen={true}
      theme={theme}
      style={{ flex: 1 }}
      infoFollowPrimary={infoFollowPrimary}
      onInfoFollowPrimaryChange={onInfoFollowPrimaryChange}
    />
  );
};

export default ThemeEditor;
