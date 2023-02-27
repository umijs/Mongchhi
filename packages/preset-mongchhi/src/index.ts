export default function () {
  let plugins = [
    require.resolve("@mongchhi/plugin-mongchhi"),
    require.resolve("@mongchhi/plugin-socket"),
  ];
  return {
    plugins,
  };
}
