import {
  findExportDefaultDeclaration,
  getIdentifierDeclaration,
  getReturnNode,
  haveChildren,
  isChildFunc,
  isJSXElement,
  isReactCreateElement,
  t,
} from '@mongchhi/ast';
import { winPath } from '@umijs/utils';
import assert from 'assert';

export default () => {
  function buildGUmiUIFlag(opts) {
    const {
      index,
      filename,
      jsx,
      inline,
      content,
      GUmiUIFlag = 'GUmiUIFlag',
    } = opts;
    if (jsx) {
      const attrs = [
        t.jsxAttribute(
          t.jsxIdentifier('filename'),
          t.stringLiteral(`${filename}`),
        ),
        t.jsxAttribute(t.jsxIdentifier('index'), t.stringLiteral(`${index}`)),
      ];
      if (inline) {
        attrs.push(
          t.jsxAttribute(t.jsxIdentifier('inline'), t.stringLiteral('true')),
        );
      }
      return t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier(GUmiUIFlag), attrs),
        t.jsxClosingElement(t.jsxIdentifier(GUmiUIFlag)),
        content ? [t.jsxText(content)] : [],
        false,
      );
    }
    const attrs = [
      t.objectProperty(
        t.identifier('filename'),
        t.stringLiteral(`${filename}`),
      ),
      t.objectProperty(t.identifier('index'), t.stringLiteral(`${index}`)),
    ];
    if (inline) {
      attrs.push(
        t.objectProperty(t.identifier('inline'), t.stringLiteral('true')),
      );
    }
    return t.callExpression(
      t.memberExpression(t.identifier('React'), t.identifier('createElement')),
      [
        t.identifier(GUmiUIFlag),
        t.objectExpression(attrs),
        ...(content ? [t.stringLiteral(content)] : []),
      ],
    );
  }

  function addFlagToIndex(nodes, i, { index, filename, jsx, GUmiUIFlag }) {
    nodes.splice(i, 0, buildGUmiUIFlag({ index, filename, jsx, GUmiUIFlag }));
  }

  function addUmiUIFlag(node, { filename, replace, GUmiUIFlag }) {
    if (isJSXElement(node)) {
      if (isChildFunc(node)) {
        return;
      }
      if (haveChildren(node)) {
        if (t.isJSXElement(node) || t.isJSXFragment(node)) {
          let index = node.children.filter((n) => isJSXElement(n)).length;
          let i = node.children.length - 1;
          while (i >= 0) {
            const child = node.children[i];
            if (isJSXElement(child) || i === 0) {
              addFlagToIndex(node.children, i === 0 ? i : i + 1, {
                index,
                filename,
                jsx: true,
                GUmiUIFlag,
              });
              index -= 1;
            }
            i -= 1;
          }
        } else {
          const args = node.arguments;
          let index = args.filter((n) => isReactCreateElement(n)).length;
          let i = args.length - 1;
          while (i >= 1) {
            const arg = args[i];
            if (isReactCreateElement(arg) || i === 1) {
              addFlagToIndex(args, i + 1, {
                index,
                filename,
                jsx: false,
                GUmiUIFlag,
              });
              index -= 1;
            }
            i -= 1;
          }
        }
      } else {
        // root 节点没有 children，则在外面套一层
        replace(
          t.isJSXElement(node)
            ? t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), [
                buildGUmiUIFlag({
                  index: 0,
                  filename,
                  jsx: true,
                  GUmiUIFlag,
                }) as any,
                node,
                buildGUmiUIFlag({ index: 1, filename, jsx: true, GUmiUIFlag }),
              ])
            : t.callExpression(
                t.memberExpression(
                  t.identifier('React'),
                  t.identifier('createElement'),
                ),
                [
                  t.memberExpression(
                    t.identifier('React'),
                    t.identifier('Fragment'),
                  ),
                  t.nullLiteral(),
                  buildGUmiUIFlag({
                    index: 0,
                    filename,
                    jsx: false,
                    GUmiUIFlag,
                  }),
                  node,
                  buildGUmiUIFlag({
                    index: 1,
                    filename,
                    jsx: false,
                    GUmiUIFlag,
                  }),
                ],
              ),
        );
      }
    } else {
      // throw new Error(`Add umi ui flag failed, unsupported node type ${node.type}.`);
    }
  }

  function isInBlackList(node, path) {
    if (t.isJSXElement(node)) {
      const { name } = node.openingElement.name;
      if (path.scope.hasBinding(name)) {
        const p = path.scope.getBinding(name).path;
        const { source } = p.parentPath.node;

        // 只处理 import 的声明
        if (!t.isImportDeclaration(p.parentPath.node)) return;

        if (['react-document-title', 'react-intl'].includes(source.value)) {
          return true;
        }

        // antd 和 @alipay/tech-ui 里除部分用于布局的组件之外，其他组件作为根组件不会插入编辑区
        if (
          (source.value === 'antd' ||
            source.value === '@alipay/bigfish/antd') &&
          t.isImportSpecifier(p.node) &&
          t.isIdentifier(p.node.imported) &&
          !['Card', 'Grid', 'Layout'].includes(p.node.imported.name)
        ) {
          return true;
        }
        if (
          source.value === '@alipay/tech-ui' &&
          t.isImportSpecifier(p.node) &&
          t.isIdentifier(p.node.imported) &&
          !['PageContainer'].includes(p.node.imported.name)
        ) {
          return true;
        }

        if (
          t.isImportSpecifier(p.node) &&
          t.isIdentifier(p.node.imported) &&
          [
            'Switch',
            'Route',
            'Router',
            'StaticRouter',
            'Redirect',
            'Link',
            'NavLink',
            'HashRouter',
            'BrowserRouter',
          ].includes(p.node.imported.name)
        ) {
          return true;
        }
      }
    }
  }

  let layoutIndexByFilename: any = {};

  /**
   * 检查是否走 Babel，目前只针对 /pages/ 或 /page/ 目录下的页面
   * 其它不作为添加的入口
   * @param filename 路径名
   */
  const checkPathFilename = (filename: string): boolean => {
    if (
      winPath(filename).indexOf('pages/') > -1 ||
      winPath(filename).indexOf('page/') > -1
    ) {
      return true;
    }
    return false;
  };

  return {
    visitor: {
      Program: {
        enter(path, state) {
          // hmr 时会重复编译相同文件
          layoutIndexByFilename = {};

          const {
            filename,
            opts: { GUmiUIFlag, doTransform },
          } = state;

          assert(doTransform, 'opts.doTransform must supplied');
          if (!doTransform(filename)) return;
          const { node } = path;

          let d: any = findExportDefaultDeclaration(node);

          // Support hoc
          while (t.isCallExpression(d)) {
            // eslint-disable-next-line
            d = d.arguments[0];
          }

          d = getIdentifierDeclaration(d, path);

          // Support hoc again
          while (t.isCallExpression(d)) {
            // eslint-disable-next-line
            d = d.arguments[0];
          }

          const ret = getReturnNode(d, path);
          if (ret) {
            const { node: retNode, replace } = ret;
            if (
              retNode &&
              !isInBlackList(retNode, path) &&
              checkPathFilename(filename)
            ) {
              addUmiUIFlag(retNode, {
                filename: winPath(filename),
                replace,
                GUmiUIFlag,
              });
            }
          }
        },
      },

      CallExpression(path, state) {
        const {
          filename,
          opts: {
            BLOCK_LAYOUT_PREFIX,
            UMI_UI_FLAG_PLACEHOLDER,
            doTransform,
            GUmiUIFlag,
          },
        } = state;

        assert(doTransform, 'opts.doTransform must supplied');
        if (!doTransform(filename)) return;

        const { node } = path;
        const { callee, arguments: args } = node;

        // _react.default.createElement(_umi.UmiUIFlag, null)
        // if (
        //   t.isMemberExpression(callee) &&
        //   t.isIdentifier(callee.property, {
        //     name: 'createElement',
        //   }) &&
        //   t.isIdentifier(args[0]) &&
        //   args[0].name === UMI_UI_FLAG_PLACEHOLDER
        // ) {
        //   if (!layoutIndexByFilename[filename]) {
        //     layoutIndexByFilename[filename] = 0;
        //   }

        //   const index = layoutIndexByFilename[filename];

        //   const content = null;
        //   let inline = false;
        //   if (
        //     t.isObjectExpression(args[1]) &&
        //     args[1].properties.some(
        //       (property) => t.isProperty(property) && property.key?.name === 'inline' && property.value?.value === true,
        //     )
        //   ) {
        //     inline = true;
        //   }

        //   path.replaceWith(
        //     buildGUmiUIFlag({
        //       index: `${BLOCK_LAYOUT_PREFIX}${index}`,
        //       filename: winPath(filename),
        //       jsx: false,
        //       inline,
        //       content,
        //       GUmiUIFlag,
        //     }),
        //   );

        //   layoutIndexByFilename[filename] += 1;
        // }
      },
    },
  };
};
