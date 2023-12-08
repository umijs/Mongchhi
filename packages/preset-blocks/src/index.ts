export default function () {
  let plugins = [
    require.resolve('@mongchhi/plugin-sdk'),
    require.resolve('@mongchhi/plugin-socket'),
    require.resolve('@mongchhi/plugin-blocks'),
  ];
  return {
    plugins,
  };
}
