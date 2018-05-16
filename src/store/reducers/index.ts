import { combineReducers } from "redux";
import { reducer as apiCalls, ApiCallsState } from "./apiCalls";
import { reducer as members, MembersState } from "./members";
import { reducer as operations, OperationsState } from "./operations";
import {
  reducer as authentication,
  AuthenticationState
} from "./authentication";

export interface AppState {
  apiCalls: ApiCallsState;
  members: MembersState;
  operations: OperationsState;
  authentication: AuthenticationState;
}

export default combineReducers<AppState>({
  apiCalls,
  members,
  operations,
  authentication
});
