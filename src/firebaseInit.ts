import firebase from "react-native-firebase";

import { config } from "./data/config";
import { Platform } from "react-native";

if (Platform.OS !== "android" && Platform.OS !== "ios") {
  throw new Error("Only supports android and ios");
}

export const app = firebase.initializeApp(config.firebase[Platform.OS], "raha");
// export const app = firebase;
export const auth = app.auth();
export const storage = app.storage();
