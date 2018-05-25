import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "remote-redux-devtools";

import rootReducer, { RahaState } from "./reducers";
import { RahaAction } from "./actions";

export default () => {
  return createStore<RahaState, RahaAction, {}, {}>(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk))
  );
};

export { RahaState } from "./reducers";
export { RahaAction } from "./actions";
