import * as firebase from "firebase";

// tslint:disable-next-line:no-var-requires
const CONFIG = require("./data/config.json");

export const app = firebase.initializeApp(CONFIG.firebase);
export const auth = app.auth();
