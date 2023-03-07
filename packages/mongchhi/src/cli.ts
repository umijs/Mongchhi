import { logger, yParser } from '@umijs/utils';
import { DEV_COMMAND } from './constants';
import { Service } from './service/service';

export async function run() {
  const args = yParser(process.argv.slice(2), {
    alias: {
      version: ['v'],
      help: ['h'],
    },
    boolean: ['version'],
  });
  let command = args._[0];
  if ([DEV_COMMAND, 'setup'].includes(command)) {
    process.env.NODE_ENV = 'development';
  } else if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }
  if (!command) {
    // 没有命令就默认启动 ui 页面
    command = 'show';
  }
  if (command === 'version' || command === 'v') {
    const pkg = require('../package.json');
    console.log(`${pkg?.name}@${pkg?.version}`);
  } else {
    try {
      await new Service().run2({
        name: command,
        args,
      });
    } catch (e: any) {
      logger.error(e);
      process.exit(1);
    }
  }
}
