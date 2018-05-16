import { ThunkAction } from "redux-thunk";
import { AppState } from "../reducers";
import { ActionCreator } from "react-redux";

export type AsyncAction = ThunkAction<void, AppState, void>;
export type AsyncActionCreator = ActionCreator<AsyncAction>;
