import * as t from '@umijs/bundler-utils/compiled/babel/types';

export function importNameformSource(ast: t.File, name: string, source: string): t.File {
  // Find any ImportDeclaration nodes for the given source
  const importNode = ast.program.body.find((node) => {
    return node.type === 'ImportDeclaration' && node.source.value === source;
  });
  if (importNode) {
    // If there is already an ImportDeclaration node for the given source, add the name to the list of imported names
    // @ts-ignore
    importNode.specifiers.push({
      type: 'ImportSpecifier',
      local: {
        type: 'Identifier',
        name,
      },
      imported: {
        type: 'Identifier',
        name,
      },
    });
  } else {
    // If there is no ImportDeclaration node for the given source, create one
    ast.program.body.unshift({
      type: 'ImportDeclaration',
      specifiers: [
        {
          type: 'ImportSpecifier',
          // @ts-ignore
          local: {
            type: 'Identifier',
            name,
          },
          // @ts-ignore
          imported: {
            type: 'Identifier',
            name,
          },
        },
      ],
      // @ts-ignore
      source: {
        type: 'StringLiteral',
        value: source,
      },
    });
  }

  return ast;
}
