import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";

import rootReducer from "./reducers";

export default () => {
  return createStore(rootReducer, applyMiddleware(thunk));
};

export { AppState } from "./reducers";
