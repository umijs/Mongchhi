import React from 'react';
import { createRoot } from 'react-dom/client';
import AntdThemeEditor from './antd-theme-editor';

interface UIProps {
  cwd: string;
}

const doc = window.document;
const node = doc.createElement('div');
doc.body.appendChild(node);

const UI: React.FC<UIProps> = (props) => {
  const { cwd } = props;
  return (
    <>
      <AntdThemeEditor cwd={cwd} />
    </>
  );
};

export default (props: UIProps) => {
  const root = createRoot(node);
  root.render(
    // <ErrorBoundary>
    <UI {...props} />,
  );
};
