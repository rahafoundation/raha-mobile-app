import { ApiCallError } from "./";
import { ApiCall } from "../../../node_modules/@raha/api/dist/shared/types/ApiEndpoint/ApiCall";

function apiCallToString(apiCall: ApiCall) {
  return `${apiCall.location.method}, ${apiCall.location.uri}`;
}

export class InvalidApiRequestError extends ApiCallError {
  public readonly endpoint: ApiCall;

  constructor(failedApiCall: ApiCall) {
    super(
      `${apiCallToString(failedApiCall)} ${
        "params" in failedApiCall.request
          ? `with params ${JSON.stringify(failedApiCall.request.params)}`
          : ""
      } failed.`
    );

    this.endpoint = failedApiCall;

    // this is necessary, typescript or not, for proper subclassing of builtins:
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // It is also necessary for any subclasses of this class, unfortunately.
    // TODO: once react-scripts 2.0 is out, we can use Babel Macros to do this automatically.
    // https://github.com/facebook/create-react-app/projects/3
    // https://github.com/loganfsmyth/babel-plugin-transform-builtin-extend
    Object.setPrototypeOf(this, InvalidApiRequestError.prototype);
  }
}
