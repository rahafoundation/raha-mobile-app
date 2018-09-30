import { applyMiddleware, createStore, Middleware } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, PersistPartial } from "redux-persist";
import { Set as ImmutableSet, Map as ImmutableMap } from "immutable";

import { rootReducer, RahaState } from "./persistedReducer";
import { RahaAction } from "./actions";
import { analytics } from "../firebaseInit";
import { ApiCallsActionType } from "./actions/apiCalls";

const API_CALL_LOGGED_PROPS = ImmutableSet(["endpoint"]);

const ACTION_TYPES_TO_LOGGED_PROPS = ImmutableMap([
  [ApiCallsActionType.STARTED, API_CALL_LOGGED_PROPS],
  [ApiCallsActionType.SUCCESS, API_CALL_LOGGED_PROPS],
  [ApiCallsActionType.FAILURE, API_CALL_LOGGED_PROPS]
]) as ImmutableMap<string, ImmutableSet<string>>;

const logger: Middleware = store => next => action => {
  let logged_props = ACTION_TYPES_TO_LOGGED_PROPS.get(action.type);
  if (!!logged_props) {
    const to_log = Object.keys(action)
      .filter(key => logged_props && logged_props.has(key))
      .reduce((obj, key) => ({ ...obj, [key]: action[key] }), {});
    const event = action.type.replace(".", "_");
    analytics.logEvent(event, to_log);
  }
  return next(action);
};

export const store = createStore<
  RahaState & PersistPartial,
  RahaAction,
  {},
  {}
>(rootReducer, composeWithDevTools(applyMiddleware(thunk, logger)));
export const persistor = persistStore(store);

export { RahaState } from "./persistedReducer";
export { RahaAction } from "./actions";

export type RahaThunkDispatch = ThunkDispatch<RahaState, void, RahaAction>;
