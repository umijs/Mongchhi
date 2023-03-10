import type { MenuProps } from 'antd';
import { Avatar, Dropdown, Input, List, Space, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useEffect, useState } from 'react';
import { socket } from 'umi';
import styles from './index.less';

const { Search } = Input;

// route数据类型
type RouteType = {
  id: string;
  path: string;
  component: string;
};
// 项目信息数据类型
type AppDataType = {
  key: string;
  name: string; // 项目名称
  cwd: string; // 项目路径
  umiName: string; // Umi系项目类型
  umiVersion: string; // Umi版本
  icon: string; // icon图标
  routes: RouteType[]; // 路由信息
  treeData?: DataNode[]; // 树形控件数据
};
type HeaderProps = {
  onSearch: (value: string) => void;
};

// TODO: 暂无icon
/**
 * 处理appData数据
 * @param appData 原始appData数据
 * @returns 返回用于展示的初始数据
 */
const accessAppData = (appData: any): AppDataType[] => {
  return Object.keys(appData).map((path) => {
    const { pkg = {}, cwd = '', umi = {}, routes = {} } = appData[path];
    const arr_cwd = path.split('/'); // 拆分cwd以获取默认项目名称
    const result = {
      key: path,
      name: pkg?.name ?? arr_cwd[arr_cwd.length - 1] ?? 'unknown',
      cwd: cwd ?? '',
      umiName: umi?.name ?? 'unknown',
      umiVersion: umi?.version ?? 'unknown',
      icon: '',
      routes: Object.keys(routes ?? {}).map((key: string) => ({
        id: routes[key]?.id,
        path: routes[key]?.path,
        component: routes[key]?.file,
      })),
      treeData: [
        {
          title: '详细信息',
          key: '0-0',
          children: [
            {
              title: 'umi系项目类型: ' + umi?.name ?? 'unknown',
              key: '0-0-0',
            },
            {
              title: 'Umi版本: ' + umi?.version ?? 'unknown',
              key: '0-0-1',
            },
            {
              title: '路由信息',
              key: '0-0-2',
              children: [] as DataNode[],
            },
          ],
        },
      ],
    };
    // 添加树形控件中展示路由的数据
    let target = result.treeData[0].children.find(
      (val: DataNode) => val.title === '路由信息',
    );
    let nextTreeKey = 0; // 添加children时所需的树形控件key
    result.routes.forEach((route: RouteType) => {
      target?.children?.push({
        title: `(${route.id}) : '${route.path}' --> '${route.component}'`,
        key: '0-0-2-' + nextTreeKey++,
      });
    });
    return result;
  });
};

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  // 下拉菜单的操作内容
  const items = [
    {
      key: '1',
      label: '重新扫描',
    },
    {
      key: '2',
      label: '创建项目',
    },
  ];

  /**
   * 处理下拉菜单按钮点击
   * @param e 点击目标的信息
   */
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
  };

  return (
    <Space>
      <Dropdown.Button menu={{ items, onClick: handleMenuClick }}>
        更多操作
      </Dropdown.Button>
      <Search placeholder="input search text" onSearch={onSearch} />
    </Space>
  );
};

function AppsPage() {
  const [appDatas, setAppDatas] = useState<AppDataType[]>([]); // 初始数据
  const [filterDatas, setFilterDatas] = useState<AppDataType[]>([]); // 经过搜索过滤的数据

  useEffect(() => {
    socket.send(
      JSON.stringify({
        type: 'app-data',
      }),
    );
    // 支持卸载
    return socket.listen(({ type, payload }) => {
      switch (type) {
        case 'app-data':
          setAppDatas(accessAppData(payload));
          setFilterDatas(accessAppData(payload));
          break;
        default:
      }
    });
  }, []);

  /**
   * 处理搜索操作
   * @param value 搜索内容
   */
  const handleSearch = (value: string) => {
    setFilterDatas(
      appDatas.filter((item: AppDataType) => item.name.includes(value)),
    );
  };
  // TODO: 唤起vscode对目标文件夹进行编辑操作
  /**
   * 处理编辑按钮点击
   * @param appData 单项appdata信息
   */
  const handleEdit = (appData: AppDataType) => {
    console.log(appData);
  };

  return (
    <div>
      <Header onSearch={handleSearch} />
      <List
        itemLayout="horizontal"
        dataSource={filterDatas}
        renderItem={(item) => (
          <div className={styles.appDataItem}>
            <List.Item
              actions={[
                <a
                  key="list-loadmore-edit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleEdit(item);
                  }}
                >
                  edit
                </a>,
              ]}
              style={{
                margin: 0,
              }}
            >
              <List.Item.Meta
                avatar={<Avatar size="large"></Avatar>}
                title={item.name}
                description={item.cwd}
              ></List.Item.Meta>
            </List.Item>
            <Tree
              // showLine
              treeData={item.treeData ?? []}
            />
          </div>
        )}
      />
    </div>
  );
}

export default AppsPage;
