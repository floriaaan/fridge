// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const path = require("path");

const projectRoot = __dirname;
config.resolver.alias = {
  "@": path.resolve(projectRoot, "src"),
};

config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: "./assets/global.css" });
