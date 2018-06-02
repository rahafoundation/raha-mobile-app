import { combineReducers, Reducer } from "redux";
import { persistReducer, persistCombineReducers } from "redux-persist";
import AsyncStorage from "redux-persist/lib/storage";
import createSecureStore from "redux-persist-expo-securestore";
import immutableTransform from "redux-persist-transform-immutable";

import { reducer as apiCalls, ApiCallsState } from "./reducers/apiCalls";
import { reducer as members, MembersState } from "./reducers/members";
import { reducer as operations, OperationsState } from "./reducers/operations";

import {
  reducer as authentication,
  AuthenticationState
} from "./reducers/authentication";
import { RahaState, RahaAction } from ".";

// TODO: remove this once my redux-persist PR gets merged
// https://github.com/rt2zz/redux-persist/pull/834
const untypedPersistReducer: any = persistReducer;

const secureStorage = createSecureStore();

const baseConfig = {
  transforms: [immutableTransform()],
  storage: AsyncStorage
};
const secureConfig = {
  ...baseConfig,
  storage: secureStorage
};

const rootReducer: Reducer<RahaState> = combineReducers({
  apiCalls: untypedPersistReducer({ ...baseConfig, key: "apiCalls" }, apiCalls),
  members: untypedPersistReducer({ ...baseConfig, key: "members" }, members),
  operations: untypedPersistReducer(
    { ...baseConfig, key: "operations" },
    operations
  ),

  authentication: untypedPersistReducer(
    { ...secureConfig, key: "authentication" },
    authentication
  )
}) as any; // TODO: remove this type suggestion along with above PR
export { RahaState } from "./reducers";
export default rootReducer;
