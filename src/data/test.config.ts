import { Config } from "./prod.config";

export const config: Config = {
  apiBase: "https://raha-test.appspot.com/api/",
  publicVideoBucket: "raha-video-test",
  firebase: {
    apiKey: "AIzaSyDz4sg33FdGUEAawsbnJDf6GKs8TPt5inU",
    authDomain: "raha-test.firebaseapp.com",
    databaseURL: "https://raha-test.firebaseio.com",
    projectId: "raha-test",
    storageBucket: "raha-test.appspot.com",
    messagingSenderId: "148482003030"
  },
  facebook: {
    appId: "239560396587704"
  },
  google: {
    iosClientId:
      "677137485282-ftos44jfp2o4i3ploairco6cetttqsvl.apps.googleusercontent.com",
    iosStandaloneAppClientId:
      "677137485282-hei8t5jm6c67kpqk4objefcrlk4bhuqd.apps.googleusercontent.com",
    androidClientId:
      "677137485282-2g6r9kmr0h3gbc7tinpgvjjdeop1s0vh.apps.googleusercontent.com",
    androidStandaloneAppClientId:
      "677137485282-ovig7bombpsb76s67hi2tmb9m8c66igr.apps.googleusercontent.com"
  }
};
