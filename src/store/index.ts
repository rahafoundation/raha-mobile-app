import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "remote-redux-devtools";
import { persistStore } from "redux-persist";

import rootReducer, { RahaState } from "./persistedReducer";
import { RahaAction } from "./actions";

export default () => {
  const store = createStore<RahaState, RahaAction, {}, {}>(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk))
  );
  return persistStore(store);
};

export { RahaState } from "./persistedReducer";
export { RahaAction } from "./actions";
