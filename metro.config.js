const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for Firebase .cjs files (fixes "Component auth has not been registered yet")
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false; // Add this line to fix Firebase auth resolution

module.exports = config;
