import { combineReducers } from "redux";
import loggedInUser, { State as LoggedInUserState } from "./loggedInUser";

export type AppState = {
  loggedInUser: LoggedInUserState;
};
export default combineReducers({ loggedInUser });
