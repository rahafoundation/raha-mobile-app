export const config = {
  apiBase: "https://raha-5395e.appspot.com/api/",
  publicVideoBucket: "raha-video",
  firebase: {
    ios: {
      apiKey: "AIzaSyCMp31nMIR5KMJegtRIVT3y7aX71sadysY",
      authDomain: "app.raha.io",
      clientId:
        "677137485282-hei8t5jm6c67kpqk4objefcrlk4bhuqd.apps.googleusercontent.com",
      databaseURL: "https://raha-5395e.firebaseio.com",
      projectId: "raha-5395e",
      storageBucket: "raha-5395e.appspot.com",
      messagingSenderId: "677137485282",
      appId: "1:677137485282:ios:4023b851b124d320",
      persistence: true
    },
    android: {
      clientId:
        "677137485282-o8enpde66k4rdppkmemh9k7l8gu71sbi.apps.googleusercontent.com",
      appId: "1:677137485282:android:4023b851b124d320",
      authDomain: "app.raha.io",
      apiKey: "AIzaSyBvR-LBe_hWy-HzyE1X4OkbEyALOr7COzo",
      databaseURL: "https://raha-5395e.firebaseio.com",
      storageBucket: "raha-5395e.appspot.com",
      messagingSenderId: "677137485282",
      projectId: "raha-5395e",
      persistence: true
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

export type Config = typeof config;
