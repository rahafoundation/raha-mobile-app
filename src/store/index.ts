import { applyMiddleware, createStore } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import { composeWithDevTools } from "remote-redux-devtools";
import { persistStore } from "redux-persist";

import rootReducer, { RahaState } from "./persistedReducer";
import { RahaAction } from "./actions";

export const store = createStore<RahaState, RahaAction, {}, {}>(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);
export const persistor = persistStore(store);

export { RahaState } from "./persistedReducer";
export { RahaAction } from "./actions";

export type RahaThunkDispatch = ThunkDispatch<RahaState, void, RahaAction>;
