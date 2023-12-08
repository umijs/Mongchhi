import React, { useEffect, useState } from 'react';
// import { socket } from 'umi';
import {
  ArrowDownOutlined,
  LikeOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Form, Input, List, message, Modal, Space, Switch } from 'antd';
import { callRemote } from 'umi';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
const IconText = ({
  icon,
  text,
  onClick,
}: {
  icon: React.FC;
  text: string;
  onClick?: () => void;
}) => (
  <Space onClick={onClick}>
    {React.createElement(icon)}
    {text}
  </Space>
);
// {"key":"EmptyPage",
// "name":"空白页面",
// "description":"一个空白的页面，一切都从这里开始！",
// "url":"https://github.com/ant-design/pro-blocks/tree/master/EmptyPage",
// "path":"NewPage","features":["antd"],
// "img":"https://raw.githubusercontent.com/ant-design/pro-blocks/master/EmptyPage/snapshot.png?raw=true",
// "tags":["空白页"],
// "previewUrl":"https://preview.pro.ant.design"},
interface Block {
  key: string;
  name: string;
  description: string;
  url: string;
  path: string;
  img: string;
  previewUrl: string;
  features: string[];
  tags: string[];
}
function BlockPage() {
  const [data, setData] = useState<Block[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalItem, setModalItem] = useState<Block>({});
  const [form] = Form.useForm();

  const { run, loading } = useRequest(
    () =>
      callRemote({
        type: 'org.umi.block.list',
      }),
    {
      cacheKey: 'blockList',
      manual: true,
      onSuccess: (pre: any) => {
        setData(pre?.data ?? []);
      },
    },
  );
  const dataLen = data.length > 0;
  useEffect(() => {
    run();
  }, []);
  return (
    <>
      {!dataLen && (
        <Button loading={loading} onClick={run}>
          刷新
        </Button>
      )}
      {dataLen && (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={data as Block[]}
          renderItem={(item) => (
            <List.Item
              key={item.key}
              actions={[
                <IconText
                  icon={StarOutlined}
                  text="在线预览"
                  onClick={() => {
                    window.open(item.previewUrl, '_blank');
                  }}
                  key="list-vertical-star-o"
                />,
                <IconText
                  icon={LikeOutlined}
                  text="源码"
                  onClick={() => {
                    window.open(item.url, '_blank');
                  }}
                  key="list-vertical-like-o"
                />,
                <IconText
                  icon={ArrowDownOutlined}
                  onClick={() => {
                    setOpen(true);
                    setModalItem(item);
                  }}
                  text="使用"
                  key="list-vertical-message"
                />,
              ]}
              extra={<img width={272} alt="logo" src={item.img} />}
            >
              <List.Item.Meta
                // avatar={<Avatar src={item.avatar} />}
                title={<a href={item.previewUrl}>{item.name}</a>}
                description={item.description}
              />
            </List.Item>
          )}
        />
      )}
      <Modal title="使用区块" open={open} footer={null} closeIcon={false}>
        <Form
          {...layout}
          form={form}
          initialValues={{
            uni18n: false,
            skipModifyRoutes: true,
            skipDependencies: false,
          }}
          name="control-hooks"
          onFinish={async (values: any) => {
            const defaultConfig = {
              block: modalItem,
              path: modalItem?.path,
              uni18n: false,
            };
            setConfirmLoading(true);
            const add = await callRemote({
              type: 'org.umi.block.add',
              payload: { ...defaultConfig, ...values },
            });
            message.success(add?.message);
            setConfirmLoading(false);
            setOpen(false);
          }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="path"
            label="🏗  安装区块的路径"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="uni18n"
            label="🌎  删除 i18n 代码? "
            rules={[{ required: true }]}
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          <Form.Item
            name="skipDependencies"
            label="🌎  跳过依赖安装? "
            rules={[{ required: true }]}
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          {/* <Form.Item
            name="skipModifyRoutes"
            label="🌎  跳过路由修改? "
            rules={[{ required: true }]}
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item> */}
          <Form.Item {...tailLayout}>
            <Space>
              <Button type="primary" htmlType="submit" loading={confirmLoading}>
                确认
              </Button>
              <Button
                htmlType="button"
                onClick={() => {
                  setOpen(false);
                }}
                loading={confirmLoading}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default BlockPage;
