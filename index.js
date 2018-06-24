import "./src/setup";
import { AppRegistry } from "react-native";
import { YellowBox } from "react-native";

import { App } from "./src/components/App";

// This is not just me being lazy, it's react-native legacy code causing this
// warning:
// https://github.com/facebook/react-native/issues/18868#issuecomment-382671739
YellowBox.ignoreWarnings(["Warning: isMounted(...) is deprecated"]);

AppRegistry.registerComponent("mobile", () => App);
