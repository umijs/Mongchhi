import { Button, ConfigProvider, message, Typography } from 'antd';
import { enUS, ThemeEditor, zhCN } from 'antd-token-previewer';
import type { ThemeConfig } from 'antd/es/config-provider/context';
import React, { useLayoutEffect } from 'react';
import { socket, useLocation } from 'umi';

const locales = {
  cn: {
    title: '主题编辑器',
    save: '保存',
    export: '导出',
    editModelTitle: '编辑主题配置',
    editJsonContentTypeError: '主题 JSON 格式错误',
    editSuccessfully: '编辑成功',
    saveSuccessfully: '保存成功',
    initialEditor: '正在初始化编辑器...',
  },
  en: {
    title: 'Theme Editor',
    save: 'Save',
    edit: 'Edit',
    export: 'Export',
    editModelTitle: 'edit Theme Config',
    editJsonContentTypeError: 'The theme of the JSON format is incorrect',
    editSuccessfully: 'Edited successfully',
    saveSuccessfully: 'Saved successfully',
    initialEditor: 'Initializing Editor...',
  },
};

const CustomTheme = () => {
  // todo 检查是否安装了 antd@5
  const [messageApi, contextHolder] = message.useMessage();
  // todo 预言切换
  // const [locale, lang] = useLocale(locales);
  const lang = 'cn';
  const locale = locales[lang];

  const [theme, setTheme] = React.useState<ThemeConfig>({ token: {} });
  const location = useLocation();
  const cwd = (location.state as any)?.appData?.cwd;

  const getAntdTheme = () => {
    socket.send({
      type: 'get-antd-theme',
      payload: {
        cwd,
      },
    });
  };

  const saveAntdTheme = () => {
    socket.send({
      type: 'save-antd-theme',
      payload: {
        cwd,
        token: theme.token,
      },
    });
  };

  useLayoutEffect(() => {
    // 读取项目 theme 文件
    getAntdTheme();
    // 监听事件，支持卸载
    return socket.listen(({ type, payload }) => {
      switch (type) {
        case 'get-antd-theme':
          setTheme({ token: payload.token });
          break;
        case 'save-antd-theme/success':
          messageApi.success(locale.saveSuccessfully);
          break;
        default:
      }
    });
  }, []);

  const handleSave = () => {
    // 保存 theme 到项目文件
    saveAntdTheme();
  };

  const handleExport = () => {
    const file = new File(
      [JSON.stringify(theme, null, 2)],
      `Ant Design Theme.json`,
      {
        type: 'text/json; charset=utf-8;',
      },
    );
    const tmpLink = document.createElement('a');
    const objectUrl = URL.createObjectURL(file);

    tmpLink.href = objectUrl;
    tmpLink.download = file.name;
    document.body.appendChild(tmpLink);
    tmpLink.click();

    document.body.removeChild(tmpLink);
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div>
      {contextHolder}
      <ConfigProvider theme={{ inherit: false }}>
        <div
          style={{
            display: 'flex',
            height: 56,
            alignItems: 'center',
            padding: '0 24px',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F0F0F0',
          }}
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            {locale.title}
          </Typography.Title>
          <div>
            <Button onClick={handleExport} style={{ marginRight: 8 }}>
              {locale.export}
            </Button>
            <Button type="primary" onClick={handleSave}>
              {locale.save}
            </Button>
          </div>
        </div>
        <ThemeEditor
          theme={{ name: 'Custom Theme', key: 'test', config: theme }}
          style={{ height: 'calc(100vh - 64px - 56px)' }}
          onThemeChange={(newTheme) => {
            setTheme(newTheme.config);
          }}
          locale={lang === 'cn' ? zhCN : enUS}
        />
      </ConfigProvider>
    </div>
  );
};

export default CustomTheme;
