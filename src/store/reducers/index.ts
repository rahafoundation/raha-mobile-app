import { combineReducers } from "redux";

import { reducer as apiCalls, ApiCallsState } from "./apiCalls";
import { reducer as members, MembersState } from "./members";
import { reducer as operations, OperationsState } from "./operations";

import {
  reducer as authentication,
  AuthenticationState
} from "./authentication";

const rootReducer = combineReducers({
  apiCalls,
  members,
  operations,
  authentication
});
export type RahaState = ReturnType<typeof rootReducer>;
export default rootReducer;
