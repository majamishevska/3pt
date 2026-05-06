const { getDefaultConfig } = require('expo/metro-config');

// Ensure `.svg` files can be required as assets.
// (We load their XML at runtime via expo-asset + fetch.)
const config = getDefaultConfig(__dirname);

config.resolver.assetExts = Array.from(new Set([...config.resolver.assetExts, 'svg']));

module.exports = config;

