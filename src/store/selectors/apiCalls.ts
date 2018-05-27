import { ApiEndpoint } from "../../api";
import { ApiCallStatus } from "../reducers/apiCalls";
import { RahaState } from "../reducers";

/**
 * Gets the status of a previously made API call.
 * @returns If API call has been made, returns its status; otherwise, returns
 * null.
 */
export function getStatusOfApiCall(
  state: RahaState,
  endpoint: ApiEndpoint,
  identifier: string
): ApiCallStatus | undefined {
  const apiCallsForEndpoint = state.apiCalls[endpoint];
  if (apiCallsForEndpoint === undefined) {
    return undefined;
  }
  const apiCallStatus = apiCallsForEndpoint[identifier];
  if (apiCallStatus === undefined) {
    return undefined;
  }

  return apiCallStatus;
}
