import useControlledTheme from 'antd-token-previewer/es/hooks/useControlledTheme';
import TokenPanelPro from 'antd-token-previewer/es/token-panel-pro';
import React from 'react';

const defaultTheme = {
  name: 'Custom Theme',
  key: 'test',
  config: {},
};

interface ThemeEditorProps {
  theme: any;
  onThemeChange: (theme: any) => void;
}

const ThemeEditor = (props: ThemeEditorProps) => {
  const { theme, infoFollowPrimary, onInfoFollowPrimaryChange } =
    useControlledTheme({
      theme: {
        ...defaultTheme,
        config: props.theme,
      },
      defaultTheme,
      onChange: props.onThemeChange,
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
