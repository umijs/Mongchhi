import { IApi } from '@mongchhi/types';
import { fsExtra } from '@umijs/utils';
import { writeFileSync } from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import { dirname } from 'path';
import { addBlock } from './addBlock';
import {
  genBlockName,
  getBlockListFromGit,
  getCacheBlockByUrl,
  printBlocks,
} from './util';
/**
 * 交互型区块选择
 * - 选择区块名
 * - 输入路径
 * - 选择是否转化 js
 * @param {[
 *  name:string;
 *  value:string;
 *  key:string;
 * ]} blockArray
 * @returns Promise<{args}>
 */
export async function selectInstallBlockArgs(blockArray: any[]) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    let locale = false;
    const { block, path, uni18n } = await inquirer.prompt([
      {
        type: 'list',
        name: 'block',
        message: `⛰  请选择区块（共 ${blockArray.length} 个 )`,
        choices: blockArray,
      },
      { type: 'input', name: 'path', message: '🏗  请输入输出安装区块的路径' },
      // {
      //   type: 'confirm',
      //   name: 'js',
      //   message: '🤔  将 Typescript 区块转化为 js?',
      //   default: false,
      // },
      {
        type: 'confirm',
        name: 'uni18n',
        message: '🌎  删除 i18n 代码? ',
        default: false,
      },
    ]);
    // 默认不转 js
    const js = false;
    if (uni18n) {
      const { region } = await inquirer.prompt([
        {
          type: 'input',
          name: 'region',
          message: '🌎  请输入你的选择的语言? ',
          default: 'zh-CN',
        },
      ]);
      locale = region;
    }

    const blockPath = path || genBlockName(block);

    resolve({
      url: block,
      path: blockPath,
      js,
      uni18n: locale,
    });
  });
}

/**
 * 获取区块列表，默认会从  http://blocks.umijs.org/api/blocks 拉
 * 如果配置 defaultGitUrl ，会从 defaultGitUrl 去找
 * @param {*} _
 * @param {*} blockConfig
 */
export async function getDefaultBlockList(
  _: any,
  blockConfig: any = {},
  api: IApi,
) {
  const spinner = ora();
  let blockArray = [];
  const { defaultGitUrl } = blockConfig;

  const [cacheBlocks, cacheFiles] = await getCacheBlockByUrl(
    defaultGitUrl,
    api.paths.absNodeModulesPath,
    {
      ...(blockConfig || {}),
      ..._,
    },
  );
  if (cacheBlocks) {
    blockArray = cacheBlocks;
  } else {
    spinner.start('🚣  fetch block list');

    // 如果存在 defaultGitUrl 的配置，就从 defaultGitUrl 配置中拿区块列表
    if (defaultGitUrl) {
      // 一个 github 的 api,可以获得文件树
      blockArray = await getBlockListFromGit(defaultGitUrl, true);
      fsExtra.mkdirpSync(dirname(cacheFiles));
      writeFileSync(cacheFiles, JSON.stringify(blockArray), 'utf-8');
    } else {
      throw new Error('block.defaultGitUrl no found!');
    }
    spinner.succeed();
  }

  if (blockArray.length > 0) {
    // 自定义的方式，不直接使用 cli 的方式，可能是 ui 操作或者其它
    if (_.customSelectBlockArgs) {
      _.customSelectBlockArgs(blockArray);
    } else {
      blockArray = printBlocks(blockArray, true);

      const args = (await selectInstallBlockArgs(blockArray)) as any;
      return addBlock({ ..._, ...args, ...blockConfig }, {}, api);
    }
  }
  return new Error('No block found');
}
