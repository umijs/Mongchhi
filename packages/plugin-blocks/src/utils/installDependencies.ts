import execa from '@umijs/deps/compiled/execa';
import assert from 'assert';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
// TODO:  since require() of ES Module
// import sortPackageJson from 'sort-package-json';
import {
  dependenciesConflictCheck,
  getAllBlockDependencies,
  getMockDependencies,
} from '@umijs/block-sdk/lib/getBlockGenerator';

/**
 * 依赖从数组转化为对象
 * @param {*} templateTmpDirPath
 */
const depsArrayToObject = (loc: any[]) =>
  loc
    .map((dep) => ({ [dep[0]]: dep[1] }))
    .reduce(
      (pre, next) => ({
        ...pre,
        ...next,
      }),
      {},
    );

/**
 * 安装依赖包
 * - 获取项目路径
 * - 递归获得依赖项。
 * - 调用 npm 来合并安装依赖项
 * @param {*} param0
 * @param {*} ctx
 */
export async function installDependencies(
  {
    npmClient,
    registry,
    applyPlugins,
    ApplyPluginsType,
    paths,
    dryRun,
    spinner,
    skipDependencies,
    execa: selfExeca,
  }: any,
  ctx,
) {
  const exec = selfExeca || execa;

  // read project package.json
  const projectPkgPath = await applyPlugins({
    key: '_modifyBlockPackageJSONPath',
    type: ApplyPluginsType.modify || 'modify',
    initialValue: join(paths.cwd, 'package.json'),
  });

  // 判断 package.json 是否存在
  assert(existsSync(projectPkgPath), `No package.json found in your project`);

  // eslint-disable-next-line
  const projectPkg = require(projectPkgPath);

  // get _mock.js dependencie
  let mockDevDependencies = {};
  const mockFilePath = join(ctx.sourcePath, 'src/_mock.js');
  if (existsSync(mockFilePath)) {
    mockDevDependencies = getMockDependencies(
      readFileSync(mockFilePath, 'utf-8'),
      ctx.pkg,
    );
  }
  const allBlockDependencies = getAllBlockDependencies(
    ctx.templateTmpDirPath,
    ctx.pkg,
  );
  // 构造 _modifyBlockDependencies 的执行参数
  const initialValue = dependenciesConflictCheck(
    allBlockDependencies,
    projectPkg.dependencies,
    mockDevDependencies,
    {
      ...projectPkg.devDependencies,
      ...projectPkg.dependencies,
    },
  );
  // get conflict dependencies and lack dependencies
  const { conflicts, lacks, devConflicts, devLacks } = await applyPlugins({
    key: '_modifyBlockDependencies',
    type: ApplyPluginsType?.modify || 'modify',
    initialValue,
  });

  // find conflict dependencies throw error
  const allConflicts = [...conflicts, ...devConflicts];
  const ErrorInfo = allConflicts
    .map(
      (info) =>
        `* ${info[0]}: ${info[2]}(your project) not compatible with ${info[1]}(block)`,
    )
    .join('\n');
  // 如果有冲突，抛出错误流程结束。
  if (allConflicts.length) {
    throw new Error(
      `find dependencies conflict between block and your project:${ErrorInfo}`,
    );
  }

  // find lack conflict, auto install
  if (dryRun) {
    return;
  }

  if (skipDependencies) {
    // 中间层转化
    // [["react","16.5"]] => {"react":16.5}
    const dependencies = depsArrayToObject(lacks);
    const devDependencies = depsArrayToObject(devLacks);

    // 格式化 package.json
    const content = JSON.stringify(
      // sortPackageJson({
      {
        ...projectPkg,
        dependencies: { ...dependencies, ...projectPkg.dependencies },
        devDependencies: { ...devDependencies, ...projectPkg.devDependencies },
      },
      null,
      2,
    );
    // 写入文件
    writeFileSync(projectPkgPath, content);
    return;
  }

  // 安装依赖
  if (lacks.length) {
    const deps = lacks.map((dep) => `${dep[0]}@${dep[1]}`);
    spinner.start(
      `📦  Install additional dependencies ${deps.join(
        ',',
      )} with ${npmClient} --registry ${registry}`,
    );
    try {
      let npmArgs = npmClient.includes('yarn') ? ['add'] : ['install', '-d'];
      npmArgs = [...npmArgs, ...deps];

      // 安装区块的时候不需要安装 puppeteer, 因为 yarn 会全量安装一次所有依赖。
      // 加个环境变量规避一下
      await exec(
        npmClient,
        npmClient.includes('yarn') ? npmArgs : [...npmArgs],
        {
          cwd: dirname(projectPkgPath),
          env: {
            ...process.env,
            // ref  https://github.com/GoogleChrome/puppeteer/blob/411347cd7bb03edacf0854760712d32b0d9ba68f/docs/api.md#environment-variables
            PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true,
          },
        },
      );
    } catch (e) {
      spinner.fail();
      throw new Error(e);
    }
    spinner.succeed();
  }

  // 安装 dev 依赖
  if (devLacks.length) {
    // need skip devDependency which already install in dependencies
    const devDeps = devLacks
      .filter((dep) => !lacks.find((item) => item[0] === dep[0]))
      .map((dep) => `${dep[0]}@${dep[1]}`);
    spinner.start(
      `Install additional devDependencies ${devDeps.join(
        ',',
      )} with ${npmClient}  --registry ${registry}`,
    );
    try {
      let npmArgs = npmClient.includes('yarn') ? ['add'] : ['install'];
      npmArgs = [...npmArgs, ...devDeps];
      await exec(
        npmClient,
        npmClient.includes('yarn') ? npmArgs : [...npmArgs, '--save-dev'],
        {
          cwd: dirname(projectPkgPath),
        },
      );
    } catch (e) {
      spinner.fail();
      throw new Error(e);
    }
    spinner.succeed();
  }
}

export async function installFilesDependencies(
  {
    npmClient,
    registry,
    applyPlugins,
    ApplyPluginsType,
    paths,
    dryRun,
    spinner,
    execa: selfExeca,
  }: any,
  ctx,
) {
  const exec = selfExeca || execa;

  // read project package.json
  const projectPkgPath = await applyPlugins({
    key: '_modifyBlockPackageJSONPath',
    type: ApplyPluginsType.modify || 'modify',
    initialValue: join(paths.cwd, 'package.json'),
  });

  // 判断 package.json 是否存在
  assert(existsSync(projectPkgPath), `No package.json found in your project`);

  // eslint-disable-next-line
  const projectPkg = require(projectPkgPath);

  // get _mock.js dependencie
  const { dependencies: allBlockDependencies = {}, devDependencies = {} } =
    ctx.pkg;
  // 构造 _modifyBlockDependencies 的执行参数
  const initialValue = dependenciesConflictCheck(
    allBlockDependencies,
    projectPkg.dependencies,
    devDependencies,
    {
      ...projectPkg.devDependencies,
      ...projectPkg.dependencies,
    },
  );
  // get conflict dependencies and lack dependencies
  const { conflicts, lacks, devConflicts, devLacks } = await applyPlugins({
    key: '_modifyBlockDependencies',
    type: ApplyPluginsType?.modify || 'modify',
    initialValue,
  });

  // find conflict dependencies throw error
  const allConflicts = [...conflicts, ...devConflicts];
  const ErrorInfo = allConflicts
    .map(
      (info) =>
        `* ${info[0]}: ${info[2]}(your project) not compatible with ${info[1]}(block)`,
    )
    .join('\n');
  // 如果有冲突，抛出错误流程结束。
  if (allConflicts.length) {
    throw new Error(
      `find dependencies conflict between block and your project:${ErrorInfo}`,
    );
  }

  // find lack conflict, auto install
  if (dryRun) {
    return;
  }

  // 安装依赖
  if (lacks.length) {
    const deps = lacks.map((dep) => `${dep[0]}@${dep[1]}`);
    spinner.start(
      `📦  Install additional dependencies ${deps.join(
        ',',
      )} with ${npmClient} --registry ${registry}`,
    );
    try {
      let npmArgs = npmClient.includes('yarn') ? ['add'] : ['install', '-d'];
      npmArgs = [...npmArgs, ...deps, `--registry=${registry}`];

      // 安装区块的时候不需要安装 puppeteer, 因为 yarn 会全量安装一次所有依赖。
      // 加个环境变量规避一下
      await exec(
        npmClient,
        npmClient.includes('yarn') ? npmArgs : [...npmArgs, '--save'],
        {
          cwd: dirname(projectPkgPath),
          env: {
            ...process.env,
            // ref  https://github.com/GoogleChrome/puppeteer/blob/411347cd7bb03edacf0854760712d32b0d9ba68f/docs/api.md#environment-variables
            PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true,
          },
        },
      );
    } catch (e) {
      spinner.fail();
      throw new Error(e);
    }
    spinner.succeed();
  }

  // 安装 dev 依赖
  if (devLacks.length) {
    // need skip devDependency which already install in dependencies
    const devDeps = devLacks
      .filter((dep) => !lacks.find((item) => item[0] === dep[0]))
      .map((dep) => `${dep[0]}@${dep[1]}`);
    spinner.start(
      `Install additional devDependencies ${devDeps.join(
        ',',
      )} with ${npmClient}  --registry ${registry}`,
    );
    try {
      let npmArgs = npmClient.includes('yarn') ? ['add'] : ['install'];
      npmArgs = [...npmArgs, ...devDeps, `--registry=${registry}`];
      await exec(
        npmClient,
        npmClient.includes('yarn') ? npmArgs : [...npmArgs, '--save-dev'],
        {
          cwd: dirname(projectPkgPath),
        },
      );
    } catch (e) {
      spinner.fail();
      throw new Error(e);
    }
    spinner.succeed();
  }
}
