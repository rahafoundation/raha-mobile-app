import firebase from "react-native-firebase";

import { config } from "./data/config";
import { Platform } from "react-native";

if (Platform.OS !== "android" && Platform.OS !== "ios") {
  throw new Error("Only supports android and ios");
}

function getApp() {
  if (Platform.OS !== "android") {
    return firebase.app();
  } else {  // TODO check if above also works for ios
    return firebase.initializeApp(
      config.firebase[Platform.OS],
      "raha"
    );
  }
}

export const app = getApp();
export const auth = app.auth();
export const storage = app.storage();
