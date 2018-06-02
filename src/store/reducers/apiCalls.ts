import { Reducer } from "redux";
import { ApiEndpoint } from "../../api";
import { ApiCallsAction, ApiCallsActionType } from "../actions/apiCalls";
import { Map } from "immutable";

export enum ApiCallStatusType {
  STARTED = "STARTED",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE"
}

export interface ApiCallStatus {
  status: ApiCallStatusType;
}

// call identifier => status of that call
type ApiEndpointState = Map<string, ApiCallStatus>;
export type ApiCallsState = Map<ApiEndpoint, ApiEndpointState>;

export const reducer: Reducer<ApiCallsState> = (
  prevState = Map(),
  untypedAction
) => {
  const action = untypedAction as ApiCallsAction;
  let status: ApiCallStatusType;
  switch (action.type) {
    default:
      return prevState;
    case ApiCallsActionType.STARTED:
      status = ApiCallStatusType.STARTED;
      break;
    case ApiCallsActionType.SUCCESS:
      status = ApiCallStatusType.SUCCESS;
      break;
    case ApiCallsActionType.FAILURE:
      status = ApiCallStatusType.FAILURE;
      break;
  }

  return prevState.update(action.endpoint, Map(), endpointCalls =>
    endpointCalls.set(action.identifier, { status })
  );
};
