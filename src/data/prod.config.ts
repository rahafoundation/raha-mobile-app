export const config = {
  apiBase: "https://raha-5395e.appspot.com/api/",
  publicVideoBucket: "raha-video",
  firebase: {
    apiKey: "AIzaSyBXuACowZcLcr1wlhM53LHtibFwa59EmAY",
    authDomain: "app.raha.io",
    databaseURL: "https://raha-5395e.firebaseio.com",
    projectId: "raha-5395e",
    storageBucket: "raha-5395e.appspot.com",
    messagingSenderId: "677137485282"
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

export type Config = typeof config;
