import { AsyncStorage } from "react-native";
import { combineReducers, Reducer } from "redux";
import { persistReducer, PersistPartial } from "redux-persist";
import * as immutableTransform from "redux-persist-transform-immutable";

import { reducer as apiCalls } from "./reducers/apiCalls";
import { reducer as members } from "./reducers/members";
import { reducer as operations } from "./reducers/operations";
import { reducer as invitations } from "./reducers/invitations";
import { reducer as dropdown } from "./reducers/dropdown";

import { reducer as authentication } from "./reducers/authentication";
import { RahaState } from ".";
import { RahaAction } from "./actions";

export const rootReducer: Reducer<
  RahaState & PersistPartial,
  RahaAction
> = persistReducer(
  {
    storage: AsyncStorage,
    transforms: [immutableTransform()],
    // members uses immutable config, apiCalls doesn't need to be persisted
    blacklist: ["apiCalls", "dropdown"],
    key: "main"
  },
  combineReducers({
    apiCalls,
    members,
    operations,
    authentication,
    invitations,
    dropdown
  })
);
export { RahaState } from "./reducers";
