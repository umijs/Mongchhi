const { join, dirname } = require('path');
const { writeFileSync, readFileSync } = require('fs');

try {
    const target = join(dirname(require.resolve('@umijs/bundler-webpack/package.json')), 'dist/server/server.js');
    const server = readFileSync(target, 'utf-8');
    if (server.includes('global.g_umi_ws')) {
        console.log("umi 已经拥有全局对象 global.g_umi_ws，无需重复覆盖");
        return;
    }
    console.log(target);
    // 先本地覆盖，后续等确定了用法，再从 umi 开接口
    const s = server.replace('ws.wss.on("connection"', 'global.g_umi_ws = ws;\nws.wss.on("connection"');
    writeFileSync(target, s, 'utf-8');
    console.log("覆盖 umi 文件成功，生成全局对象 global.g_umi_ws。");
} catch (error) {
    console.log("覆盖 umi 文件失败，Mongchhi Socket 相关的功能无法使用。");
}
