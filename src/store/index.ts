import { applyMiddleware, createStore, Middleware } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, PersistPartial } from "redux-persist";
import { Set as ImmutableSet, Map as ImmutableMap } from "immutable";

import { rootReducer, RahaState } from "./persistedReducer";
import { RahaAction } from "./actions";
import { analytics } from "../firebaseInit";
import { ApiCallsActionType } from "./actions/apiCalls";
import {
  FirebaseAuthActionType,
  PhoneLogInActionType
} from "./actions/authentication";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

// Analytics event names
const ACTIVE_OPERATION_CREATOR = "ACTIVE_OPERATION_CREATOR";
export const VIEW_WEB_LINK = "VIEW_WEB_LINK";

const API_CALL_LOGGED_PROPS = ImmutableSet(["endpoint"]);

const ACTION_TYPES_TO_LOGGED_PROPS = ImmutableMap([
  [ApiCallsActionType.STARTED, API_CALL_LOGGED_PROPS],
  [ApiCallsActionType.SUCCESS, API_CALL_LOGGED_PROPS],
  [ApiCallsActionType.FAILURE, API_CALL_LOGGED_PROPS]
]) as ImmutableMap<string, ImmutableSet<string>>;

const ACTION_TYPES_TO_LOG = ImmutableSet([
  ...Object.values(PhoneLogInActionType),
  ...Object.values(FirebaseAuthActionType)
]);

const ACTIVATE_OPERATIONS = ImmutableSet([
  ApiEndpointName.SEND_INVITE,
  ApiEndpointName.GIVE,
  ApiEndpointName.MINT,
  ApiEndpointName.VERIFY_MEMBER,
  ApiEndpointName.TRUST_MEMBER
]);

function isActivateOpCreator(action: RahaAction) {
  return (
    action.type === ApiCallsActionType.SUCCESS &&
    ACTIVATE_OPERATIONS.has(action.endpoint)
  );
}

const logger: Middleware = store => next => action => {
  let logged_props = ACTION_TYPES_TO_LOGGED_PROPS.get(action.type);
  const event = action.type && action.type.replace(".", "_");
  if (logged_props) {
    const params = logged_props.reduce(
      (obj, key) => ({ ...obj, [key]: action[key] }),
      {}
    );
    analytics.logEvent(event, params);
  } else if (ACTION_TYPES_TO_LOG.has(action.type)) {
    analytics.logEvent(event);
  }
  if (isActivateOpCreator(action)) {
    analytics.logEvent(ACTIVE_OPERATION_CREATOR);
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
