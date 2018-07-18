import RNFirebase from "react-native-firebase";

import { config } from "./data/config";
import { Platform } from "react-native";

if (Platform.OS !== "android" && Platform.OS !== "ios") {
  throw new Error("Only supports android and ios");
}

export const app = RNFirebase.initializeApp(
  config.firebase[Platform.OS],
  "raha"
);
export const auth = app.auth();
export const storage = app.storage();
