import "./src/setup";
import { AppRegistry } from "react-native";
import { Platform, YellowBox } from "react-native";

import { App } from "./src/components/App";
import backgroundMessaging from "./src/backgroundMessaging";

// This is not just me being lazy, it's react-native legacy code causing this
// warning:
// https://github.com/facebook/react-native/issues/18868#issuecomment-382671739
YellowBox.ignoreWarnings(["Warning: isMounted(...) is deprecated"]);

// We renamed the iOS app to "Raha" but since we initialized the app using
// react-native init, we have to keep Android as "mobile".
const appName = Platform.OS === "android" ? "mobile" : "Raha";
AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask(
  "RNFirebaseBackgroundMessage",
  () => backgroundMessaging
);
