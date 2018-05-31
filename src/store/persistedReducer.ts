import { combineReducers } from "redux";
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

const secureStorage = createSecureStore();

const baseConfig = {
  transforms: [immutableTransform()],
  storage: AsyncStorage
};
const secureConfig = {
  ...baseConfig,
  storage: secureStorage
};

const rootReducer = combineReducers({
  apiCalls: persistReducer({ ...baseConfig, key: "apiCalls" }, apiCalls),
  members: persistReducer({ ...baseConfig, key: "members" }, members),
  operations: persistReducer({ ...baseConfig, key: "operations" }, operations),

  authentication: persistReducer(
    { ...secureConfig, key: "authentication" },
    authentication
  )
});
export type RahaState = ReturnType<typeof rootReducer>;
export default rootReducer;
