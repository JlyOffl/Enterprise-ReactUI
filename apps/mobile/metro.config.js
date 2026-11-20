// Expo SDK 52+ detects npm workspaces automatically (watchFolders + nodeModulesPaths),
// so the shared @erui/core TypeScript sources are bundled directly.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
