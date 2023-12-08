import { IApi } from '@mongchhi/types';
import { chalk, logger } from '@umijs/utils';
import { addBlock } from './utils/addBlock';
import { clearGitCache } from './utils/clearGitCache';
import { getDefaultBlockList } from './utils/list';

export default (api: IApi) => {
  api.describe({
    key: 'block',
    config: {
      schema: (Joi) => {
        return Joi.object({
          defaultGitUrl: Joi.string(),
          npmClient: Joi.string(),
          closeFastGithub: Joi.boolean(),
          branch: Joi.string(),
          homedir: Joi.boolean(),
        });
      },
      default: {
        // TODO: 临时方案，调试方便
        defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
        npmClient: 'pnpm',
        closeFastGithub: true,
        branch: 'master',
        homedir: true,
      },
    },
  });

  async function block(args: any = {}, opts = {}) {
    const { config } = api;
    const blockConfig = config?.block || {};

    let retCtx;
    switch (args._[0]) {
      case 'clear':
        await clearGitCache({
          dryRun: args.dryRun,
          nodeModulesPath:
            blockConfig.homedir === false ? api.paths.absNodeModulesPath : '',
        });
        break;
      case 'add':
        // const cmd = [
        //   `umi block add https://github.com/ant-design/pro-blocks/tree/master/${gitPath}`,
        //   `--path=${item.path}`,
        //   '--skip-dependencies',
        //   '--page',
        //   `--branch=${arg.branch || 'master'}`,
        // ];

        // // 如果是 routes 就不修改路由
        // if (item.routes) {
        //   cmd.push('--skip-modify-routes');
        // }

        // // 如果是 config.js 就下载 js 的区块
        // if (isJS) {
        //   cmd.push('--js');
        // }
        retCtx = await addBlock(
          {
            ...args,
            nodeModulesPath:
              blockConfig.homedir === false ? api.paths.absNodeModulesPath : '',
            url: args._[1],
            ...blockConfig,
          },
          opts,
          api,
        );
        break;
      case 'list':
        retCtx = await getDefaultBlockList(
          {
            ...args,
            nodeModulesPath:
              blockConfig.homedir === false ? api.paths.absNodeModulesPath : '',
          },
          blockConfig,
          api,
        );
        break;
      default:
        throw new Error(
          `Please run ${chalk.cyan.underline(
            'help block',
          )} to checkout the usage`,
        );
    }
    return retCtx; // return for test
  }

  const details = `

Commands:

  ${chalk.cyan(`add `)}     add a block to your project
  ${chalk.cyan(`list`)}     list all blocks
  ${chalk.cyan(`clear`)}    clear all git cache


Options for the ${chalk.cyan(`add`)} command:

  ${chalk.green(
    `--path              `,
  )} the file path, default the name in package.json
  ${chalk.green(
    `--route-path        `,
  )} the route path, default the name in package.json
  ${chalk.green(`--branch            `)} git branch
  ${chalk.green(
    `--npm-client        `,
  )} the npm client, default npm or yarn (if has yarn.lock)
  ${chalk.green(`--skip-dependencies `)} don't install dependencies
  ${chalk.green(`--skip-modify-routes`)} don't modify the routes
  ${chalk.green(
    `--dry-run           `,
  )} for test, don't install dependencies and download
  ${chalk.green(
    `--page              `,
  )} add the block to a independent directory as a page
  ${chalk.green(
    `--layout            `,
  )} add as a layout block (add route with empty children)
  ${chalk.green(
    `--js                `,
  )} If the block is typescript, convert to js
  ${chalk.green(
    `--registry          `,
  )} set up npm installation using the registry
  ${chalk.green(
    `--closeFastGithub   `,
  )} If using custom block repository, please set it to true

Examples:

  ${chalk.gray(`# Add block`)}
  umi block add demo
  umi block add ant-design-pro/Monitor

  ${chalk.gray(`# Add block with full url`)}
  umi block add https://github.com/ant-design/pro-blocks/tree/master/blocks/demo

  ${chalk.gray(`# Add block with specified route path`)}
  umi block add demo --path /foo/bar

  ${chalk.gray(`# List all blocks`)}
  umi block list
  `.trim();

  api.registerCommand({
    name: 'block',
    async fn({ args }) {
      if (!args._[0]) {
        // TODO: use plugin register args
        console.log(
          details
            .replaceAll('umi', api.appData.umi.cliName)
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n'),
        );
        return;
      }
      // return only for test
      try {
        await block(args);
      } catch (e) {
        logger.error(e);
      }
    },
    // description: 'block related commands, e.g. add, list',
    // usage: `umi block <command>`,
    // details,
  });
};
