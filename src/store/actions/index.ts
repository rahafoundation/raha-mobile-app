import { ThunkAction } from "redux-thunk";
import { ActionCreator } from "redux";

import { ApiCallsAction } from "./apiCalls";
import { AuthenticationAction } from "./authentication";
import { MembersAction } from "./members";
import { OperationsAction } from "./operations";

import { RahaState } from "../reducers";

export type AsyncAction = ThunkAction<void, RahaState, void, RahaAction>;
export type AsyncActionCreator = ActionCreator<AsyncAction>;

export type RahaAction =
  | ApiCallsAction
  | AuthenticationAction
  | MembersAction
  | OperationsAction;
