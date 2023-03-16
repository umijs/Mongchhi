import {
  findExportDefaultDeclaration,
  getIdentifierDeclaration,
  getReturnNode,
  haveChildren,
  helper,
  isChildFunc,
  isJSXElement,
  t,
} from '@mongchhi/ast';
import { winPath } from '@umijs/utils';
import assert from 'assert';
import { UI_ADD_COMPONENT, UI_DNDABLE } from '../constants';

const CACHE_LIBS = 'cacheLibs';
function save(file: any, libName: string, name: string, newNode: any) {
  const cacheLibs = file.get(CACHE_LIBS);
  const cache = cacheLibs[libName] || {};
  cache[name] = newNode;
  cacheLibs[libName] = cache;
  file.set(CACHE_LIBS, cacheLibs);
}
function getCache(file: any, libName: string, name: string) {
  const cacheLibs = file.get(CACHE_LIBS);
  const cache = cacheLibs[libName] || {};
  return cache[name];
}

function replaceWith(
  path: any,
  name: string,
  libName: string,
  file: any,
  getNode: () => any,
) {
  let newNode = getCache(file, name, libName);
  if (!newNode) {
    newNode = getNode();
    save(file, name, libName, newNode);
  }
  path.replaceWith(newNode);
}

// 核心：https://www.johno.com/wrap-a-jsx-element-with-babel
export default () => {
  const isDnDable = (node) => {
    return (
      t.isJSXElement(node) &&
      node?.openingElement?.name?.name &&
      (node.openingElement.name.name === UI_DNDABLE ||
        node.openingElement.name.name === UI_ADD_COMPONENT)
    );
  };

  function buildDnDableFlag(opts) {
    const { index, filename, node } = opts;
    if (isDnDable(node)) {
      return node;
    }
    if (!isJSXElement(node)) {
      return node;
    }
    const attrs = [
      t.jsxAttribute(
        t.jsxIdentifier('filename'),
        t.stringLiteral(`${filename}`),
      ),
      t.jsxAttribute(t.jsxIdentifier('index'), t.stringLiteral(`${index}`)),
      t.jsxAttribute(
        t.jsxIdentifier('data'),
        t.stringLiteral(`${JSON.stringify(node)}`),
      ),
    ];
    return t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier(UI_DNDABLE), attrs),
      t.jsxClosingElement(t.jsxIdentifier(UI_DNDABLE)),
      [node],
    );
  }
  function addFlagToIndex(nodes, i, { index, filename, node }) {
    nodes.splice(
      i === 0 ? i : i - 1,
      1,
      buildDnDableFlag({ index, filename, node }),
    );
  }
  function addDnDable(node, { filename, replace }) {
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
                node: child,
              });
              index -= 1;
            }
            i -= 1;
          }
        }
      } else {
        // root 节点没有 children，则在外面套一层
        replace(
          t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), [
            buildDnDableFlag({
              index: 0,
              filename,
              node,
            }) as any,
          ]),
        );
      }
    } else {
    }
  }
  /**
   * 检查是否走 Babel，目前只针对 /pages/ 或 /page/ 目录下的页面
   * 其它不作为添加的入口
   * @param filename 路径名
   */
  const checkPathFilename = (filename: string): boolean => {
    if (winPath(filename).indexOf('pages') > -1) {
      return true;
    }
    return false;
  };

  return {
    pre(file: any) {
      file.set(CACHE_LIBS, {});
    },
    visitor: {
      Identifier(path, state) {
        const {
          filename,
          opts: { doTransform },
        } = state;
        if (!doTransform(filename) || !checkPathFilename(filename)) return;
        const { name } = path.node;
        if (path.scope.hasBinding(path.node.name)) {
          return;
        }
        const parentNode = path.parentPath.node;
        if (
          t.isImportSpecifier(parentNode) ||
          t.isImportDefaultSpecifier(parentNode) ||
          t.isImportNamespaceSpecifier(parentNode)
        ) {
          return;
        }
        // don't support member expression
        // e.g. foo.styles
        if (
          t.isMemberExpression(parentNode) &&
          path.node === parentNode.property
        ) {
          return;
        }
        // don't support object property
        // e.g. { styles: 1 }
        if (t.isObjectProperty(parentNode) && path.node === parentNode.key) {
          return;
        }
        // import umi
        if (name === UI_DNDABLE) {
          replaceWith(path, name, 'umi', state.file, () =>
            helper.addNamed(path, name, 'umi'),
          );
        }
      },
      Program: {
        enter(path, state) {
          const {
            filename,
            opts: { doTransform },
          } = state;
          assert(doTransform, 'opts.doTransform must supplied');
          if (!doTransform(filename) || !checkPathFilename(filename)) return;
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
            if (retNode) {
              addDnDable(retNode, {
                filename: winPath(filename),
                replace,
              });
            }
          }
        },
      },
    },
  };
};
