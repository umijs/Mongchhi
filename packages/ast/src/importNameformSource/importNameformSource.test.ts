import { getASTByFilePath } from '@umijs/ast';
import { join } from 'path';
import { generate } from '../generate/generate';
import { importNameformSource } from './importNameformSource';

const fixtures = join(__dirname, '../../fixtures');
const cwd = join(fixtures, 'importSource');

test('normal', () => {
  const ast = getASTByFilePath(join(cwd, 'a.ts'));
  const outputAst = importNameformSource(ast!, 'getASTByFilePath', '@umijs/ast');
  const code = generate(outputAst);
  expect(code).toContain(
    "import { generate, getASTByFilePath } from '@umijs/ast';\nconsole.log(generate);\nconst bar = {};",
  );
});

test('no import', () => {
  const ast = getASTByFilePath(join(cwd, 'b.ts'));
  const outputAst = importNameformSource(ast!, 'getASTByFilePath', '@umijs/ast');
  const code = generate(outputAst);
  expect(code).toContain("import { getASTByFilePath } from '@umijs/ast';const bar = {};");
});
// 请使用 typescript 完成 importNameformSource 函数，使得一下测试用例通过。

// import * as t from '@babel/types';
// import * as fs from 'fs';
// const parser = require('@babel/parser');
// const generator = require('@babel/generator');

// function importNameformSource(ast, name, source) {}

// describe('importNameformSource', () => {
//   afterEach(() => {
//     // Clean up any modified files after each test
//     fs.unlinkSync('test-file.js');
//   });

//   it('adds an ImportDeclaration node for antd and Button to a file', () => {
//     // Write a test file with no import statements
//     fs.writeFileSync('test-file.js', 'const foo = 1;\nconst bar = 2;\n');
//     const code = fs.readFileSync('test-file.js', 'utf8');
//     // Parse the code into an AST
//     const ast = parser.parse(code);
//     // Call the addAntdImport function on the test file
//     const newAst = importNameformSource(ast, 'Card', 'antd');
//     const output = generator.default(newAst, {}, code);
//     // Expect the modified code to contain an ImportDeclaration node for antd and Button
//     expect(output).toContain('import { Card } from "antd";\nconst foo = 1;\nconst bar = 2;\n');
//   });
//   it('adds Button to the list of imported names for antd in a file', () => {
//     // Write a test file with no import statements
//     fs.writeFileSync('test-file.js', 'import { Button } from "antd";\nconst foo = 1;\nconst bar = 2;\n');
//     const code = fs.readFileSync('test-file.js', 'utf8');
//     // Parse the code into an AST
//     const ast = parser.parse(code);
//     // Call the addAntdImport function on the test file
//     const newAst = importNameformSource(ast, 'Card', 'antd');
//     const output = generator.default(newAst, {}, code);
//     // Expect the modified code to contain an ImportDeclaration node for antd and Button
//     expect(output).toContain('import { Button,Card } from "antd";\nconst foo = 1;\nconst bar = 2;\n');
//   });
// });
