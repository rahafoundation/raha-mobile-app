import { Config } from "./prod.config";

export const config: Config = {
  apiBase: "https://raha-test.appspot.com/api/",
  publicVideoBucket: "raha-video-test",
  // TODO: should this be different for test?
  hockeyAppId: "6121b83feab845e1b221a95984d3c12b",
  firebase: {
    ios: {
      apiKey: "AIzaSyAHiNHLSZROsuDmrxKd8c24RZRUJVhqia0",
      authDomain: "raha-test.firebaseapp.com",
      clientId:
        "148482003030-485q62hqnch3m2mnue1ps0jdl35ikg7a.apps.googleusercontent.com",
      databaseURL: "https://raha-test.firebaseio.com",
      projectId: "raha-test",
      storageBucket: "raha-test.appspot.com",
      messagingSenderId: "148482003030",
      appId: "1:148482003030:ios:4023b851b124d320",
      persistence: true
    },
    android: {
      clientId:
        "148482003030-ncmledf9fbsog8ie5s66rmf7ko2ljjjm.apps.googleusercontent.com",
      appId: "1:148482003030:android:4023b851b124d320",
      apiKey: "AIzaSyDD_VLTBbiSMIahCMQvDjSnbTJwkF8tb34",
      authDomain: "raha-test.firebaseapp.com",
      databaseURL: "https://raha-test.firebaseio.com",
      storageBucket: "raha-test.appspot.com",
      messagingSenderId: "148482003030",
      projectId: "raha-test",
      persistence: true
    },
    web: {
      clientId:
        "148482003030-ncmledf9fbsog8ie5s66rmf7ko2ljjjm.apps.googleusercontent.com"
    }
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
