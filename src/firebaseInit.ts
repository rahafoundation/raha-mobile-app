import * as firebase from "firebase";

import { config } from "./data/config";

export const app = firebase.initializeApp(config.firebase);
export const auth = app.auth();
