import * as firebase from "firebase";

import CONFIG from "./data/config";

export const app = firebase.initializeApp(CONFIG.firebase);
export const auth = app.auth();
