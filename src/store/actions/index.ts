import { ThunkAction } from "redux-thunk";
import { ActionCreator } from "redux";

import { ApiCallsAction } from "./apiCalls";
import { AuthenticationAction } from "./authentication";
import { MembersAction } from "./members";
import { OperationsAction } from "./operations";

import { RahaState } from "../reducers";
import { DropdownAction } from "./dropdown";

export type AsyncAction = ThunkAction<void, RahaState, void, RahaAction>;
export type AsyncActionCreator = ActionCreator<AsyncAction>;

export type RahaAction =
  | ApiCallsAction
  | AuthenticationAction
  | MembersAction
  | OperationsAction
  | DropdownAction;
