const { join, dirname } = require('path');
const { writeFileSync, readFileSync } = require('fs');

try {
    const target = join(dirname(require.resolve('@umijs/bundler-webpack/package.json')), 'dist/server/server.js');
    const server = readFileSync(target, 'utf-8');
    // 先本地覆盖，后续等确定了用法，再从 umi 开接口
    server.replace('ws.wss.on("connection"', 'global.g_umi_ws = ws;\nws.wss.on("connection"');
    writeFileSync(target, server, 'utf-8')
    console.log("覆盖 umi 文件成功，生成全局对象 global.g_umi_ws。")
} catch (error) {
    console.log("覆盖 umi 文件失败，Mongchhi Socket 相关的功能无法使用。")
}
