import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "remote-redux-devtools";

import rootReducer from "./reducers";

export default () => {
  return createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
};

export { AppState } from "./reducers";
