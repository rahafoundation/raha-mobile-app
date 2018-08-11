import { applyMiddleware, createStore } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, PersistPartial } from "redux-persist";

import { rootReducer, RahaState } from "./persistedReducer";
import { RahaAction } from "./actions";

export const store = createStore<
  RahaState & PersistPartial,
  RahaAction,
  {},
  {}
>(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
export const persistor = persistStore(store);

export { RahaState } from "./persistedReducer";
export { RahaAction } from "./actions";

export type RahaThunkDispatch = ThunkDispatch<RahaState, void, RahaAction>;
