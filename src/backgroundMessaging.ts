import firebase from "react-native-firebase";
import { RemoteMessage } from "react-native-firebase/messaging";

// Must return within 60 seconds.
// See: https://rnfirebase.io/docs/v4.3.x/messaging/receiving-messages#1)-Add-Service-to-Android-Manifest
export default async (message: RemoteMessage) => {
  return Promise.resolve();
};
