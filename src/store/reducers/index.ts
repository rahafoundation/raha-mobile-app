import { combineReducers } from "redux";

import { reducer as apiCalls } from "./apiCalls";
import { reducer as members } from "./members";
import { reducer as operations } from "./operations";

import { reducer as authentication } from "./authentication";

const rootReducer = combineReducers({
  apiCalls,
  members,
  operations,
  authentication
});
export type RahaState = ReturnType<typeof rootReducer>;
export default rootReducer;
