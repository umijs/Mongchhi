export default function () {
  let plugins = [
    require.resolve('@mongchhi/plugin-sdk'),
    require.resolve('@mongchhi/plugin-mongchhi'),
    require.resolve('@mongchhi/plugin-inject-ui'),
    require.resolve('@mongchhi/plugin-socket'),
    require.resolve('@mongchhi/plugin-antd-theme'),
  ];
  return {
    plugins,
  };
}
