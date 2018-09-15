import { combineReducers } from "redux";

import { reducer as apiCalls } from "./apiCalls";
import { reducer as members } from "./members";
import { reducer as operations } from "./operations";
import { reducer as invitations } from "./invitations";
import { reducer as dropdown } from "./dropdown";
import { reducer as authentication } from "./authentication";

export const rootReducer = combineReducers({
  apiCalls,
  members,
  operations,
  invitations,
  authentication,
  dropdown
});
export type RahaState = ReturnType<typeof rootReducer>;
