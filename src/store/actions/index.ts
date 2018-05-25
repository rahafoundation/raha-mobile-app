import { ThunkAction } from "redux-thunk";
import { ActionCreator } from "redux";

import { ApiCallsAction } from "./apiCalls";
import { AuthenticationAction } from "./authentication";
import { MembersAction } from "./members";
import { OperationsAction } from "./operations";

import { AppState } from "../reducers";

export type AsyncAction = ThunkAction<void, AppState, void>;
export type AsyncActionCreator = ActionCreator<AsyncAction>;

export type RahaAction =
  | ApiCallsAction
  | AuthenticationAction
  | MembersAction
  | OperationsAction;
