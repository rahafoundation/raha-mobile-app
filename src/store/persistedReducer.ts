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

const rootReducer = combineReducers({
  apiCalls: persistReducer(
    { key: "apiCalls", storage: AsyncStorage },
    apiCalls
  ),
  members: persistReducer({ key: "members", storage: AsyncStorage }, members),
  operations: persistReducer(
    { key: "operations", storage: AsyncStorage },
    operations
  ),
  authentication: persistReducer(
    { key: "authentication", storage: secureStorage },
    authentication
  )
});
export type RahaState = ReturnType<typeof rootReducer>;
export default rootReducer;
