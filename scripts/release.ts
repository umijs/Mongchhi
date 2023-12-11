import { logger } from '@umijs/utils';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import 'zx/globals';
const ROOT = join(__dirname, '../');

export const PATHS = {
  ROOT,
  PACKAGES: join(ROOT, './packages'),
  EXAMPLES: join(ROOT, './examples'),
  LERNA_CONFIG: join(ROOT, './lerna.json'),
} as const;

export function getPkgs(opts?: { base?: string }): string[] {
  const base = opts?.base || PATHS.PACKAGES;
  return readdirSync(base).filter((dir) => {
    return !dir.startsWith('.') && existsSync(join(base, dir, 'package.json'));
  });
}
(async () => {
  const pkgs = getPkgs();
  const innerPkgs = pkgs.filter((pkg) => !['mongchhi'].includes(pkg));
  await Promise.all(
    innerPkgs.map(async (pkg) => {
      await $`cd packages/${pkg} && pnpm publish --no-git-checks`;
      logger.info(`+ ${pkg}`);
    }),
  );
  await $`cd packages/mongchhi && pnpm publish --no-git-checks`;
  logger.info(`+ mongchhi`);
})();
