import { chalk, logger, rimraf } from '@umijs/utils';
import ora from 'ora';

import { makeSureMaterialsTempPathExist } from './download';

/**
 * 清理 git 缓存目录
 * @param args
 * @param param1
 */
export function clearGitCache(args: {
  dryRun?: boolean;
  nodeModulesPath?: string;
}) {
  const spinner = ora();
  const blocksTempPath = makeSureMaterialsTempPathExist(
    args.dryRun,
    args.nodeModulesPath,
  );

  const info = `🗑  start clear: ${chalk.yellow(blocksTempPath)}`;
  spinner.start(info);

  try {
    rimraf.sync(blocksTempPath);
    spinner.succeed();
  } catch (error) {
    logger.error(error);
    spinner.stop();
  }

  return `🗑  start clear: ${blocksTempPath}`;
}
