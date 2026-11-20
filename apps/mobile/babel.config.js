module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 54) also configures the react-native-worklets / reanimated plugin.
    presets: ['babel-preset-expo'],
  };
};
