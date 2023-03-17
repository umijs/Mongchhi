import useControlledTheme from 'antd-token-previewer/es/hooks/useControlledTheme';
import TokenPanelPro from 'antd-token-previewer/es/token-panel-pro';
import React, { useState } from 'react';

const defaultTheme = {
  name: 'Custom Theme',
  key: 'test',
  config: {},
};

const ThemeEditor = () => {
  const [config, setConfig] = useState( (window as any).__mongchhi_antd_theme?.theme ?? {});
  const { theme, infoFollowPrimary, onInfoFollowPrimaryChange } =
    useControlledTheme({
      theme: {
        ... defaultTheme,
        config,
      },
      defaultTheme,
      onChange: (theme: any) => {
        setConfig(theme.config);
        if ((window as any).__mongchhi_antd_theme?.setTheme) {
          (window as any).__mongchhi_antd_theme.setTheme(theme.config);
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
