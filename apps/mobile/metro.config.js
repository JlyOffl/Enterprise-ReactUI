// Expo SDK 52+ detects npm workspaces automatically (watchFolders + nodeModulesPaths),
// so the shared @erui/core TypeScript sources are bundled directly.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Monorepo guard: the web app and the mobile app can end up with different React versions.
// Always resolve these packages from the mobile app's point of view so @erui/core (which lives
// outside apps/mobile) never loads a second copy of React ("Invalid hook call").
const SINGLETONS = ['react', 'react-native', 'react-redux', 'react-i18next', 'react-hook-form', 'i18next'];
const appEntry = path.join(__dirname, 'index.ts');
const upstreamResolve = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isSingleton = SINGLETONS.some((s) => moduleName === s || moduleName.startsWith(`${s}/`));
  if (isSingleton) {
    return context.resolveRequest({ ...context, originModulePath: appEntry }, moduleName, platform);
  }
  return upstreamResolve
    ? upstreamResolve(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
