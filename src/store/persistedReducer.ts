import { combineReducers, Reducer } from "redux";
import { persistReducer } from "redux-persist";
import createSecureStore from "redux-persist-expo-securestore";
import immutableTransform from "redux-persist-transform-immutable";

import { reducer as apiCalls } from "./reducers/apiCalls";
import { reducer as members } from "./reducers/members";
import { reducer as operations } from "./reducers/operations";

import { reducer as authentication } from "./reducers/authentication";
import { RahaState } from ".";
import { AsyncStorage } from "react-native";

// TODO: remove this once my redux-persist PR gets merged
// https://github.com/rt2zz/redux-persist/pull/834
const untypedPersistReducer: any = persistReducer;

const secureStorage = createSecureStore();

const baseConfig = {
  storage: AsyncStorage
};
const secureConfig = {
  ...baseConfig,
  storage: secureStorage
};

export const rootReducer: Reducer<RahaState> = persistReducer(
  {
    transforms: [immutableTransform()],
    // members and authentication have their own config, apiCalls doesn't need to be persisted
    blacklist: ["members", "authentication", "apiCalls"],
    key: "main",
    ...baseConfig
  },
  combineReducers({
    apiCalls: apiCalls,
    members: untypedPersistReducer(
      { ...baseConfig, key: "members", transforms: [immutableTransform()] },
      members
    ),
    operations: operations,

    authentication: untypedPersistReducer(
      { ...secureConfig, key: "authentication" },
      authentication
    )
  }) as any
); // TODO: remove this type suggestion along with above PR
export { RahaState } from "./reducers";
