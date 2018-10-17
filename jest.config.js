const { jestPreset: tsJest } = require("ts-jest");

module.exports = {
  ...tsJest,
  preset: "react-native",
  transform: {
    ...tsJest.transform,
    "\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js"
  },
  globals: {
    "ts-jest": {
      babelConfig: true,
      tsConfig: "tsconfig.test.json"
    }
  },
  cacheDirectory: ".jest/cache",
  testMatch: ["**/src/**/*.test.ts?(x)"],
  // For any code with react-native dependencies that you don't mock out
  // entirely using jest.mock() in a setup file, you need to tell jest to ignore
  // them, since native code won't be present when running jest in the terminal.
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|react-navigation-tabs|react-native-vector-icons|react-native-paper|react-navigation-tabs|react-native-elements|react-native-video-processing|react-native-video|react-navigation|react-native-country-picker-modal|react-native-safe-area-view|react-native-device-info|react-native-dropdownalert|react-native-camera|react-native-code-push|react-native-branch|react-native-keyboard-aware-scroll-view|react-native-iphone-x-helper|react-native-svg|react-native-app-settings|react-native-modal)/)"
  ],
  setupFiles: [
    "<rootDir>/scripts/jest/setup",
    "<rootDir>/scripts/jest/mockBranch",
    "<rootDir>/scripts/jest/mockReactNativeVectorIcons",
    "<rootDir>/scripts/jest/mockReactNativeVideoProcessing",
    "<rootDir>/node_modules/appcenter/test/AppCenterMock.js"
  ]
};
